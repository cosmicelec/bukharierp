import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface BiddingInput {
  baseCost: number;
  freightPerUnit: number;
  targetMarginPercent: number;
  gstPercent: number;
  whtPercent: number;
}

export interface CalculatedRateResult {
  effectiveBaseCost: number;
  desiredProfitAmount: number;
  netRateExclTax: number;
  gstAmount: number;
  quotedGrossRate: number;
  estimatedWhtDeduction: number;
  finalRealizedNetCash: number;
  effectiveNetMarginPercent: number;
}

/**
 * Calculates tender bidding rates accounting for FBR GST and Government WHT.
 * 
 * Formula:
 *   TotalCost = BaseCost + Freight
 *   DesiredProfit = TotalCost × (MarginPercent / 100)
 *   NetRate = TotalCost + DesiredProfit
 *   GST = NetRate × (GSTPercent / 100)
 *   GrossRate = NetRate + GST
 *   WHT = GrossRate × (WHTPercent / 100)  [deducted at source by govt]
 *   NetCash = GrossRate - WHT
 */
export function calculateTenderBiddingRate(input: BiddingInput): CalculatedRateResult {
  const baseCost = new Decimal(input.baseCost);
  const freight = new Decimal(input.freightPerUnit);
  const totalCost = baseCost.plus(freight);

  const marginRate = new Decimal(input.targetMarginPercent).dividedBy(100);
  const gstRate = new Decimal(input.gstPercent).dividedBy(100);
  const whtRate = new Decimal(input.whtPercent).dividedBy(100);

  const desiredProfit = totalCost.times(marginRate);
  const netRateExclTax = totalCost.plus(desiredProfit);
  const gstAmount = netRateExclTax.times(gstRate);
  const quotedGrossRate = netRateExclTax.plus(gstAmount);

  const estimatedWhtDeduction = quotedGrossRate.times(whtRate);
  const netCashReceived = quotedGrossRate.minus(estimatedWhtDeduction);

  return {
    effectiveBaseCost: totalCost.toDecimalPlaces(2).toNumber(),
    desiredProfitAmount: desiredProfit.toDecimalPlaces(2).toNumber(),
    netRateExclTax: netRateExclTax.toDecimalPlaces(2).toNumber(),
    gstAmount: gstAmount.toDecimalPlaces(2).toNumber(),
    quotedGrossRate: quotedGrossRate.toDecimalPlaces(2).toNumber(),
    estimatedWhtDeduction: estimatedWhtDeduction.toDecimalPlaces(2).toNumber(),
    finalRealizedNetCash: netCashReceived.toDecimalPlaces(2).toNumber(),
    effectiveNetMarginPercent: desiredProfit.dividedBy(totalCost).times(100).toDecimalPlaces(2).toNumber(),
  };
}
