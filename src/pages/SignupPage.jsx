// Sign up page
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, Mail, Lock, Eye, EyeOff, CheckCircle, User } from 'lucide-react';
import toast from 'react-hot-toast';

const SignupPage = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (!form.fullName || !form.email || !form.password || !form.confirm) return 'Please fill in all fields.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email.';
    
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongRegex.test(form.password)) {
      return 'Password must be at least 8 chars, including uppercase, lowercase, numbers & special chars.';
    }
    
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    try {
      const data = await signUp(form.email, form.password, form.fullName);
      
      if (data?.user?.identities && data.user.identities.length === 0) {
        throw new Error('Email is already in use.');
      }

      if (data?.session) {
        toast.success('Account created! Welcome to ExpenseIQ.');
        navigate('/');
      } else {
        setSuccess(true);
        toast.success('Account created! Check your email to confirm.');
      }
    } catch (err) {
      setError(err.message || 'Failed to create account. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
        <div className="glass-card rounded-2xl p-8 shadow-2xl max-w-md w-full text-center animate-fade-in">
          <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Check your email</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            We sent a confirmation link to <strong>{form.email}</strong>. Click the link to activate your account.
          </p>
          <Link to="/login" className="btn-primary inline-flex">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 shadow-2xl animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Wallet size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Create account</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Start tracking your expenses today</p>
          </div>

          <form id="signup-form" onSubmit={handleSubmit} className="space-y-4" autoComplete="off" noValidate>
            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg border border-red-100 dark:border-red-900 animate-fade-in">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="signup-name" type="text" name="fullName" value={form.fullName} onChange={handleChange}
                  placeholder="John Doe" className="input-base !pl-10" autoComplete="off" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="signup-email" type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" className="input-base !pl-10" autoComplete="off" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="signup-password" type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} placeholder="Strong password (8+ chars)" className="input-base !pl-10 !pr-10" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="signup-confirm" type="password" name="confirm" value={form.confirm}
                  onChange={handleChange} placeholder="Repeat password" className="input-base !pl-10" autoComplete="new-password" />
              </div>
            </div>

            <button id="signup-submit" type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account…</>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
