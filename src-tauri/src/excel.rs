use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use umya_spreadsheet::*;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ExcelInvoiceItem {
    pub hs_code: String,
    pub description: String,
    pub uom: String,
    pub quantity: f64,
    pub unit_price: f64,
    pub gst_percent: f64,
    pub gst_amount: f64,
    pub total_amount: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ExcelInvoiceData {
    pub invoice_number: String,
    pub date: String,
    pub client_name: String,
    pub client_ntn: String,
    pub client_strn: String,
    pub client_address: String,
    pub subtotal_taxable: f64,
    pub total_gst: f64,
    pub grand_total: f64,
    pub items: Vec<ExcelInvoiceItem>,
}

/// Injects invoice data into an Excel spreadsheet template and saves it to the user's Desktop.
#[tauri::command]
pub fn generate_excel_invoice(
    invoice: ExcelInvoiceData,
    template_path: Option<String>,
) -> Result<String, String> {
    let desktop_dir = dirs::desktop_dir()
        .ok_or_else(|| "Could not locate user Desktop directory".to_string())?;

    let output_dir = desktop_dir.join("Bukhari_Invoices");
    if !output_dir.exists() {
        fs::create_dir_all(&output_dir)
            .map_err(|e| format!("Failed to create output directory: {}", e))?;
    }

    let output_filename = format!("Invoice_{}.xlsx", invoice.invoice_number.replace('/', "_"));
    let output_path = output_dir.join(output_filename);

    // Load existing template if available, otherwise construct formatted spreadsheet
    let mut book = if let Some(ref path) = template_path {
        let p = Path::new(path);
        if p.exists() {
            reader::xlsx::read(p).map_err(|e| format!("Failed to read Excel template: {}", e))?
        } else {
            create_default_template_book(&invoice)?
        }
    } else {
        create_default_template_book(&invoice)?
    };

    let sheet_exists = book.get_sheet_by_name("Sheet1").is_ok();
    let sheet = if sheet_exists {
        book.get_sheet_by_name_mut("Sheet1").unwrap()
    } else {
        book.get_sheet_mut(&0).map_err(|_| "Could not find worksheet in Excel workbook".to_string())?
    };

    // Inject Header Information into exact coordinates
    sheet.cell_mut("B5").set_value(&invoice.client_name);
    sheet.cell_mut("B6").set_value(format!("NTN: {} | STRN: {}", invoice.client_ntn, invoice.client_strn));
    sheet.cell_mut("B7").set_value(&invoice.client_address);

    sheet.cell_mut("F5").set_value(format!("Invoice #: {}", invoice.invoice_number));
    sheet.cell_mut("F6").set_value(format!("Date: {}", invoice.date));

    // Inject Line Items starting at row 11
    let start_row = 11u32;
    for (idx, item) in invoice.items.iter().enumerate() {
        let row = start_row + (idx as u32);
        sheet.cell_mut((1, row)).set_value((idx + 1).to_string());
        sheet.cell_mut((2, row)).set_value(&item.description);
        sheet.cell_mut((3, row)).set_value(&item.hs_code);
        sheet.cell_mut((4, row)).set_value(&item.uom);
        sheet.cell_mut((5, row)).set_value(item.quantity.to_string());
        sheet.cell_mut((6, row)).set_value(format!("{:.2}", item.unit_price));
        sheet.cell_mut((7, row)).set_value(format!("{:.2}", item.gst_amount));
        sheet.cell_mut((8, row)).set_value(format!("{:.2}", item.total_amount));
    }

    // Totals
    let total_row = start_row + (invoice.items.len() as u32) + 1;
    sheet.cell_mut((7, total_row)).set_value("Taxable Subtotal:");
    sheet.cell_mut((8, total_row)).set_value(format!("PKR {:.2}", invoice.subtotal_taxable));

    sheet.cell_mut((7, total_row + 1)).set_value("18% GST Total:");
    sheet.cell_mut((8, total_row + 1)).set_value(format!("PKR {:.2}", invoice.total_gst));

    sheet.cell_mut((7, total_row + 2)).set_value("Grand Total Payable:");
    sheet.cell_mut((8, total_row + 2)).set_value(format!("PKR {:.2}", invoice.grand_total));

    // Save to Desktop
    writer::xlsx::write(&book, &output_path)
        .map_err(|e| format!("Failed to write Excel file to Desktop: {}", e))?;

    Ok(output_path.to_string_lossy().to_string())
}

fn create_default_template_book(invoice: &ExcelInvoiceData) -> Result<umya_spreadsheet::Workbook, String> {
    let mut book = new_file();
    let sheet = book.get_sheet_mut(&0)
        .map_err(|_| "Default sheet creation failed".to_string())?;

    sheet.set_name("Invoice");

    // Title Block
    sheet.cell_mut("A2").set_value("BUKHARI STATIONERY & TENDER SUPPLIERS");
    sheet.cell_mut("A3").set_value("Govt / Corporate Tender Supplies & Wholesale | Quetta, Pakistan");

    // Table Headers at Row 10
    sheet.cell_mut("A10").set_value("Sr #");
    sheet.cell_mut("B10").set_value("Description of Stationery Item");
    sheet.cell_mut("C10").set_value("HS Code");
    sheet.cell_mut("D10").set_value("UOM");
    sheet.cell_mut("E10").set_value("Qty");
    sheet.cell_mut("F10").set_value("Rate (Excl. Tax)");
    sheet.cell_mut("G10").set_value("GST (18%)");
    sheet.cell_mut("H10").set_value("Total (PKR)");

    Ok(book)
}
