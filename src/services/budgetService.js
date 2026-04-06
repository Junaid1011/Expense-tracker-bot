import { supabase } from './supabase';

const TABLE = 'monthly_budgets';

/**
 * Fetch the budget for a specific user and month.
 * @param {string} userId
 * @param {string} month YYYY-MM
 */
export const getBudgetForMonth = async (userId, month) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .maybeSingle();

  if (error) throw error;
  return data; // null if no budget set
};

/**
 * Insert or update the monthly budget
 * @param {string} userId
 * @param {string} month YYYY-MM
 * @param {number} totalBudget
 */
export const setBudgetForMonth = async (userId, month, totalBudget) => {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      { user_id: userId, month, total_budget: totalBudget },
      { onConflict: 'user_id,month' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};
