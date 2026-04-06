// TransactionFilters – filter bar for the transactions page
import { Search, X } from 'lucide-react';

const TYPES = ['all', 'income', 'expense'];
const CATEGORIES = [
  'all',
  'Salary', 'Freelance', 'Business', 'Investment', 'Gift',
  'Food & Dining', 'Transport', 'Shopping', 'Bills & Utilities',
  'Healthcare', 'Entertainment', 'Education', 'Travel', 'Other',
];

const TransactionFilters = ({ filters, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const clearFilters = () => {
    onChange({ type: 'all', category: 'all', search: '', dateFrom: '', dateTo: '' });
  };

  const hasFilters =
    filters.type !== 'all' ||
    filters.category !== 'all' ||
    filters.search ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="glass-card rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Search */}
        <div className="flex-1 min-w-40">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            Search
          </label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="filter-search"
              type="text"
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              placeholder="Description or category…"
              className="input-base !pl-9 text-sm py-2"
            />
          </div>
        </div>

        {/* Type */}
        <div className="min-w-32">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Type</label>
          <select
            id="filter-type"
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="input-base text-sm py-2"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="min-w-40">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            Category
          </label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="input-base text-sm py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div className="min-w-36">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">From</label>
          <input
            id="filter-date-from"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleChange('dateFrom', e.target.value)}
            className="input-base text-sm py-2"
          />
        </div>

        {/* Date To */}
        <div className="min-w-36">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">To</label>
          <input
            id="filter-date-to"
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleChange('dateTo', e.target.value)}
            className="input-base text-sm py-2"
          />
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            id="filter-clear"
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionFilters;
