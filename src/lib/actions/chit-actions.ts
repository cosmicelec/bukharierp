'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createChit(data: any) {
  const chit = await prisma.chit.create({
    data: {
      chitNumber: data.chitNumber,
      clientId: data.clientId,
      issuingOfficer: data.issuingOfficer,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      totalAmount: data.totalAmount,
      imagePath: data.imagePath,
      rawOcrText: data.rawOcrText,
      items: {
        create: data.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          pickedLocationId: item.pickedLocationId,
        })),
      },
    },
  });

  // Deduct inventory
  for (const item of data.items) {
    const stock = await prisma.inventoryStock.findFirst({
      where: { productId: item.productId, locationId: item.pickedLocationId },
    });
    if (stock) {
      await prisma.inventoryStock.update({
        where: { id: stock.id },
        data: { quantityOnHand: stock.quantityOnHand - item.quantity },
      });
    }
  }

  revalidatePath('/chits');
  revalidatePath('/inventory');
  revalidatePath('/');
  return chit;
}

export async function getChits() {
  return await prisma.chit.findMany({
    include: {
      client: true,
      items: { include: { product: true } },
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function recordPayment(chitId: string, amount: number, method: string) {
  const chit = await prisma.chit.findUnique({ where: { id: chitId } });
  if (!chit) throw new Error('Chit not found');

  const payment = await prisma.payment.create({
    data: {
      chitId,
      amountPaid: amount,
      paymentMethod: method,
    },
  });

  const newPaidAmount = chit.paidAmount + amount;
  const newStatus = newPaidAmount >= chit.totalAmount ? 'PAID' : 'PARTIALLY_PAID';

  await prisma.chit.update({
    where: { id: chitId },
    data: {
      paidAmount: newPaidAmount,
      status: newStatus,
    },
  });

  // Update client total outstanding
  const client = await prisma.client.findUnique({ where: { id: chit.clientId } });
  if (client) {
    await prisma.client.update({
      where: { id: client.id },
      data: { totalOutstandingBalance: client.totalOutstandingBalance - amount },
    });
  }

  revalidatePath('/chits');
  revalidatePath('/');
  return payment;
}