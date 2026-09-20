'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// === DASHBOARD STATS ===

export async function getDashboardStats() {
  const [productCount, clientCount, chitCount, lowStockCount] =
    await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.client.count({ where: { isActive: true } }),
      prisma.chit.count(),
      prisma.inventoryStock.findMany({ include: { product: true } }).then(
        (stocks: any[]) => stocks.filter((s) => s.quantityOnHand <= s.product.minStockAlert).length
      ),
    ]);

  const unpaidChits = await prisma.chit.findMany({
    where: { status: { not: 'PAID' } },
    include: { client: true },
    orderBy: { dueDate: 'asc' },
  });

  const totalOutstanding = unpaidChits.reduce((acc: number, chit: any) => acc + (chit.totalAmount - chit.paidAmount), 0);
  const totalRevenue = await prisma.chit.aggregate({
    _sum: { totalAmount: true },
  });

  return {
    productCount,
    clientCount,
    chitCount,
    lowStockCount,
    unpaidChits,
    totalOutstanding,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
  };
}