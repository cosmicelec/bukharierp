import prisma from '@/lib/prisma';
import { checkAndDispatchWhatsAppAlert } from './alert-service';

export async function deductStock(params: {
  productId: string;
  locationId: string;
  quantity: number;
}) {
  const stock = await prisma.inventoryStock.findUnique({
    where: {
      productId_locationId: {
        productId: params.productId,
        locationId: params.locationId,
      },
    },
    include: {
      product: true,
      location: true,
    },
  });

  if (!stock) {
    throw new Error(`No stock record found for product at this location.`);
  }

  const available = stock.quantityOnHand - stock.quantityAllocated;
  if (available < params.quantity) {
    throw new Error(
      `Insufficient stock. Available: ${available}, Requested: ${params.quantity}`
    );
  }

  const updatedStock = await prisma.inventoryStock.update({
    where: {
      productId_locationId: {
        productId: params.productId,
        locationId: params.locationId,
      },
    },
    data: {
      quantityOnHand: { decrement: params.quantity },
    },
    include: {
      product: true,
      location: true,
    },
  });

  // Automated background threshold check: trigger WhatsApp alert if stock drops to or below threshold
  if (updatedStock.quantityOnHand <= updatedStock.product.minStockAlert) {
    checkAndDispatchWhatsAppAlert({
      productId: updatedStock.productId,
      productName: updatedStock.product.name,
      sku: updatedStock.product.sku,
      currentStock: updatedStock.quantityOnHand,
      threshold: updatedStock.product.minStockAlert,
      locationCode: updatedStock.location.locationCode,
    }).catch((e) => console.warn('Background WhatsApp alert failed:', e));
  }

  return updatedStock;
}

export async function getLowStockAlerts() {
  const stocks = await prisma.inventoryStock.findMany({
    include: {
      product: true,
      location: true,
    },
  });

  return stocks.filter(
    (s) => s.quantityOnHand <= s.product.minStockAlert
  );
}

export async function getStockByLocation(locationId: string) {
  return prisma.inventoryStock.findMany({
    where: { locationId },
    include: {
      product: true,
      location: true,
    },
  });
}

export async function getStockByProduct(productId: string) {
  return prisma.inventoryStock.findMany({
    where: { productId },
    include: {
      product: true,
      location: true,
    },
  });
}

export async function addStock(params: {
  productId: string;
  locationId: string;
  quantity: number;
}) {
  return await prisma.inventoryStock.upsert({
    where: {
      productId_locationId: {
        productId: params.productId,
        locationId: params.locationId,
      },
    },
    update: {
      quantityOnHand: { increment: params.quantity },
    },
    create: {
      productId: params.productId,
      locationId: params.locationId,
      quantityOnHand: params.quantity,
      quantityAllocated: 0,
    },
  });
}
