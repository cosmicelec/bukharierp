#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod alerts;
mod excel;
mod vault;

use alerts::send_whatsapp_low_stock_alert;
use excel::generate_excel_invoice;
use vault::{authenticate_user, check_vault_status};

fn main() {
    // Attempt to initialize or verify SQLCipher vault key in Windows Credential Manager
    if let Err(e) = vault::get_or_create_vault_key() {
        eprintln!("[WARN] Failed to initialize Windows Credential Manager key: {}", e);
    } else {
        println!("[VAULT] SQLCipher AES-256 master key is secured inside Windows Credential Manager.");
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            authenticate_user,
            check_vault_status,
            generate_excel_invoice,
            send_whatsapp_low_stock_alert,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Bukhari Stationery ERP desktop application");
}
