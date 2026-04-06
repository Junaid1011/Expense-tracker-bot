// SummaryCard – reusable stat card for dashboard
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const SummaryCard = ({ label, value, icon: Icon, variant = 'income', trend, onAction }) => {
  const variants = {
    income: { card: 'card-income', text: 'text-green-100', icon: 'text-green-200' },
    expense: { card: 'card-expense', text: 'text-red-100', icon: 'text-red-200' },
    savings: { card: 'card-savings', text: 'text-violet-100', icon: 'text-violet-200' },
  };

  const v = variants[variant] || variants.income;

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  return (
    <div className={`${v.card} rounded-2xl p-5 shadow-lg animate-fade-in hover:scale-[1.02] transition-transform duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <p className={`text-xs font-semibold uppercase tracking-wider ${v.text} opacity-80`}>{label}</p>
            {onAction && (
              <button 
                onClick={onAction} 
                className={`text-[10px] font-medium leading-none px-1.5 py-0.5 rounded-md border border-${v.text}/30 ${v.text} opacity-80 hover:opacity-100 hover:bg-white/10 transition-colors`}
              >
                Edit
              </button>
            )}
          </div>
          <p className="text-2xl font-bold text-white mt-1 leading-tight">{value}</p>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-white/10 ${v.icon}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs ${v.text} opacity-80`}>
          <TrendIcon size={13} />
          <span>{Math.abs(trend).toFixed(1)}% vs last month</span>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
