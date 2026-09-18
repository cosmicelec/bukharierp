'use server';

import prisma from '@/lib/prisma';
import { addStockAction } from './inventory-actions';
import { createNewInvoice } from './invoice-actions';

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

  // Actually update the database
  await addStockAction({
    productId: stock.productId,
    locationId: stock.locationId,
    quantity: delta,
  });

  const actionWord = delta >= 0 ? 'added' : 'deducted';
  return `Inventory updated for ${stock.product.name}. Successfully ${actionWord} ${Math.abs(delta)} units.`;
}

export async function agentGenerateInvoice(clientName: string, itemName: string, quantity: number) {
  const client = await prisma.client.findFirst({
    where: { name: { contains: clientName } },
  });
  if (!client) return `Error: Client "${clientName}" not found in database.`;

  const product = await prisma.product.findFirst({
    where: { name: { contains: itemName } },
  });
  if (!product) return `Error: Product "${itemName}" not found in database.`;

  const stock = await prisma.inventoryStock.findFirst({
    where: { productId: product.id },
  });
  if (!stock) return `Error: No stock location found for ${product.name}.`;

  const invoice = await createNewInvoice({
    clientId: client.id,
    items: [
      {
        productId: product.id,
        quantity: quantity,
        locationId: stock.locationId,
      }
    ]
  });

  return {
    message: `Generated tax invoice #${invoice.invoiceNumber} for ${client.name} for ${quantity} units of ${product.name}.`,
    invoiceData: {
      invoiceNumber: invoice.invoiceNumber,
      clientName: client.name,
      clientNtn: client.ntnNumber,
      clientStrn: client.strnNumber,
      clientAddress: client.address,
      date: invoice.createdAt.toISOString().split('T')[0],
      subtotalTaxable: invoice.subtotalTaxableValue,
      totalGst: invoice.totalSalesTaxAmount,
      grandTotal: invoice.grandTotalPayable,
      items: [
        {
          hsCode: product.hsCode,
          description: product.name,
          uom: product.baseUom,
          quantity: quantity,
          unitPrice: invoice.subtotalTaxableValue / quantity, // Approximation for single item
          gstPercent: 18,
          gstAmount: invoice.totalSalesTaxAmount,
          totalAmount: invoice.grandTotalPayable,
        }
      ]
    }
  };
}

import { calculateRate } from './tender-actions';

export async function agentCalculateTenderMargin(baseCost: number, marginPercent: number) {
  const calc = await calculateRate({
    baseCost: baseCost,
    freightPerUnit: 0,
    targetMarginPercent: marginPercent,
    gstPercent: 18, // standard GST
    whtPercent: 5,  // standard WHT
  });

  return `Financial Calculation Results: 
Base Cost: Rs ${calc.effectiveBaseCost} 
Net Price (Excl. Tax): Rs ${calc.netRateExclTax} 
GST Amount: Rs ${calc.gstAmount} 
FINAL TENDER GROSS RATE: Rs ${calc.quotedGrossRate} 
WHT Deduction: Rs ${calc.estimatedWhtDeduction}
Realized Cash per Unit: Rs ${calc.finalRealizedNetCash}
Total Guaranteed Profit: Rs ${calc.desiredProfitAmount} per unit.`;
}
export async function agentGetWarehouseSummary() {
  const stocks = await prisma.inventoryStock.findMany({
    include: { product: true }
  });
  if (stocks.length === 0) return 'The warehouse is currently empty.';
  const totalItems = stocks.reduce((sum, s) => sum + s.quantityOnHand, 0);
  const lowStock = stocks.filter(s => s.quantityOnHand <= s.product.minStockAlert);
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
  const names = products.map(p => p.name).join(', ');
  return `Here are the products we currently carry: ${names}.`;
}
