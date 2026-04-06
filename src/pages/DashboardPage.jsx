// Dashboard page – summary cards, month selector, robust charts
import { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus, Calendar, Target, Activity, CreditCard } from 'lucide-react';
import useTransactions from '../hooks/useTransactions';
import useMonthlyBudget from '../hooks/useMonthlyBudget';
import SummaryCard from '../components/dashboard/SummaryCard';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import BudgetPromptModal from '../components/dashboard/BudgetPromptModal';
import TelegramLinkCard from '../components/dashboard/TelegramLinkCard';
import { formatCurrency, formatDate } from '../utils/formatters';

const CATEGORIES = {
  income: '#10b981',
  expense: '#ef4444',
};

const getRecentMonths = (count = 12) => {
  const dates = [];
  const curr = new Date();
  for (let i = 0; i < count; i++) {
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0');
    dates.push(`${y}-${m}`);
    curr.setMonth(curr.getMonth() - 1);
  }
  return dates;
};

const DashboardPage = () => {
  const { 
    filteredTransactions, 
    loading: txLoading, 
    totalExpense, 
    totalIncome,
    selectedMonth, 
    setSelectedMonth 
  } = useTransactions();
  
  const { budget, loading: budgetLoading } = useMonthlyBudget();
  
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const recentMonths = useMemo(() => getRecentMonths(), []);

  // Show the modal if budget is strictly null, not loading, and tx load is complete
  useEffect(() => {
    if (!budgetLoading && !txLoading && budget === null && selectedMonth) {
      setShowBudgetModal(true);
    } else {
      setShowBudgetModal(false);
    }
  }, [budget, budgetLoading, txLoading, selectedMonth]);

  // Recent 5 transactions
  const recent = useMemo(() => filteredTransactions.slice(0, 5), [filteredTransactions]);

  // Skeleton rows for transactions lists
  const skeletonRows = Array.from({ length: 4 });

  const remainingBalance = (budget !== null ? budget : 0) + totalIncome - totalExpense;
  const loading = txLoading || budgetLoading;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 pb-8">
      {/* Budget Modal - Prompts users on entry of uncategorized month */}
      <BudgetPromptModal 
        isOpen={showBudgetModal} 
        onClose={() => setShowBudgetModal(false)}
        selectedMonth={selectedMonth}
      />

      {/* Header controls (Month Selector) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage and track your financial status</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <Calendar size={18} className="text-slate-500 ml-2" />
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent border-none text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-0 outline-none cursor-pointer pr-2"
          >
            {recentMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <SummaryCard
          label="Monthly Budget"
          value={budget !== null ? formatCurrency(budget) : 'Not Set'}
          icon={Target}
          variant="income"
          onAction={() => setShowBudgetModal(true)}
        />
        <SummaryCard
          label="Total Expenses"
          value={formatCurrency(totalExpense)}
          icon={Activity}
          variant="expense"
        />
        <SummaryCard
          label="Remaining Balance"
          value={formatCurrency(remainingBalance)}
          icon={CreditCard}
          variant={remainingBalance < 0 ? 'expense' : 'savings'}
        />
      </div>

      {/* Analytics Charts */}
      {!loading && <DashboardCharts transactions={filteredTransactions} budget={budget} />}

      {/* Recent transactions */}
      <div className="glass-card rounded-2xl shadow-sm overflow-hidden mt-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white text-base">Recent Transactions</h3>
          <Link
            to="/transactions"
            className="flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {skeletonRows.map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton w-9 h-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3.5 w-2/3 rounded" />
                  <div className="skeleton h-3 w-1/3 rounded" />
                </div>
                <div className="skeleton h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-60">
              <Plus size={28} className="text-white" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">No transactions yet for this month.</p>
            <Link to="/transactions" className="btn-primary inline-flex mt-4 text-sm">
              Add your first transaction
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {recent.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: CATEGORIES[tx.type] || '#94a3b8' }}
                >
                  {tx.category?.charAt(0).toUpperCase() || '?'}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                    {tx.description || tx.category}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {tx.category} • {formatDate(tx.date)}
                  </p>
                </div>

                <p
                  className={`text-sm font-bold shrink-0 ${
                    tx.type === 'income' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Telegram Link Card */}
      <TelegramLinkCard />
    </div>
  );
};

export default DashboardPage;
