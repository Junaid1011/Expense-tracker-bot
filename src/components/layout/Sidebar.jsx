// Sidebar – navigation links for the expense tracker
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Wallet,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

const Sidebar = ({ open, onClose }) => {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      window.location.href = '/login';
    } catch {
      toast.error('Failed to sign out');
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-40 flex flex-col
          bg-white dark:bg-slate-900
          border-r border-slate-100 dark:border-slate-800
          transition-transform duration-300 ease-in-out shadow-xl
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:shadow-none
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-md">
            <Wallet size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-800 dark:text-white leading-none">
              ExpenseIQ
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Smart Tracker</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + Sign out */}
        <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) => `block px-3 py-2 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isActive ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''}`}
          >
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{user?.user_metadata?.full_name || 'User'}</p>
            <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
          </NavLink>
          <button
            onClick={handleSignOut}
            className="nav-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
