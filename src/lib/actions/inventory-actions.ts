'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getLowStockAlerts, addStock } from '@/lib/services/inventory-service';

export async function getLocations() {
  return prisma.warehouseLocation.findMany({
    where: { isActive: true },
    orderBy: [{ floorCode: 'asc' }, { sectionAisle: 'asc' }, { rackShelf: 'asc' }],
  });
}

export async function getAllLocations() {
  return prisma.warehouseLocation.findMany({
    orderBy: [{ floorCode: 'asc' }, { sectionAisle: 'asc' }, { rackShelf: 'asc' }],
  });
}

export async function createLocation(data: {
  warehouseName: string;
  floorCode: string;
  floorName: string;
  sectionAisle: string;
  rackShelf: string;
  locationCode: string;
}) {
  const location = await prisma.warehouseLocation.create({ data });
  revalidatePath('/inventory');
  revalidatePath('/admin');
  return location;
}

export async function updateLocation(
  id: string,
  data: {
    warehouseName?: string;
    floorCode?: string;
    floorName?: string;
    sectionAisle?: string;
    rackShelf?: string;
    isActive?: boolean;
  }
) {
  const location = await prisma.warehouseLocation.update({
    where: { id },
    data,
  });
  revalidatePath('/inventory');
  revalidatePath('/admin');
  return location;
}

export async function getInventoryStock() {
  return prisma.inventoryStock.findMany({
    include: {
      product: true,
      location: true,
    },
    orderBy: [{ location: { floorCode: 'asc' } }],
  });
}

export async function getLowStockItems() {
  return getLowStockAlerts();
}

export async function addStockAction(data: {
  productId: string;
  locationId: string;
  quantity: number;
}) {
  const result = await addStock(data);
  revalidatePath('/inventory');
  return result;
}
