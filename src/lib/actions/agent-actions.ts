'use server';

import prisma from '@/lib/prisma';
import { addStockAction } from './inventory-actions';
import { recordPayment } from './chit-actions';

export async function agentCheckStock(productName: string) {
  const stock = await prisma.inventoryStock.findFirst({
    where: { product: { name: { contains: productName } } },
    include: { product: true, location: true },
  });

  if (!stock) return `I could not find any stock records for "${productName}".`;

  return `Found ${stock.product.name}. We have ${stock.quantityOnHand} units located at ${stock.location.floorName}, ${stock.location.sectionAisle}, ${stock.location.rackShelf}.`;
}

export async function agentUpdateInventory(productName: string, delta: number) {
  const stock = await prisma.inventoryStock.findFirst({
    where: { product: { name: { contains: productName } } },
    include: { product: true },
  });

  if (!stock) return `Error: Could not find product matching "${productName}".`;

  await addStockAction({
    productId: stock.productId,
    locationId: stock.locationId,
    quantity: delta,
  });

  const actionWord = delta >= 0 ? 'added' : 'deducted';
  return `Inventory updated for ${stock.product.name}. Successfully ${actionWord} ${Math.abs(delta)} units.`;
}

export async function agentCheckUnpaidDues(clientName: string) {
  const client = await prisma.client.findFirst({
    where: { name: { contains: clientName } },
    include: {
      chits: {
        where: { status: { not: 'PAID' } }
      }
    }
  });

  if (!client) return `I could not find a client matching "${clientName}".`;

  if (client.chits.length === 0) {
    return `${client.name} has no unpaid chits. Their account is fully settled.`;
  }

  const chitNumbers = client.chits.map(c => c.chitNumber).join(', ');
  return `${client.name} has an outstanding balance of Rs ${client.totalOutstandingBalance}. This spans across ${client.chits.length} unpaid chits: ${chitNumbers}.`;
}

export async function agentRecordChitPayment(chitNumber: string, amount: number) {
  const chit = await prisma.chit.findFirst({
    where: { chitNumber: { contains: chitNumber } }
  });

  if (!chit) return `Could not find a chit matching number "${chitNumber}".`;

  await recordPayment(chit.id, amount, 'CASH');
  
  return `Successfully recorded a cash payment of Rs ${amount} against Chit #${chit.chitNumber}.`;
}

export async function agentGetWarehouseSummary() {
  const stocks = await prisma.inventoryStock.findMany({
    include: { product: true }
  });
  if (stocks.length === 0) return 'The warehouse is currently empty.';
  const totalItems = stocks.reduce((sum: number, s: any) => sum + s.quantityOnHand, 0);
  const lowStock = stocks.filter((s: any) => s.quantityOnHand <= s.product.minStockAlert);
  let summary = `You have a total of ${totalItems} physical units currently stored in the warehouse across ${stocks.length} active SKUs. `;
  if (lowStock.length > 0) {
    summary += `WARNING: You have ${lowStock.length} items running dangerously low (including ${lowStock[0].product.name}).`;
  } else {
    summary += 'All stock levels are perfectly healthy.';
  }
  return summary;
}

export async function agentListProducts() {
  const products = await prisma.product.findMany({ select: { name: true } });
  if (products.length === 0) return 'There are no products registered in the database yet.';
  const names = products.map((p: any) => p.name).join(', ');
  return `Here are the products we currently carry: ${names}.`;
}