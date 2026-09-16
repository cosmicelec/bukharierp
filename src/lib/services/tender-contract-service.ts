import prisma from '@/lib/prisma';
import { calculateTenderBiddingRate, BiddingInput } from './bidding-engine';

export async function lockTenderRate(params: {
  contractId: string;
  productId: string;
  biddingParams: BiddingInput;
  committedQuantity: number;
}) {
  const calculation = calculateTenderBiddingRate(params.biddingParams);

  // Verify contract exists and is valid
  const contract = await prisma.tenderContract.findUnique({
    where: { id: params.contractId },
  });

  if (!contract) {
    throw new Error('Contract not found.');
  }

  if (contract.status === 'EXPIRED' || contract.status === 'TERMINATED') {
    throw new Error('Cannot lock rate: Contract is expired or terminated.');
  }

  // Upsert locked tender rate
  const lockedRate = await prisma.lockedTenderRate.upsert({
    where: {
      contractId_productId: {
        contractId: params.contractId,
        productId: params.productId,
      },
    },
    update: {
      baseCostSnapshot: params.biddingParams.baseCost,
      freightHandlingPerUnit: params.biddingParams.freightPerUnit,
      targetProfitMarginPercent: params.biddingParams.targetMarginPercent,
      gstPercentSnapshot: params.biddingParams.gstPercent,
      sourceWhtPercentSnapshot: params.biddingParams.whtPercent,
      lockedNetRate: calculation.netRateExclTax,
      lockedGrossRate: calculation.quotedGrossRate,
      committedQuantity: params.committedQuantity,
      isActive: true,
    },
    create: {
      contractId: params.contractId,
      productId: params.productId,
      baseCostSnapshot: params.biddingParams.baseCost,
      freightHandlingPerUnit: params.biddingParams.freightPerUnit,
      targetProfitMarginPercent: params.biddingParams.targetMarginPercent,
      gstPercentSnapshot: params.biddingParams.gstPercent,
      sourceWhtPercentSnapshot: params.biddingParams.whtPercent,
      lockedNetRate: calculation.netRateExclTax,
      lockedGrossRate: calculation.quotedGrossRate,
      committedQuantity: params.committedQuantity,
      isActive: true,
    },
  });

  // Update contract status to WON_LOCKED if it's still DRAFT or SUBMITTED
  if (contract.status === 'DRAFT' || contract.status === 'SUBMITTED') {
    await prisma.tenderContract.update({
      where: { id: params.contractId },
      data: { status: 'WON_LOCKED' },
    });
  }

  return { lockedRate, calculation };
}

/**
 * Resolves either Locked Tender Rate or Standard Retail Rate for a client+product.
 */
export async function resolveApplicableRate(
  clientId: string,
  productId: string,
  transactionDate: Date = new Date()
) {
  // Step 1: Check for active locked tender contract
  const activeContractRate = await prisma.lockedTenderRate.findFirst({
    where: {
      productId: productId,
      isActive: true,
      contract: {
        clientId: clientId,
        status: 'WON_LOCKED',
        startDate: { lte: transactionDate },
        endDate: { gte: transactionDate },
      },
    },
    include: {
      contract: true,
      product: true,
    },
  });

  if (activeContractRate) {
    return {
      rateType: 'LOCKED_TENDER' as const,
      contractReference: activeContractRate.contract.tenderReferenceNo,
      unitPriceExclTax: activeContractRate.lockedNetRate,
      gstPercent: activeContractRate.gstPercentSnapshot,
      grossUnitPrice: activeContractRate.lockedGrossRate,
      isLocked: true,
    };
  }

  // Step 2: Fallback to standard retail rate
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('Product not found.');
  }

  const gstRate = product.standardGstPercent;
  const netPrice = product.standardRetailPrice;
  const grossPrice = netPrice * (1 + gstRate / 100);

  return {
    rateType: 'STANDARD_RETAIL' as const,
    contractReference: null,
    unitPriceExclTax: netPrice,
    gstPercent: gstRate,
    grossUnitPrice: parseFloat(grossPrice.toFixed(2)),
    isLocked: false,
  };
}
