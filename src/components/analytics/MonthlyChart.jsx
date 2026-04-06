// MonthlyChart – bar chart of monthly income vs expense
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getMonthLabel, formatCurrency } from '../../utils/formatters';
import { useMemo } from 'react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="font-semibold text-slate-700 dark:text-white mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="text-sm">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

const MonthlyChart = ({ transactions }) => {
  // Aggregate by month (last 12 months)
  const data = useMemo(() => {
    const monthMap = {};
    transactions.forEach((tx) => {
      const label = getMonthLabel(tx.date);
      if (!monthMap[label]) monthMap[label] = { month: label, Income: 0, Expense: 0 };
      if (tx.type === 'income') monthMap[label].Income += Number(tx.amount);
      else monthMap[label].Expense += Number(tx.amount);
    });

    // Sort by date
    return Object.values(monthMap).sort((a, b) => {
      const da = new Date(a.month);
      const db = new Date(b.month);
      return da - db;
    }).slice(-12);
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        No data to display. Add some transactions first.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
        <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MonthlyChart;
