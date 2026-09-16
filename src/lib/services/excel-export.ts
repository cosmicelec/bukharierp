/**
 * Injects invoice data into an Excel spreadsheet.
 * Uses native Tauri Rust umya-spreadsheet command when running as desktop .exe,
 * with clean CSV/XLS format fallback when running in browser.
 */
export async function exportInvoiceToExcel(invoice: {
  invoiceNumber: string;
  clientName: string;
  clientNtn?: string;
  clientStrn?: string;
  clientAddress?: string;
  date: string;
  subtotalTaxable: number;
  totalGst: number;
  grandTotal: number;
  items: Array<{
    hsCode: string;
    description: string;
    uom: string;
    quantity: number;
    unitPrice: number;
    gstPercent: number;
    gstAmount: number;
    totalAmount: number;
  }>;
}): Promise<{ success: boolean; filePath?: string; message: string }> {
  try {
    // 1. If running inside Tauri desktop app
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      const { invoke } = (window as any).__TAURI__.tauri;
      const desktopPath = await invoke('generate_excel_invoice', {
        invoice: {
          invoice_number: invoice.invoiceNumber,
          date: invoice.date,
          client_name: invoice.clientName,
          client_ntn: invoice.clientNtn || '9999997',
          client_strn: invoice.clientStrn || 'Unregistered',
          client_address: invoice.clientAddress || 'Quetta, Pakistan',
          subtotal_taxable: invoice.subtotalTaxable,
          total_gst: invoice.totalGst,
          grand_total: invoice.grandTotal,
          items: invoice.items.map((it) => ({
            hs_code: it.hsCode,
            description: it.description,
            uom: it.uom,
            quantity: it.quantity,
            unit_price: it.unitPrice,
            gst_percent: it.gstPercent,
            gst_amount: it.gstAmount,
            total_amount: it.totalAmount,
          })),
        },
      });

      return {
        success: true,
        filePath: desktopPath,
        message: `Excel invoice injected and saved to Desktop: ${desktopPath}`,
      };
    }

    // 2. Browser fallback: Generate and trigger client-side CSV download
    const headers = ['Sr #', 'Description', 'HS Code', 'UOM', 'Qty', 'Unit Price (PKR)', '18% GST (PKR)', 'Line Total (PKR)'];
    const rows = invoice.items.map((it, idx) => [
      idx + 1,
      `"${it.description}"`,
      it.hsCode,
      it.uom,
      it.quantity,
      it.unitPrice.toFixed(2),
      it.gstAmount.toFixed(2),
      it.totalAmount.toFixed(2),
    ]);

    const csvContent = [
      `"BUKHARI STATIONERY & TENDER SUPPLIERS - FBR TAX INVOICE"`,
      `"Invoice #:","${invoice.invoiceNumber}","Date:","${invoice.date}"`,
      `"Client:","${invoice.clientName}","NTN:","${invoice.clientNtn || ''}"`,
      '',
      headers.join(','),
      ...rows.map((r) => r.join(',')),
      '',
      `"Taxable Subtotal",,,,,,"PKR ${invoice.subtotalTaxable.toFixed(2)}"`,
      `"Sales Tax (18% GST)",,,,,,"PKR ${invoice.totalGst.toFixed(2)}"`,
      `"Grand Total Payable",,,,,,"PKR ${invoice.grandTotal.toFixed(2)}"`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Invoice_${invoice.invoiceNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return {
      success: true,
      message: `Invoice downloaded as CSV spreadsheet for ${invoice.invoiceNumber}`,
    };
  } catch (err: any) {
    console.error('Excel template export error:', err);
    return { success: false, message: err.message || 'Export failed' };
  }
}
