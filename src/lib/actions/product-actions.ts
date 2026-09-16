'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    include: { uomConversions: true },
    orderBy: { name: 'asc' },
  });
}

export async function getAllProducts() {
  return prisma.product.findMany({
    include: { uomConversions: true },
    orderBy: { name: 'asc' },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { uomConversions: true, inventoryStocks: { include: { location: true } } },
  });
}

export async function createProduct(data: {
  sku: string;
  name: string;
  brand: string;
  hsCode: string;
  baseUom: string;
  baseCost: number;
  standardRetailPrice: number;
  standardGstPercent?: number;
  minStockAlert?: number;
}) {
  const product = await prisma.product.create({
    data: {
      sku: data.sku,
      name: data.name,
      brand: data.brand,
      hsCode: data.hsCode,
      baseUom: data.baseUom,
      baseCost: data.baseCost,
      standardRetailPrice: data.standardRetailPrice,
      standardGstPercent: data.standardGstPercent ?? 18.0,
      minStockAlert: data.minStockAlert ?? 50,
    },
  });
  revalidatePath('/admin');
  revalidatePath('/tender-calculator');
  return product;
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    brand?: string;
    hsCode?: string;
    baseUom?: string;
    baseCost?: number;
    standardRetailPrice?: number;
    standardGstPercent?: number;
    minStockAlert?: number;
    isActive?: boolean;
  }
) {
  const product = await prisma.product.update({
    where: { id },
    data,
  });
  revalidatePath('/admin');
  revalidatePath('/tender-calculator');
  return product;
}

export async function deleteProduct(id: string) {
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath('/admin');
}
