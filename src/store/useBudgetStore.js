import { create } from 'zustand';
import * as budgetService from '../services/budgetService';

export const useBudgetStore = create((set) => ({
  budget: null,
  loading: false,
  error: null,

  fetchBudget: async (userId, month) => {
    set({ loading: true, error: null });
    try {
      const data = await budgetService.getBudgetForMonth(userId, month);
      set({ budget: data ? Number(data.total_budget) : null, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  setBudget: async (userId, month, amount) => {
    set({ loading: true, error: null });
    try {
      const data = await budgetService.setBudgetForMonth(userId, month, amount);
      set({ budget: Number(data.total_budget), loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  clearBudget: () => set({ budget: null, error: null, loading: false })
}));
