import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { supabase } from './supabase.js';
import { parseIntent } from './gemini.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendMessage(chatId, text) {
  if (!BOT_TOKEN) return console.warn('Missing Telegram Bot Token', text);
  
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
  });
  const data = await res.json();
  if(!data.ok) console.error("Telegram Send Error:", data);
}

async function handleMessage(message) {
  const chatId = message.chat.id;
  const text = message.text.trim();

  try {
    // 1. Check if user is linked
    const { data: linkedUser } = await supabase
      .from('telegram_users')
      .select('*')
      .eq('telegram_id', chatId)
      .single();

    // 2. Handle linking flow
    if (text.startsWith('/link')) {
      if (linkedUser) {
        return sendMessage(chatId, '✅ Your account is already linked!');
      }

      const code = text.split(' ')[1]?.trim();
      if (!code) return sendMessage(chatId, '⚠️ Please provide a code. Example: `/link ABC123`');

      // Find code
      const { data: linkRecord, error: codeErr } = await supabase
        .from('telegram_link_codes')
        .select('*')
        .eq('code', code)
        .eq('used', false)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (codeErr || !linkRecord) {
        return sendMessage(chatId, '❌ Invalid or expired code. Generate a new one in the app.');
      }

      // Link them
      await supabase.from('telegram_users').insert({ telegram_id: chatId, user_id: linkRecord.user_id });
      await supabase.from('telegram_link_codes').update({ used: true }).eq('id', linkRecord.id);

      return sendMessage(chatId, '🎉 Account linked successfully! Try asking: "Spent 200 on Coffee"');
    }

    // 3. Fallback for unlinked
    if (!linkedUser) {
      return sendMessage(chatId, '🔒 You must link your account first! Generate a code in the dashboard and type:\n`/link CODE`');
    }

    // 4. Send to Gemini
    const { intent, amount, category, merchant, month, reply_template } = await parseIntent(text);
    const userId = linkedUser.user_id;

    if (intent === 'add_note') {
      return sendMessage(chatId, reply_template || `Noted bhai, yaad rakha 📌`);
    }

    if (intent === 'add_expense' || intent === 'add_income') {
      if (!amount || amount <= 0) return sendMessage(chatId, '⚠️ Sahi amount likhein / Please specify a valid amount.');
      
      const type = intent === 'add_income' ? 'income' : 'expense';
      let cat = category ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() : 'Other';
      if (type === 'income') cat = 'Salary';
      
      const monthStr = new Date().toISOString().slice(0, 10).substring(0, 7);
      const merchStr = merchant ? merchant.charAt(0).toUpperCase() + merchant.slice(1).toLowerCase() : '';
      const desc = merchStr ? `Added via Telegram: ${merchStr}` : `Added via Telegram: ${cat}`;

      const { error: insertErr } = await supabase.from('transactions').insert({
        user_id: userId,
        type,
        amount,
        category: cat,
        description: desc,
        date: new Date().toISOString(),
        month: monthStr,
        currency: 'INR'
      });

      if (insertErr) throw insertErr;
      
      let reply = reply_template || `✅ Successfully logged ${type} of ₹{AMOUNT}.`;
      reply = reply.replace('{AMOUNT}', amount).replace('{CATEGORY}', cat).replace('{MERCHANT}', merchStr || '');
      return sendMessage(chatId, reply);
    }

    if (intent === 'update_budget') {
      if (!amount || amount <= 0) return sendMessage(chatId, '⚠️ Sahi budget amount dalein / Please specify a valid budget amount.');
      
      const monthStr = new Date().toISOString().slice(0, 10).substring(0, 7);
      
      const { error: upsertErr } = await supabase.from('monthly_budgets').upsert({
        user_id: userId,
        month: monthStr,
        total_budget: amount
      }, { onConflict: 'user_id, month' });

      if (upsertErr) throw upsertErr;
      
      let reply = reply_template || `✅ Mahine ka budget ₹{AMOUNT} set ho gaya!`;
      reply = reply.replace('{AMOUNT}', amount);
      return sendMessage(chatId, reply);
    }

    if (intent === 'get_category_spend') {
      const monthStr = new Date().toISOString().slice(0, 10).substring(0, 7);
      
      let query = supabase.from('transactions').select('*').eq('user_id', userId).eq('month', monthStr).eq('type', 'expense');
      
      if (merchant) {
         query = query.ilike('description', `%${merchant}%`);
      } else if (category && category.toLowerCase() !== 'other') {
         query = query.eq('category', category.charAt(0).toUpperCase() + category.slice(1).toLowerCase());
      }
      
      const { data: txs } = await query;
      const total = (txs || []).reduce((sum, t) => sum + Number(t.amount), 0);
      
      let reply = reply_template || `📊 You spent ₹{TOTAL_EXPENSE} on {MERCHANT} this month!`;
      reply = reply.replace('{TOTAL_EXPENSE}', total).replace('{MERCHANT}', merchant || category || 'this category');
      return sendMessage(chatId, reply);
    }

    if (intent === 'get_summary' || intent === 'get_monthly_data') {
      const monthStr = new Date().toISOString().slice(0, 10).substring(0, 7);
      
      const [txRes, budgetRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', userId).eq('month', monthStr),
        supabase.from('monthly_budgets').select('*').eq('user_id', userId).eq('month', monthStr).single()
      ]);

      const txs = txRes.data || [];
      const budgetAmount = budgetRes.data?.total_budget;
      
      const totalExpense = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
      const totalIncome = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
      const balance = budgetAmount ? (budgetAmount + totalIncome - totalExpense) : (totalIncome - totalExpense);
      
      let reply = reply_template || `📊 *Summary*\n\n💰 Income: ₹{TOTAL_INCOME}\n💸 Expenses: ₹{TOTAL_EXPENSE}\n🎯 Budget: ₹{BUDGET}\n⚖️ Remaining: ₹{BALANCE}`;
      reply = reply
        .replace('{TOTAL_INCOME}', totalIncome)
        .replace('{TOTAL_EXPENSE}', totalExpense)
        .replace('{BUDGET}', budgetAmount || '0')
        .replace('{BALANCE}', balance);
        
      return sendMessage(chatId, reply);
    }

    return sendMessage(chatId, '🤖 Mujhe samajh nahi aaya, kripya dobara likhein. Try: "Spent ₹500 on Food"');

  } catch (err) {
    console.error('Webhook Error:', err);
    sendMessage(chatId, '❌ An internal error occurred. Please try again later.');
  }
}

// 1. Webhook Route (For Production Vercel/Render deployments)
app.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  if (req.body?.message?.text) {
    await handleMessage(req.body.message);
  }
});

// 2. Long Polling Route (For Local Development without NGrok/LocalTunnel)
async function startPolling() {
  console.log("🧹 Clearing active Webhooks to activate Local Polling...");
  await fetch(`${TELEGRAM_API}/deleteWebhook`);
  
  console.log("📡 Telegram Local Polling Activated! No localtunnel or ngrok required.");
  let lastUpdateId = 0;
  
  setInterval(async () => {
    try {
      const res = await fetch(`${TELEGRAM_API}/getUpdates?offset=${lastUpdateId + 1}&timeout=5`);
      const data = await res.json();
      
      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          lastUpdateId = Math.max(lastUpdateId, update.update_id);
          if (update.message && update.message.text) {
            console.log(`📩 Incoming: ${update.message.text}`);
            await handleMessage(update.message);
          }
        }
      }
    } catch (e) { } // Ignore timeout errors natively
  }, 2000);
}

startPolling();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 ExpenseIQ Backend Server running on port ${PORT}`);
});
