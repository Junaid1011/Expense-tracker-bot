// TransactionsPage – full transactions list with CRUD + filters
import { useState, useMemo } from 'react';
import { Plus, Download } from 'lucide-react';
import useTransactions from '../hooks/useTransactions';
import { useAuth } from '../contexts/AuthContext';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionModal from '../components/transactions/TransactionModal';
import TransactionForm from '../components/transactions/TransactionForm';
import { exportToCSV } from '../utils/exportCSV';
import toast from 'react-hot-toast';

const defaultFilters = { type: 'all', category: 'all', search: '', dateFrom: '', dateTo: '' };

const TransactionsPage = () => {
  const { user } = useAuth();
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const [filters, setFilters] = useState(defaultFilters);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Apply filters
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filters.type !== 'all' && tx.type !== filters.type) return false;
      if (filters.category !== 'all' && tx.category !== filters.category) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!tx.description?.toLowerCase().includes(q) && !tx.category?.toLowerCase().includes(q)) return false;
      }
      if (filters.dateFrom && new Date(tx.date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(tx.date) > new Date(filters.dateTo + 'T23:59:59')) return false;
      return true;
    });
  }, [transactions, filters]);

  const handleOpenAdd = () => { setEditingTx(null); setModalOpen(true); };
  const handleOpenEdit = (tx) => { setEditingTx(tx); setModalOpen(true); };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editingTx) {
        await updateTransaction(editingTx.id, formData);
        toast.success('Transaction updated!');
      } else {
        await addTransaction({ ...formData, user_id: user.id });
        toast.success('Transaction added!');
      }
      setModalOpen(false);
      setEditingTx(null);
    } catch (err) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTransaction(deleteTarget.id);
      toast.success('Transaction deleted.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) { toast.error('No transactions to export.'); return; }
    exportToCSV(filtered, `transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success('Exported to CSV!');
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button id="export-csv-btn" onClick={handleExport} className="btn-secondary text-sm py-2">
            <Download size={15} />Export CSV
          </button>
          <button id="add-transaction-btn" onClick={handleOpenAdd} className="btn-primary text-sm py-2">
            <Plus size={15} />Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <TransactionFilters filters={filters} onChange={setFilters} />

      {/* Table */}
      <TransactionTable
        transactions={filtered}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={setDeleteTarget}
      />

      {/* Add/Edit Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTx(null); }}
        title={editingTx ? 'Edit Transaction' : 'Add Transaction'}
      >
        <TransactionForm
          initialData={editingTx}
          onSubmit={handleSubmit}
          onCancel={() => { setModalOpen(false); setEditingTx(null); }}
          loading={submitting}
        />
      </TransactionModal>

      {/* Delete Confirmation Modal */}
      <TransactionModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Transaction"
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            Are you sure you want to delete{' '}
            <strong>{deleteTarget?.description || deleteTarget?.category}</strong>? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button id="delete-cancel" onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Cancel</button>
            <button id="delete-confirm" onClick={handleDeleteConfirm} className="btn-danger flex-1">Delete</button>
          </div>
        </div>
      </TransactionModal>
    </div>
  );
};

export default TransactionsPage;
