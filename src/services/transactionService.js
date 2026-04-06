// Transaction service – CRUD operations on the `transactions` table
import { supabase } from './supabase';

const TABLE = 'transactions';

/**
 * Fetch all transactions for a given user, ordered by date descending.
 * @param {string} userId
 */
export const getTransactions = async (userId) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
};

export const addTransaction = async (transaction) => {
  // Extract month from date (YYYY-MM-DD -> YYYY-MM)
  const month = transaction.date ? transaction.date.substring(0, 7) : new Date().toISOString().substring(0, 7);
  const payload = { ...transaction, month };

  const { data, error } = await supabase
    .from(TABLE)
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateTransaction = async (id, updates) => {
  let payload = { ...updates };
  if (updates.date) {
    payload.month = updates.date.substring(0, 7);
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/**
 * Delete a transaction by id.
 * @param {string} id
 */
export const deleteTransaction = async (id) => {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
};

/**
 * Subscribe to real-time changes on the transactions table for a specific user.
 * @param {string} userId
 * @param {Function} onInsert
 * @param {Function} onUpdate
 * @param {Function} onDelete
 * @returns {Object} Supabase channel – call .unsubscribe() to clean up
 */
export const subscribeToTransactions = (userId, onInsert, onUpdate, onDelete) => {
  const channel = supabase
    .channel(`transactions:user:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: TABLE, filter: `user_id=eq.${userId}` },
      (payload) => onInsert(payload.new)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: TABLE, filter: `user_id=eq.${userId}` },
      (payload) => onUpdate(payload.new)
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: TABLE, filter: `user_id=eq.${userId}` },
      (payload) => onDelete(payload.old)
    )
    .subscribe();

  return channel;
};
