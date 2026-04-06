// Navbar – top bar with title, dark mode toggle, and hamburger menu
import { Menu, Moon, Sun, Home } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import useDarkMode from '../../hooks/useDarkMode';

const pageTitles = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/analytics': 'Analytics',
};

const Navbar = ({ onMenuClick }) => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'ExpenseIQ';

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          id="menu-toggle"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h2 className="font-semibold text-lg text-slate-800 dark:text-white">{title}</h2>
      </div>

      {/* Right: dark mode toggle + mobile home */}
      <div className="flex items-center gap-2">
        {location.pathname !== '/' && (
          <Link
            to="/"
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Go to Dashboard"
          >
            <Home size={18} />
          </Link>
        )}
        <button
          id="dark-mode-toggle"
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} className="text-slate-500" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
