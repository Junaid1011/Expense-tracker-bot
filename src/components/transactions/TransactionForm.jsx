// TransactionForm – controlled form for add/edit transactions
import { useState, useEffect } from 'react';
import { Tag, FileText, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'],
  expense: ['Food & Dining', 'Transport', 'Shopping', 'Bills & Utilities', 'Healthcare', 'Entertainment', 'Education', 'Travel', 'Other'],
};

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];

const defaultForm = {
  type: 'expense',
  amount: '',
  category: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  currency: import.meta.env.VITE_DEFAULT_CURRENCY || 'USD',
};

const TransactionForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        type: initialData.type || 'expense',
        amount: String(initialData.amount || ''),
        category: initialData.category || '',
        description: initialData.description || '',
        date: initialData.date ? initialData.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        currency: initialData.currency || (import.meta.env.VITE_DEFAULT_CURRENCY || 'USD'),
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Reset category when type changes
      if (name === 'type') next.category = '';
      return next;
    });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      errs.amount = 'Enter a valid positive amount.';
    if (!form.category) errs.category = 'Please select a category.';
    if (!form.date) errs.date = 'Please select a date.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit({
      type: form.type,
      amount: parseFloat(form.amount),
      category: form.category,
      description: form.description.trim(),
      date: new Date(form.date).toISOString(),
      currency: form.currency,
    });
  };

  const categories = CATEGORIES[form.type] || [];

  return (
    <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Type toggle */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type</label>
        <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          {['expense', 'income'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, type: t, category: '' }))}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                form.type === t
                  ? t === 'income'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {t === 'income' ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Amount + Currency row */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Amount</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</div>
            <input
              id="tx-amount"
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`input-base !pl-9 ${errors.amount ? 'border-red-400' : ''}`}
            />
          </div>
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
        </div>

        <div className="w-28">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Currency</label>
          <select id="tx-currency" name="currency" value={form.currency} onChange={handleChange} className="input-base">
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          <Tag size={14} className="inline mr-1" />Category
        </label>
        <select
          id="tx-category"
          name="category"
          value={form.category}
          onChange={handleChange}
          className={`input-base ${errors.category ? 'border-red-400' : ''}`}
        >
          <option value="">Select category…</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          <Calendar size={14} className="inline mr-1" />Date
        </label>
        <input
          id="tx-date"
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          max={new Date().toISOString().slice(0, 10)}
          className={`input-base ${errors.date ? 'border-red-400' : ''}`}
        />
        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          <FileText size={14} className="inline mr-1" />Notes (optional)
        </label>
        <textarea
          id="tx-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Add a note…"
          rows={2}
          className="input-base resize-none"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button id="tx-submit" type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
          ) : initialData ? 'Save Changes' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
