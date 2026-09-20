const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  
  await prisma.payment.deleteMany();
  await prisma.chitItem.deleteMany();
  await prisma.chit.deleteMany();
  
  await prisma.inventoryStock.deleteMany();
  await prisma.warehouseLocation.deleteMany();
  
  await prisma.product.deleteMany();
  await prisma.client.deleteMany();

  console.log('Seeding Clients...');
  const sec = await prisma.client.create({
    data: {
      code: 'CL-SEC-01',
      name: 'Balochistan Secretariat',
      clientType: 'GOVERNMENT',
      department: 'S&GAD',
      contactPerson: 'Mr. Tariq',
      address: 'Zarghoon Road',
      city: 'Quetta',
      totalOutstandingBalance: 0,
    }
  });

  const gpo = await prisma.client.create({
    data: {
      code: 'CL-GPO-01',
      name: 'General Post Office',
      clientType: 'GOVERNMENT',
      department: 'Accounts',
      contactPerson: 'Mr. Ahmed',
      address: 'Jinnah Road',
      city: 'Quetta',
      totalOutstandingBalance: 0,
    }
  });

  console.log('Seeding Products...');
  const paper = await prisma.product.create({
    data: {
      sku: 'PAP-A4-80G',
      name: 'Double A Paper A4 80GSM',
      brand: 'Double A',
      hsCode: '4802.5600',
      baseUom: 'Reams',
      baseCost: 1150,
      standardRetailPrice: 1500,
    }
  });

  const pen = await prisma.product.create({
    data: {
      sku: 'PEN-PIANO-BL',
      name: 'Piano Crystal Ballpoint Blue',
      brand: 'Piano',
      hsCode: '9608.1000',
      baseUom: 'Packets',
      baseCost: 250,
      standardRetailPrice: 350,
    }
  });

  console.log('Seeding Locations...');
  const loc1 = await prisma.warehouseLocation.create({
    data: {
      warehouseName: 'Main Godown',
      floorCode: 'GRND',
      floorName: 'Ground Floor',
      sectionAisle: 'Aisle 01',
      rackShelf: 'Rack A-1',
      locationCode: 'GR-A01-RA1'
    }
  });

  console.log('Seeding Stock...');
  await prisma.inventoryStock.create({
    data: {
      productId: paper.id,
      locationId: loc1.id,
      quantityOnHand: 500,
    }
  });

  await prisma.inventoryStock.create({
    data: {
      productId: pen.id,
      locationId: loc1.id,
      quantityOnHand: 200,
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
