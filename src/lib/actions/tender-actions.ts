'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { lockTenderRate } from '@/lib/services/tender-contract-service';
import { calculateTenderBiddingRate, BiddingInput } from '@/lib/services/bidding-engine';

export async function getContracts() {
  return prisma.tenderContract.findMany({
    include: {
      client: true,
      lockedRates: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getActiveContracts() {
  return prisma.tenderContract.findMany({
    where: { status: 'WON_LOCKED' },
    include: {
      client: true,
      lockedRates: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createContract(data: {
  tenderReferenceNo: string;
  clientId: string;
  title: string;
  financialYear: string;
  startDate: string;
  endDate: string;
}) {
  const contract = await prisma.tenderContract.create({
    data: {
      tenderReferenceNo: data.tenderReferenceNo,
      clientId: data.clientId,
      title: data.title,
      financialYear: data.financialYear,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: 'DRAFT',
    },
  });
  revalidatePath('/contracts');
  revalidatePath('/admin');
  return contract;
}

export async function updateContractStatus(id: string, status: string) {
  const contract = await prisma.tenderContract.update({
    where: { id },
    data: { status },
  });
  revalidatePath('/contracts');
  revalidatePath('/admin');
  return contract;
}

export async function calculateRate(input: BiddingInput) {
  return calculateTenderBiddingRate(input);
}

export async function lockRate(params: {
  contractId: string;
  productId: string;
  biddingParams: BiddingInput;
  committedQuantity: number;
}) {
  const result = await lockTenderRate(params);
  revalidatePath('/contracts');
  revalidatePath('/tender-calculator');
  return result;
}
