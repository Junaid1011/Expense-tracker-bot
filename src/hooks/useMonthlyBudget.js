import { useEffect } from 'react';
import { useBudgetStore } from '../store/useBudgetStore';
import { useAuth } from '../contexts/AuthContext';
import useTransactionStore from '../store/useTransactionStore';

const useMonthlyBudget = () => {
  const { user } = useAuth();
  const { selectedMonth } = useTransactionStore();
  const { budget, loading, error, fetchBudget, setBudget, clearBudget } = useBudgetStore();

  useEffect(() => {
    if (user && selectedMonth) {
      fetchBudget(user.id, selectedMonth);
    } else {
      clearBudget();
    }
  }, [user?.id, selectedMonth, fetchBudget, clearBudget]);

  const saveBudget = async (amount) => {
    if (!user || !selectedMonth) return;
    await setBudget(user.id, selectedMonth, amount);
  };

  return { budget, loading, error, saveBudget };
};

export default useMonthlyBudget;
