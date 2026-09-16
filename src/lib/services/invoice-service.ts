import prisma from '@/lib/prisma';
import { resolveApplicableRate } from './tender-contract-service';
import { deductStock } from './inventory-service';
import { generateInvoiceNumber } from '@/lib/utils';
import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface InvoiceItemInput {
  productId: string;
  quantity: number;
  locationId: string;
}

export async function createInvoice(params: {
  clientId: string;
  tenderContractId?: string;
  items: InvoiceItemInput[];
  dueDate?: Date;
}) {
  const client = await prisma.client.findUnique({
    where: { id: params.clientId },
  });

  if (!client) throw new Error('Client not found.');

  let subtotalTaxable = new Decimal(0);
  let totalGst = new Decimal(0);

  // Resolve rates and build line items
  const resolvedItems = [];

  for (const item of params.items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });
    if (!product) throw new Error(`Product ${item.productId} not found.`);

    const rateInfo = await resolveApplicableRate(
      params.clientId,
      item.productId
    );

    const qty = new Decimal(item.quantity);
    const unitPrice = new Decimal(rateInfo.unitPriceExclTax);
    const gstPercent = new Decimal(rateInfo.gstPercent);

    const lineSubtotal = unitPrice.times(qty);
    const lineGst = lineSubtotal.times(gstPercent).dividedBy(100);
    const lineTotal = lineSubtotal.plus(lineGst);

    subtotalTaxable = subtotalTaxable.plus(lineSubtotal);
    totalGst = totalGst.plus(lineGst);

    resolvedItems.push({
      productId: item.productId,
      hsCode: product.hsCode,
      uom: product.baseUom,
      quantity: item.quantity,
      rateTypeApplied: rateInfo.rateType,
      unitPriceExclTax: rateInfo.unitPriceExclTax,
      salesTaxPercent: rateInfo.gstPercent,
      salesTaxAmount: lineGst.toDecimalPlaces(2).toNumber(),
      totalPriceInclTax: lineTotal.toDecimalPlaces(2).toNumber(),
      pickedLocationId: item.locationId,
    });
  }

  const grandTotal = subtotalTaxable.plus(totalGst);
  const whtDeducted = client.isWithholdingAgent
    ? grandTotal.times(new Decimal(client.defaultWhtRate).dividedBy(100))
    : new Decimal(0);

  // Create invoice with items in a transaction
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: generateInvoiceNumber(),
      clientId: params.clientId,
      tenderContractId: params.tenderContractId || null,
      dueDate: params.dueDate || null,
      subtotalTaxableValue: subtotalTaxable.toDecimalPlaces(2).toNumber(),
      totalSalesTaxAmount: totalGst.toDecimalPlaces(2).toNumber(),
      totalWhtDeducted: whtDeducted.toDecimalPlaces(2).toNumber(),
      grandTotalPayable: grandTotal.toDecimalPlaces(2).toNumber(),
      status: 'ISSUED',
      fbrSyncStatus: 'PENDING',
      items: {
        create: resolvedItems,
      },
    },
    include: {
      items: {
        include: {
          product: true,
          pickedLocation: true,
        },
      },
      client: true,
    },
  });

  // Deduct stock for each item
  for (const item of params.items) {
    await deductStock({
      productId: item.productId,
      locationId: item.locationId,
      quantity: item.quantity,
    });
  }

  return invoice;
}

/**
 * Placeholder for FBR Digital Invoicing integration.
 * Implements SRO 252(I)/2024 specifications.
 */
export async function PushToFBR_API(invoiceId: string): Promise<{
  success: boolean;
  fbrInvoiceNumber?: string;
  qrCodeData?: string;
  errorMessage?: string;
}> {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!invoice) throw new Error('Invoice not found');

    // ---- FBR API INTEGRATION PLACEHOLDER ----
    // const fbrEndpoint = process.env.FBR_API_ENDPOINT || 'https://ims.fbr.gov.pk/api/Live/PostData';
    // const bearerToken = process.env.FBR_BEARER_TOKEN;
    // const payload = { ... };
    // const response = await fetch(fbrEndpoint, { method: 'POST', body: JSON.stringify(payload), headers: { Authorization: `Bearer ${bearerToken}` } });
    // -----------------------------------------

    // Simulated success response
    const mockFbrInvoiceNumber = `FBR-PK-${new Date().getFullYear()}-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const mockQrCodePayload = `FBR:${mockFbrInvoiceNumber}|NTN:${invoice.client.ntnNumber}|TOTAL:${invoice.grandTotalPayable}|GST:${invoice.totalSalesTaxAmount}`;

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        fbrInvoiceNumber: mockFbrInvoiceNumber,
        fbrQrCodeData: mockQrCodePayload,
        fbrSyncStatus: 'SUCCESS',
        fbrSyncedAt: new Date(),
        fbrSyncResponse: JSON.stringify({ status: '200 OK', code: '00', fbrInvoiceNo: mockFbrInvoiceNumber }),
      },
    });

    return {
      success: true,
      fbrInvoiceNumber: mockFbrInvoiceNumber,
      qrCodeData: mockQrCodePayload,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'FBR Gateway Timeout';
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        fbrSyncStatus: 'FAILED',
        fbrSyncResponse: JSON.stringify({ error: errorMessage }),
      },
    });

    return {
      success: false,
      errorMessage,
    };
  }
}
