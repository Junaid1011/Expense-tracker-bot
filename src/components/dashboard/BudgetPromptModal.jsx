import { useState } from 'react';
import useMonthlyBudget from '../../hooks/useMonthlyBudget';
import { formatCurrency } from '../../utils/formatters';

const BudgetPromptModal = ({ isOpen, onClose, selectedMonth }) => {
  const { saveBudget, loading } = useMonthlyBudget();
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    try {
      await saveBudget(Number(amount));
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} type="button" className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          Set Monthly Budget
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Enter your total budget for {selectedMonth}. You can always adjust this later.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-medium">
                ₹
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                className="input-field pl-8 w-full border border-slate-300 dark:border-slate-700 rounded-lg py-2 px-3 focus:ring focus:ring-brand-500/20 bg-transparent text-slate-900 dark:text-white"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className="w-2/3 btn-primary py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetPromptModal;
