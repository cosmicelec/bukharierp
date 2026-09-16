use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct WhatsAppAlertPayload {
    pub recipient_phone: String,
    pub product_name: String,
    pub sku: String,
    pub current_stock: f64,
    pub threshold: f64,
    pub location_code: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AlertResult {
    pub success: bool,
    pub message: String,
    pub provider: String,
}

/// Dispatches an asynchronous WhatsApp alert to the Admin via Twilio Sandbox or Meta Cloud API.
#[tauri::command]
pub async fn send_whatsapp_low_stock_alert(
    alert: WhatsAppAlertPayload,
    webhook_url: Option<String>,
    api_token: Option<String>,
) -> Result<AlertResult, String> {
    let client = Client::builder()
        .timeout(Duration::from_secs(6))
        .build()
        .map_err(|e| e.to_string())?;

    let message_body = format!(
        "⚠️ *BUKHARI ERP LOW STOCK ALERT*\n\n\
         *Item:* {}\n\
         *SKU:* {}\n\
         *Location:* {}\n\
         *Remaining Stock:* {} units\n\
         *Reorder Level:* {} units\n\n\
         _Urgent replenishment required for pending tender commitments._",
        alert.product_name, alert.sku, alert.location_code, alert.current_stock, alert.threshold
    );

    // If custom webhook URL or Twilio credentials are provided, dispatch HTTP POST
    if let Some(url) = webhook_url {
        let mut request = client.post(&url);
        if let Some(token) = api_token {
            request = request.header("Authorization", format!("Bearer {}", token));
        }

        let payload = serde_json::json!({
            "to": alert.recipient_phone,
            "message": message_body,
            "channel": "whatsapp"
        });

        match request.json(&payload).send().await {
            Ok(resp) if resp.status().is_success() => Ok(AlertResult {
                success: true,
                message: format!("WhatsApp alert dispatched to {}", alert.recipient_phone),
                provider: "Custom Gateway / Twilio Sandbox".to_string(),
            }),
            Ok(resp) => Err(format!("WhatsApp gateway returned status {}", resp.status())),
            Err(e) => Err(format!("Network error contacting WhatsApp gateway: {}", e)),
        }
    } else {
        // Mock successful sandbox dispatch for local offline mode
        println!("[WHATSAPP ALERT SENT TO {}]: {}", alert.recipient_phone, message_body);
        Ok(AlertResult {
            success: true,
            message: format!("Simulated WhatsApp notification to {} (Console Logged)", alert.recipient_phone),
            provider: "Local Offline Sandbox Emulator".to_string(),
        })
    }
}
