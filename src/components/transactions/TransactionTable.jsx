// TransactionTable – responsive table with edit/delete actions
import { Pencil, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const TransactionTable = ({ transactions, onEdit, onDelete, loading }) => {
  const skeletonRows = Array.from({ length: 5 });

  if (loading) {
    return (
      <div className="glass-card rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                {['Date', 'Description', 'Category', 'Type', 'Amount', 'Actions'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {skeletonRows.map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j}><div className="skeleton h-4 rounded w-20" /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="glass-card rounded-2xl shadow-md p-12 text-center">
        <p className="text-slate-400 dark:text-slate-500 text-sm">No transactions match your filters.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                  {formatDate(tx.date)}
                </td>
                <td className="text-slate-800 dark:text-white font-medium max-w-xs">
                  <p className="truncate">{tx.description || '—'}</p>
                </td>
                <td>
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-full font-medium">
                    {tx.category}
                  </span>
                </td>
                <td>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                    tx.type === 'income' ? 'badge-income' : 'badge-expense'
                  }`}>
                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                  </span>
                </td>
                <td className={`font-bold text-sm ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-500 transition-colors"
                      aria-label="Edit transaction"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(tx)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors"
                      aria-label="Delete transaction"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
