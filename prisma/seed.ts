import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Tax Configurations
  const gst = await prisma.taxConfiguration.create({
    data: {
      taxName: 'STANDARD_GST',
      taxRatePercent: 18.0,
      isActive: true,
      effectiveFrom: new Date('2024-07-01'),
      description: 'Standard GST Rate for Goods (Finance Act 2024-25)',
    },
  });

  const whtFiler = await prisma.taxConfiguration.create({
    data: {
      taxName: 'GOVT_WHT_FILER',
      taxRatePercent: 5.0,
      isActive: true,
      effectiveFrom: new Date('2024-07-01'),
      description: 'Withholding Tax on Goods for Filers (Section 153)',
    },
  });

  const whtNonFiler = await prisma.taxConfiguration.create({
    data: {
      taxName: 'GOVT_WHT_NON_FILER',
      taxRatePercent: 10.0,
      isActive: true,
      effectiveFrom: new Date('2024-07-01'),
      description: 'Withholding Tax on Goods for Non-Filers (Section 153)',
    },
  });

  console.log('✅ Tax configurations seeded');

  // 2. Clients
  const quettaGPO = await prisma.client.create({
    data: {
      code: 'CL-QTA-GPO-01',
      name: 'Quetta GPO (Pakistan Post)',
      clientType: 'GOVERNMENT',
      ntnNumber: '0812345-7',
      strnNumber: '12-00-9999-001',
      isWithholdingAgent: true,
      defaultWhtRate: 5.0,
      address: 'General Post Office, Jinnah Road, Quetta',
      city: 'Quetta',
      phone: '081-9201234',
    },
  });

  const balochGovt = await prisma.client.create({
    data: {
      code: 'CL-QTA-BGA-01',
      name: 'Balochistan Government Secretariat',
      clientType: 'GOVERNMENT',
      ntnNumber: '0898765-4',
      strnNumber: '12-00-8888-002',
      isWithholdingAgent: true,
      defaultWhtRate: 5.0,
      address: 'Zarghoon Road, Civil Secretariat, Quetta',
      city: 'Quetta',
      phone: '081-9202345',
    },
  });

  const walkIn = await prisma.client.create({
    data: {
      code: 'CL-WALKIN-DEFAULT',
      name: 'Walk-In Customer',
      clientType: 'WALK_IN',
      isWithholdingAgent: false,
      defaultWhtRate: 0,
      address: 'Counter Sales',
      city: 'Quetta',
    },
  });

  const corpClient = await prisma.client.create({
    data: {
      code: 'CL-QTA-OGDCL-01',
      name: 'OGDCL Quetta Office',
      clientType: 'CORPORATE',
      ntnNumber: '0654321-9',
      strnNumber: '12-00-7777-003',
      isWithholdingAgent: true,
      defaultWhtRate: 5.0,
      address: 'Sariab Road, OGDCL Regional Office, Quetta',
      city: 'Quetta',
      phone: '081-9203456',
    },
  });

  console.log('✅ Clients seeded');

  // 3. Products
  const a4Paper = await prisma.product.create({
    data: {
      sku: 'PAP-A4-80G-DA',
      name: 'A4 Photocopy Paper 80GSM - Double A',
      brand: 'Double A',
      hsCode: '4802.5600',
      baseUom: 'Reams',
      baseCost: 1450.0,
      standardRetailPrice: 1750.0,
      standardGstPercent: 18.0,
      minStockAlert: 100,
    },
  });

  const a4PaperHP = await prisma.product.create({
    data: {
      sku: 'PAP-A4-80G-HP',
      name: 'A4 Photocopy Paper 80GSM - HP',
      brand: 'HP',
      hsCode: '4802.5600',
      baseUom: 'Reams',
      baseCost: 1500.0,
      standardRetailPrice: 1800.0,
      standardGstPercent: 18.0,
      minStockAlert: 100,
    },
  });

  const ballpointBlue = await prisma.product.create({
    data: {
      sku: 'PEN-BP-BLU-DUX',
      name: 'Dux Ballpoint Pen Blue',
      brand: 'Dux',
      hsCode: '9608.1000',
      baseUom: 'Dozens',
      baseCost: 180.0,
      standardRetailPrice: 250.0,
      standardGstPercent: 18.0,
      minStockAlert: 200,
    },
  });

  const fileFolder = await prisma.product.create({
    data: {
      sku: 'FIL-SPR-A4-GRN',
      name: 'Spring File A4 - Green',
      brand: 'Local',
      hsCode: '4820.3000',
      baseUom: 'Pieces',
      baseCost: 85.0,
      standardRetailPrice: 120.0,
      standardGstPercent: 18.0,
      minStockAlert: 300,
    },
  });

  const registerHardbound = await prisma.product.create({
    data: {
      sku: 'REG-HB-200P-BLK',
      name: 'Hardbound Register 200 Pages',
      brand: 'Century',
      hsCode: '4820.1000',
      baseUom: 'Pieces',
      baseCost: 320.0,
      standardRetailPrice: 450.0,
      standardGstPercent: 18.0,
      minStockAlert: 50,
    },
  });

  const stapler = await prisma.product.create({
    data: {
      sku: 'STP-HD-KANGARO',
      name: 'Kangaro Heavy Duty Stapler HD-23S17',
      brand: 'Kangaro',
      hsCode: '8305.2000',
      baseUom: 'Pieces',
      baseCost: 1800.0,
      standardRetailPrice: 2400.0,
      standardGstPercent: 18.0,
      minStockAlert: 20,
    },
  });

  const staplerPins = await prisma.product.create({
    data: {
      sku: 'STP-PIN-23-17',
      name: 'Stapler Pins 23/17 (1000pcs)',
      brand: 'Kangaro',
      hsCode: '8305.2000',
      baseUom: 'Boxes',
      baseCost: 250.0,
      standardRetailPrice: 350.0,
      standardGstPercent: 18.0,
      minStockAlert: 100,
    },
  });

  const whiteboard = await prisma.product.create({
    data: {
      sku: 'WBD-MAG-4X3-WHT',
      name: 'Magnetic Whiteboard 4x3 Feet',
      brand: 'Deli',
      hsCode: '9610.0000',
      baseUom: 'Pieces',
      baseCost: 4500.0,
      standardRetailPrice: 6000.0,
      standardGstPercent: 18.0,
      minStockAlert: 5,
    },
  });

  console.log('✅ Products seeded');

  // 4. UOM Conversions
  await prisma.productUomConversion.createMany({
    data: [
      { productId: a4Paper.id, alternateUom: 'Cartons', conversionFactor: 5 },
      { productId: a4Paper.id, alternateUom: 'Sheets', conversionFactor: 0.002 },
      { productId: a4PaperHP.id, alternateUom: 'Cartons', conversionFactor: 5 },
      { productId: ballpointBlue.id, alternateUom: 'Pieces', conversionFactor: 0.0833 },
      { productId: ballpointBlue.id, alternateUom: 'Gross', conversionFactor: 12 },
    ],
  });

  console.log('✅ UOM conversions seeded');

  // 5. Warehouse Locations
  const loc1 = await prisma.warehouseLocation.create({
    data: {
      warehouseName: 'Main Godown (Zarghoon Rd)',
      floorCode: 'FL-00',
      floorName: 'Ground Floor',
      sectionAisle: 'Section A - Writing Instruments',
      rackShelf: 'Rack-01 / Shelf-1',
      locationCode: 'MG-FL0-SA-R01-S1',
    },
  });

  const loc2 = await prisma.warehouseLocation.create({
    data: {
      warehouseName: 'Main Godown (Zarghoon Rd)',
      floorCode: 'FL-00',
      floorName: 'Ground Floor',
      sectionAisle: 'Section A - Writing Instruments',
      rackShelf: 'Rack-01 / Shelf-2',
      locationCode: 'MG-FL0-SA-R01-S2',
    },
  });

  const loc3 = await prisma.warehouseLocation.create({
    data: {
      warehouseName: 'Main Godown (Zarghoon Rd)',
      floorCode: 'FL-00',
      floorName: 'Ground Floor',
      sectionAisle: 'Section B - Paper Products',
      rackShelf: 'Rack-02 / Shelf-1',
      locationCode: 'MG-FL0-SB-R02-S1',
    },
  });

  const loc4 = await prisma.warehouseLocation.create({
    data: {
      warehouseName: 'Main Godown (Zarghoon Rd)',
      floorCode: 'FL-00',
      floorName: 'Ground Floor',
      sectionAisle: 'Section B - Paper Products',
      rackShelf: 'Rack-02 / Shelf-2',
      locationCode: 'MG-FL0-SB-R02-S2',
    },
  });

  const loc5 = await prisma.warehouseLocation.create({
    data: {
      warehouseName: 'Main Godown (Zarghoon Rd)',
      floorCode: 'FL-01',
      floorName: 'First Floor',
      sectionAisle: 'Section C - Office Equipment',
      rackShelf: 'Rack-01 / Shelf-1',
      locationCode: 'MG-FL1-SC-R01-S1',
    },
  });

  const loc6 = await prisma.warehouseLocation.create({
    data: {
      warehouseName: 'Main Godown (Zarghoon Rd)',
      floorCode: 'FL-01',
      floorName: 'First Floor',
      sectionAisle: 'Section D - Files & Registers',
      rackShelf: 'Rack-01 / Shelf-1',
      locationCode: 'MG-FL1-SD-R01-S1',
    },
  });

  console.log('✅ Warehouse locations seeded');

  // 6. Inventory Stocks
  await prisma.inventoryStock.createMany({
    data: [
      { productId: a4Paper.id, locationId: loc3.id, quantityOnHand: 1850, quantityAllocated: 1000 },
      { productId: a4PaperHP.id, locationId: loc4.id, quantityOnHand: 420, quantityAllocated: 300 },
      { productId: ballpointBlue.id, locationId: loc1.id, quantityOnHand: 500, quantityAllocated: 0 },
      { productId: fileFolder.id, locationId: loc6.id, quantityOnHand: 90, quantityAllocated: 0 },
      { productId: registerHardbound.id, locationId: loc6.id, quantityOnHand: 75, quantityAllocated: 0 },
      { productId: stapler.id, locationId: loc5.id, quantityOnHand: 30, quantityAllocated: 0 },
      { productId: staplerPins.id, locationId: loc5.id, quantityOnHand: 200, quantityAllocated: 0 },
      { productId: whiteboard.id, locationId: loc5.id, quantityOnHand: 8, quantityAllocated: 0 },
    ],
  });

  console.log('✅ Inventory stocks seeded');

  // 7. Tender Contract with Locked Rates
  const contract1 = await prisma.tenderContract.create({
    data: {
      tenderReferenceNo: 'TND-POST-2024-89B',
      clientId: quettaGPO.id,
      title: 'Annual Stationery Framework Agreement 2024-25',
      financialYear: '2024-2025',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2025-06-30'),
      status: 'WON_LOCKED',
    },
  });

  await prisma.lockedTenderRate.createMany({
    data: [
      {
        contractId: contract1.id,
        productId: a4Paper.id,
        baseCostSnapshot: 1450.0,
        freightHandlingPerUnit: 35.0,
        targetProfitMarginPercent: 18.0,
        gstPercentSnapshot: 18.0,
        sourceWhtPercentSnapshot: 5.0,
        lockedNetRate: 1752.30,
        lockedGrossRate: 2067.71,
        committedQuantity: 5000,
        isActive: true,
      },
      {
        contractId: contract1.id,
        productId: ballpointBlue.id,
        baseCostSnapshot: 180.0,
        freightHandlingPerUnit: 10.0,
        targetProfitMarginPercent: 20.0,
        gstPercentSnapshot: 18.0,
        sourceWhtPercentSnapshot: 5.0,
        lockedNetRate: 228.0,
        lockedGrossRate: 269.04,
        committedQuantity: 2000,
        isActive: true,
      },
      {
        contractId: contract1.id,
        productId: fileFolder.id,
        baseCostSnapshot: 85.0,
        freightHandlingPerUnit: 5.0,
        targetProfitMarginPercent: 25.0,
        gstPercentSnapshot: 18.0,
        sourceWhtPercentSnapshot: 5.0,
        lockedNetRate: 112.50,
        lockedGrossRate: 132.75,
        committedQuantity: 3000,
        isActive: true,
      },
    ],
  });

  console.log('✅ Tender contracts and locked rates seeded');

  // 8. Sample Invoice
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-00001',
      clientId: quettaGPO.id,
      tenderContractId: contract1.id,
      subtotalTaxableValue: 350460.0,
      totalSalesTaxAmount: 63082.80,
      totalWhtDeducted: 20677.14,
      grandTotalPayable: 413542.80,
      fbrSyncStatus: 'SUCCESS',
      fbrInvoiceNumber: 'FBR-PK-2024-12345678',
      fbrQrCodeData: 'FBR:FBR-PK-2024-12345678|NTN:0812345-7|TOTAL:413542.80|GST:63082.80',
      fbrSyncedAt: new Date(),
      fbrSyncResponse: JSON.stringify({ status: '200 OK', code: '00' }),
      status: 'PAID',
      items: {
        create: [
          {
            productId: a4Paper.id,
            hsCode: '4802.5600',
            uom: 'Reams',
            quantity: 200,
            rateTypeApplied: 'LOCKED_TENDER',
            unitPriceExclTax: 1752.30,
            salesTaxPercent: 18.0,
            salesTaxAmount: 63082.80,
            totalPriceInclTax: 413542.80,
            pickedLocationId: loc3.id,
          },
        ],
      },
    },
  });

  console.log('✅ Sample invoice seeded');
  console.log('\n🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
