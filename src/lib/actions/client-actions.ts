'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getClients() {
  return prisma.client.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}

export async function getAllClients() {
  return prisma.client.findMany({
    include: {
      chits: true,
    },
    orderBy: { name: 'asc' },
  });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      chits: { take: 10, orderBy: { createdAt: 'desc' } },
    },
  });
}

export async function createClient(data: {
  code: string;
  name: string;
  clientType: string;
  department?: string;
  contactPerson?: string;
  address: string;
  city?: string;
  phone?: string;
}) {
  const client = await prisma.client.create({
    data: {
      code: data.code,
      name: data.name,
      clientType: data.clientType,
      department: data.department || null,
      contactPerson: data.contactPerson || null,
      address: data.address,
      city: data.city ?? 'Quetta',
      phone: data.phone || null,
    },
  });
  revalidatePath('/admin');
  return client;
}

export async function updateClient(
  id: string,
  data: {
    name?: string;
    clientType?: string;
    department?: string;
    contactPerson?: string;
    address?: string;
    city?: string;
    phone?: string;
    isActive?: boolean;
  }
) {
  const client = await prisma.client.update({
    where: { id },
    data,
  });
  revalidatePath('/admin');
  return client;
}

export async function deleteClient(id: string) {
  await prisma.client.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath('/admin');
}
