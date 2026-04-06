// Zustand store for transactions
// Handles fetch, add, update, delete, and computed selectors

import { create } from 'zustand';
import * as txService from '../services/transactionService';

const useTransactionStore = create((set) => ({
  transactions: [],
  loading: false,
  error: null,
  selectedMonth: new Date().toISOString().substring(0, 7), // Default to current month

  // ── Actions ──

  setSelectedMonth: (month) => set({ selectedMonth: month }),

  /**
   * Fetch all transactions for a user from Supabase.
   * @param {string} userId
   */
  fetchTransactions: async (userId) => {
    set({ loading: true, error: null });
    try {
      const data = await txService.getTransactions(userId);
      set({ transactions: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  /**
   * Optimistically add a transaction (then replace with server data).
   * @param {Object} transaction
   */
  addTransaction: async (transaction) => {
    try {
      const newTx = await txService.addTransaction(transaction);
      set((state) => ({
        transactions: [newTx, ...state.transactions],
      }));
      return newTx;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  /**
   * Update an existing transaction in store and DB.
   * @param {string} id
   * @param {Object} updates
   */
  updateTransaction: async (id, updates) => {
    try {
      const updated = await txService.updateTransaction(id, updates);
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? updated : t)),
      }));
      return updated;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  /**
   * Delete a transaction from store and DB.
   * @param {string} id
   */
  deleteTransaction: async (id) => {
    try {
      await txService.deleteTransaction(id);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  // Handle real-time events
  onRealtimeInsert: (tx) => {
    set((state) => {
      const exists = state.transactions.find((t) => t.id === tx.id);
      if (exists) return state;
      return { transactions: [tx, ...state.transactions] };
    });
  },
  onRealtimeUpdate: (tx) => {
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === tx.id ? tx : t)),
    }));
  },
  onRealtimeDelete: (tx) => {
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== tx.id),
    }));
  },

  clearTransactions: () => set({ transactions: [], error: null }),
}));

export default useTransactionStore;
