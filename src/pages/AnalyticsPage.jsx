// Analytics page – monthly chart + category pie chart
import useTransactions from '../hooks/useTransactions';
import MonthlyChart from '../components/analytics/MonthlyChart';
import CategoryPieChart from '../components/analytics/CategoryPieChart';
import { formatCurrency } from '../utils/formatters';
import { useMemo } from 'react';

const AnalyticsPage = () => {
  const { transactions, loading, totalIncome, totalExpense, savings } = useTransactions();

  // Top spending categories
  const topCategories = useMemo(() => {
    const map = {};
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        {[1, 2].map((i) => (
          <div key={i} className="glass-card rounded-2xl p-6 shadow-md">
            <div className="skeleton h-5 w-48 rounded mb-4" />
            <div className="skeleton h-64 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Income', value: formatCurrency(totalIncome), color: 'text-green-500' },
          { label: 'Total Expense', value: formatCurrency(totalExpense), color: 'text-red-500' },
          { label: 'Net Savings', value: formatCurrency(savings), color: savings >= 0 ? 'text-violet-500' : 'text-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card rounded-xl p-4 shadow-sm text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly chart */}
        <div className="glass-card rounded-2xl p-5 shadow-md">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-1">Monthly Overview</h3>
          <p className="text-xs text-slate-400 mb-4">Income vs Expense by month</p>
          <MonthlyChart transactions={transactions} />
        </div>

        {/* Category pie */}
        <div className="glass-card rounded-2xl p-5 shadow-md">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-1">Expense by Category</h3>
          <p className="text-xs text-slate-400 mb-4">How your expenses are distributed</p>
          <CategoryPieChart transactions={transactions} />
        </div>
      </div>

      {/* Top spending categories */}
      {topCategories.length > 0 && (
        <div className="glass-card rounded-2xl p-5 shadow-md">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Top Spending Categories</h3>
          <div className="space-y-3">
            {topCategories.map(({ name, value }, idx) => {
              const max = topCategories[0].value;
              const pct = Math.round((value / max) * 100);
              return (
                <div key={name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {idx + 1}. {name}
                    </span>
                    <span className="font-bold text-red-500">{formatCurrency(value)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
