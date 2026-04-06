import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load adjacent .env explicitly
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
// We require the Service Role Key here exclusively to bypass RLS during automated Telegram interactions
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Missing Server-Side SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL variables!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
