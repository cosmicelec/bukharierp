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
use std::fs;
use std::path::Path;
use base64::{Engine as _, engine::general_purpose::STANDARD};
use chrono::Datelike;
use image::ImageFormat;
use std::process::Command;

#[tauri::command]
async fn scan_from_hardware() -> Result<String, String> {
    // PowerShell script to interface with Windows WIA (Windows Image Acquisition)
    // Connects to the first available scanner, scans an image, saves to TEMP, and returns the path.
    let ps_script = r#"
        try {
            $deviceManager = New-Object -ComObject WIA.DeviceManager
            if ($deviceManager.DeviceInfos.Count -eq 0) {
                Write-Error "No scanner detected on this system."
                exit 1
            }
            $device = $deviceManager.DeviceInfos.Item(1).Connect()
            $item = $device.Items.Item(1)
            $image = $item.Transfer()
            $tempPath = Join-Path $env:TEMP "bukhari_scan_04bde7e1-2147-4c20-8bda-b0788df097cf.jpg"
            if (Test-Path $tempPath) { Remove-Item $tempPath }
            $image.SaveFile($tempPath)
            Write-Output $tempPath
        } catch {
            Write-Error $_.Exception.Message
            exit 1
        }
    "#;

    let output = Command::new("powershell")
        .args(&["-NoProfile", "-NonInteractive", "-Command", ps_script])
        .output()
        .map_err(|e| format!("Failed to execute scanner bridge: {}", e))?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Scanner Error: {}", err));
    }

    let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
    
    // Read the scanned file and convert to base64 so React can display it instantly
    let image_bytes = fs::read(&path).map_err(|e| format!("Failed to read scanned image: {}", e))?;
    let b64 = STANDARD.encode(&image_bytes);
    
    // Cleanup temp file
    let _ = fs::remove_file(&path);

    Ok(format!("data:image/jpeg;base64,{}", b64))
}

#[tauri::command]
async fn save_chit_image(base64: String, chit_id: String) -> Result<String, String> {
    let now = chrono::Local::now();
    let year = now.year();
    let month = now.month();
    
    let app_data = dirs::data_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("C:\\BukhariERP"))
        .join("BukhariERP").join("Chits").join(year.to_string()).join(format!("{:02}", month));
        
    if !app_data.exists() {
        fs::create_dir_all(&app_data).map_err(|e| e.to_string())?;
    }
    
    let clean_base64 = if let Some(idx) = base64.find(",") {
        &base64[idx + 1..]
    } else {
        &base64
    };

    let image_data = STANDARD.decode(clean_base64).map_err(|e| e.to_string())?;
    
    let img = image::load_from_memory(&image_data).map_err(|e| e.to_string())?;
    let file_path = app_data.join(format!("{}.jpg", chit_id));
    
    let mut file = std::fs::File::create(&file_path).map_err(|e| e.to_string())?;
    img.write_to(&mut file, ImageFormat::Jpeg).map_err(|e| e.to_string())?;
    
    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
async fn query_local_llm(command: String, tools: Value) -> Result<Value, String> {
    let client = reqwest::Client::new();
    
    let payload = serde_json::json!({
        "model": "llama3.2", 
        "messages": [
            { "role": "system", "content": "You are Bukhari Accounts Agent, an ERP assistant for a stationery company. You manage order chits, track unpaid dues, and monitor warehouse stock. ONLY use a tool if the user asks you to check unpaid dues, record a payment, summarize the warehouse, or check stock. Otherwise, reply normally." },
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
            save_chit_image,
            scan_from_hardware
        ])
        .run(tauri::generate_context!())
        .expect("error while running Bukhari Stationery ERP desktop application");
}