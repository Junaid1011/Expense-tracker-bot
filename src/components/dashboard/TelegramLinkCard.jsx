import { useState } from 'react';
import { MessageCircle, Copy, Check } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const TelegramLinkCard = () => {
  const { user } = useAuth();
  const [code, setCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateCode = async () => {
    setLoading(true);
    try {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { error } = await supabase.from('telegram_link_codes').insert({
        code: newCode,
        user_id: user.id
      });
      if (error) throw error;
      setCode(newCode);
    } catch (err) {
      toast.error('Failed to generate linking code.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`/link ${code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-2xl p-5 shadow-lg mt-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-500">
          <MessageCircle size={22} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white">Telegram AI Bot</h3>
          <p className="text-xs text-slate-500">Log expenses using natural language instantly.</p>
        </div>
      </div>

      {!code ? (
        <button onClick={generateCode} disabled={loading} className="btn-secondary w-full text-sm">
          {loading ? 'Generating...' : 'Connect Telegram'}
        </button>
      ) : (
        <div className="mt-3 animate-fade-in">
          <p className="text-xs font-medium text-slate-500 mb-1">Message your bot with this code:</p>
          <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg p-1.5 border border-slate-200 dark:border-slate-700">
            <code className="flex-1 px-3 text-sm font-mono text-slate-700 dark:text-slate-300">/link {code}</code>
            <button onClick={copyToClipboard} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center">Expires in 10 minutes. Only share this with the official bot.</p>
        </div>
      )}
    </div>
  );
};

export default TelegramLinkCard;
