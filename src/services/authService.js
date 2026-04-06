// Auth service – wraps Supabase Auth methods
import { supabase } from './supabase';

/**
 * Sign up a new user with email and password.
 * @param {string} email
 * @param {string} password
 */
export const signUp = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });
  if (error) throw error;
  return data;
};

/**
 * Sign in an existing user.
 * @param {string} email
 * @param {string} password
 */
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

/**
 * Sign out the current user.
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Get the currently authenticated session.
 */
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

/**
 * Listen to auth state changes.
 * @param {Function} callback - Called with (event, session)
 */
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

/**
 * Safely manipulate the signed-in User password context array.
 * @param {string} newPassword
 */
export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
};
