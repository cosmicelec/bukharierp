import prisma from '@/lib/prisma';
import { invoke } from '@tauri-apps/api/tauri';

export interface LowStockAlertData {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  threshold: number;
  locationCode: string;
}

/**
 * Triggers a WhatsApp alert webhook to the owner/admin when inventory drops below the safety threshold.
 * Works offline (console fallback) or dispatches to Twilio Sandbox / Meta Cloud WhatsApp API.
 */
export async function checkAndDispatchWhatsAppAlert(data: LowStockAlertData): Promise<{
  dispatched: boolean;
  message: string;
}> {
  try {
    const adminPhone = process.env.WHATSAPP_ADMIN_PHONE || '+923001234567';
    const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
    const apiToken = process.env.WHATSAPP_API_TOKEN;

    const messageText = `⚠️ *BUKHARI ERP LOW STOCK ALERT*\n\n` +
      `*Item:* ${data.productName}\n` +
      `*SKU:* ${data.sku}\n` +
      `*Location:* ${data.locationCode}\n` +
      `*Remaining Stock:* ${data.currentStock}\n` +
      `*Reorder Level:* ${data.threshold}\n\n` +
      `_Tender allocation commitment alert._`;

    // 1. If running inside Tauri desktop, try invoking native Rust command
    if (typeof window !== 'undefined' && (window as any).__TAURI_IPC__) {
      try {
        const result: any = await invoke('send_whatsapp_low_stock_alert', {
          alert: {
            recipient_phone: adminPhone,
            product_name: data.productName,
            sku: data.sku,
            current_stock: data.currentStock,
            threshold: data.threshold,
            location_code: data.locationCode,
          },
          webhook_url: webhookUrl,
          api_token: apiToken,
        });
        return { dispatched: true, message: result.message };
      } catch (tauriErr) {
        console.warn('Tauri native alert invoke fallback:', tauriErr);
      }
    }

    // 2. If webhook URL configured, send HTTP POST (e.g. Twilio sandbox or local microservice)
    if (webhookUrl) {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
        },
        body: JSON.stringify({
          to: adminPhone,
          message: messageText,
          channel: 'whatsapp',
        }),
      });

      if (res.ok) {
        return { dispatched: true, message: `WhatsApp alert sent to ${adminPhone}` };
      }
    }

    // 3. Offline simulation fallback
    console.log(`[WHATSAPP ALERT SIMULATOR -> ${adminPhone}]:\n${messageText}`);
    return {
      dispatched: true,
      message: `Offline alert recorded for ${adminPhone} (Console/Simulated)`,
    };
  } catch (error: any) {
    console.error('WhatsApp alert dispatch error:', error);
    return { dispatched: false, message: error.message };
  }
}
