import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signIn, updatePassword } from '../services/authService';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Shield } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Safely infer name locally
  const fullName = user?.user_metadata?.full_name || 'ExpenseIQ User';

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    // Strong password check natively mapping matching constraints from Signup
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error('Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character.', { duration: 5000 });
      return;
    }

    try {
      setIsLoading(true);
      // 1. Verify exact legacy password map securely via Supabase backend validations
      await signIn(user.email, currentPassword);
      
      // 2. Perform secured updates
      await updatePassword(newPassword);
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully!');
    } catch (err) {
      console.error('Password update error:', err);
      toast.error(err.message === 'Invalid login credentials' 
        ? 'Current password is not correct.' 
        : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">Profile Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your account credentials and personal details</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Profile Info Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-white/10 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
              <span className="text-3xl font-bold text-white">
                {fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{fullName}</h2>
            <div className="mt-4 space-y-3 text-left bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <User size={18} className="text-indigo-500 shrink-0" />
                <span className="truncate">{fullName}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Mail size={18} className="text-indigo-500 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Security Settings */}
        <div className="md:col-span-2">
          <div className="glass-card rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Security Constraints</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Update your account password securely.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                    placeholder="Enter your current password"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                      placeholder="New strong password"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                      placeholder="Repeat new password"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
