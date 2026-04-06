import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatically load the root .env securely regardless of the terminal folder
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.argv[2]; // Passed from terminal command

if (!BOT_TOKEN) {
  console.error("❌ Error: Missing TELEGRAM_BOT_TOKEN in .env");
  process.exit(1);
}
if (!WEBHOOK_URL) {
  console.error("❌ Usage Error: You must pass your Ngrok or Vercel URL.\n   Example: node setup_webhook.js https://a1b2c3d4.ngrok-free.app");
  process.exit(1);
}

// Ensure proper cleaning trailing slashes
const cleanUrl = WEBHOOK_URL.endsWith('/') ? WEBHOOK_URL.slice(0, -1) : WEBHOOK_URL;
const fullTarget = `${cleanUrl}/webhook`;

const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${fullTarget}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    if (data.ok) console.log(`✅ Webhook set successfully to point to: ${fullTarget}`);
    else console.error("❌ Failed to set webhook:", data.description);
  })
  .catch(err => console.error("Network Error:", err));
