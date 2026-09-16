import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `INV-${year}-${random}`;
}

export function generateLocationCode(
  warehouse: string,
  floor: string,
  section: string,
  rack: string
): string {
  const w = warehouse.substring(0, 2).toUpperCase();
  const f = floor.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const s = section.replace(/[^A-Za-z0-9]/g, '').substring(0, 5).toUpperCase();
  const r = rack.replace(/[^A-Za-z0-9]/g, '').substring(0, 5).toUpperCase();
  return `${w}-${f}-${s}-${r}`;
}
