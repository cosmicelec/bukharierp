'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createInvoice, PushToFBR_API, InvoiceItemInput } from '@/lib/services/invoice-service';
import { resolveApplicableRate } from '@/lib/services/tender-contract-service';

export async function getInvoices() {
  return prisma.invoice.findMany({
    include: {
      client: true,
      tenderContract: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getInvoiceById(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      tenderContract: true,
      items: {
        include: {
          product: true,
          pickedLocation: true,
        },
      },
    },
  });
}

export async function createNewInvoice(data: {
  clientId: string;
  tenderContractId?: string;
  items: InvoiceItemInput[];
  dueDate?: string;
}) {
  const invoice = await createInvoice({
    clientId: data.clientId,
    tenderContractId: data.tenderContractId,
    items: data.items,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
  });
  revalidatePath('/invoices');
  revalidatePath('/billing');
  revalidatePath('/inventory');
  revalidatePath('/');
  return invoice;
}

export async function syncInvoiceToFBR(invoiceId: string) {
  const result = await PushToFBR_API(invoiceId);
  revalidatePath('/invoices');
  return result;
}

export async function resolveRate(clientId: string, productId: string) {
  return resolveApplicableRate(clientId, productId);
}

export async function updateInvoiceStatus(id: string, status: string) {
  const invoice = await prisma.invoice.update({
    where: { id },
    data: { status },
  });
  revalidatePath('/invoices');
  return invoice;
}
