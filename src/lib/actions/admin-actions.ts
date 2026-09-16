'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// === TAX CONFIGURATION CRUD ===

export async function getTaxConfigurations() {
  return prisma.taxConfiguration.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getActiveTaxRate(taxName: string) {
  return prisma.taxConfiguration.findFirst({
    where: {
      taxName,
      isActive: true,
    },
    orderBy: { effectiveFrom: 'desc' },
  });
}

export async function createTaxConfiguration(data: {
  taxName: string;
  taxRatePercent: number;
  effectiveFrom: string;
  effectiveTo?: string;
  description?: string;
}) {
  const config = await prisma.taxConfiguration.create({
    data: {
      taxName: data.taxName,
      taxRatePercent: data.taxRatePercent,
      effectiveFrom: new Date(data.effectiveFrom),
      effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
      description: data.description || null,
    },
  });
  revalidatePath('/admin');
  return config;
}

export async function updateTaxConfiguration(
  id: string,
  data: {
    taxRatePercent?: number;
    isActive?: boolean;
    effectiveTo?: string;
    description?: string;
  }
) {
  const config = await prisma.taxConfiguration.update({
    where: { id },
    data: {
      ...data,
      effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
    },
  });
  revalidatePath('/admin');
  return config;
}

export async function deleteTaxConfiguration(id: string) {
  await prisma.taxConfiguration.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath('/admin');
}

// === DASHBOARD STATS ===

export async function getDashboardStats() {
  const [productCount, clientCount, contractCount, invoiceCount, lowStockCount, pendingFbr] =
    await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.client.count({ where: { isActive: true } }),
      prisma.tenderContract.count({ where: { status: 'WON_LOCKED' } }),
      prisma.invoice.count(),
      prisma.inventoryStock.findMany({ include: { product: true } }).then(
        (stocks) => stocks.filter((s) => s.quantityOnHand <= s.product.minStockAlert).length
      ),
      prisma.invoice.count({ where: { fbrSyncStatus: 'PENDING' } }),
    ]);

  const recentInvoices = await prisma.invoice.findMany({
    take: 5,
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  });

  const totalRevenue = await prisma.invoice.aggregate({
    _sum: { grandTotalPayable: true },
    where: { status: { not: 'CANCELLED' } },
  });

  return {
    productCount,
    clientCount,
    contractCount,
    invoiceCount,
    lowStockCount,
    pendingFbr,
    recentInvoices,
    totalRevenue: totalRevenue._sum.grandTotalPayable || 0,
  };
}
