// CSV export utility using PapaParse
import Papa from 'papaparse';

/**
 * Export an array of transactions to a CSV file and trigger a browser download.
 * @param {Array} transactions
 * @param {string} filename
 */
export const exportToCSV = (transactions, filename = 'transactions.csv') => {
  // Shape data for CSV – exclude internal fields
  const rows = transactions.map((t) => ({
    Date: t.date ? new Date(t.date).toLocaleDateString() : '',
    Type: t.type,
    Category: t.category,
    Description: t.description || '',
    Amount: t.amount,
    Currency: import.meta.env.VITE_DEFAULT_CURRENCY || 'USD',
  }));

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
