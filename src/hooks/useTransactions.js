import { useEffect, useRef, useMemo } from 'react';
import useTransactionStore from '../store/useTransactionStore';
import { subscribeToTransactions } from '../services/transactionService';
import { useAuth } from '../contexts/AuthContext';

const useTransactions = () => {
  const { user } = useAuth();
  const store = useTransactionStore();
  const channelRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Fetch initial data
    store.fetchTransactions(user.id);

    // Subscribe to real-time changes
    channelRef.current = subscribeToTransactions(
      user.id,
      store.onRealtimeInsert,
      store.onRealtimeUpdate,
      store.onRealtimeDelete
    );

    return () => {
      // Clean up subscription
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
      store.clearTransactions();
    };
  }, [user?.id]);
  
  // Reactively calculate items natively on render (forces UI to observe arrays correctly)
  const filteredTransactions = useMemo(() => {
    return store.transactions.filter(t => t.month === store.selectedMonth || (t.date && t.date.substring(0, 7) === store.selectedMonth));
  }, [store.transactions, store.selectedMonth]);

  const totalExpense = useMemo(() => filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0), [filteredTransactions]);
  const totalIncome = useMemo(() => filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0), [filteredTransactions]);

  return { 
    ...store, 
    filteredTransactions, 
    totalExpense, 
    totalIncome, 
    savings: totalIncome - totalExpense 
  };
};

export default useTransactions;
