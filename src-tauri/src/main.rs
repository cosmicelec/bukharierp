#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod alerts;
mod excel;
mod vault;

use alerts::send_whatsapp_low_stock_alert;
use excel::generate_excel_invoice;
use serde_json::Value;
use vault::{authenticate_user, check_vault_status};

#[tauri::command]
async fn query_local_llm(command: String, tools: Value) -> Result<Value, String> {
    let client = reqwest::Client::new();
    
    // You can change "llama3.2" to whatever model you currently have installed (e.g. "llama3.1", "qwen2.5")
    let payload = serde_json::json!({
        "model": "llama3.2", 
        "messages": [
            { "role": "system", "content": "You are Bukhari Agent, a helpful ERP assistant for a stationery company. You can manage stock, calculate tender margins, and generate invoices using tools. CRITICAL INSTRUCTION: ONLY use a tool if the user explicitly asks to generate an invoice, check stock, update inventory, or calculate a margin. If the user just says hello, asks a general question, or says something unrelated, reply normally with a text message and DO NOT call any tools." },
            { "role": "user", "content": command }
        ],
        "tools": tools,
        "stream": false
    });

    let res = client
        .post("http://localhost:11434/api/chat")
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Failed to connect to local AI: {}", e))?;

    let json_res: Value = res.json().await.map_err(|e| e.to_string())?;
    Ok(json_res)
}

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
            query_local_llm,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Bukhari Stationery ERP desktop application");
}
