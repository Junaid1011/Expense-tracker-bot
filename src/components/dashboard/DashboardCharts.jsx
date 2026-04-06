import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const DashboardCharts = ({ transactions, budget }) => {
  // Expense Category Breakdown
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const map = {};
    expenses.forEach(t => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Line Chart Data (spending over time)
  const lineData = useMemo(() => {
    const map = {};
    const expenses = transactions.filter(t => t.type === 'expense');
    expenses.forEach(t => {
      const day = t.date.substring(5, 10); // MM-DD
      map[day] = (map[day] || 0) + Number(t.amount);
    });
    return Object.entries(map)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  // Gauge Data for total spent vs budget
  const expenseTotal = categoryData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* Category Pie Chart */}
      <div className="glass-card rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Expenses by Category</h3>
        {categoryData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-500">
            No expenses recorded yet.
          </div>
        )}
      </div>

      {/* Daily Spending Line Chart */}
      <div className="glass-card rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Daily Spending</h3>
        {lineData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => formatCurrency(val)} />
                <Tooltip formatter={(value) => formatCurrency(value)} labelStyle={{ color: '#000' }} />
                <Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-500">
            No expenses recorded yet.
          </div>
        )}
      </div>

    </div>
  );
};

export default DashboardCharts;
