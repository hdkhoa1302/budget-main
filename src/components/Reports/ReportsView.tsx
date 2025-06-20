import React, { useState } from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import { Expense, BudgetCategory, Budget } from '../../types';
import { MonthlyReport } from './MonthlyReport';
import { CategoryReport } from './CategoryReport';
import { formatCurrency } from '../../utils/currency';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ReportsViewProps {
  expenses: Expense[];
  categories: BudgetCategory[];
  currentBudget: Budget | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  expenses,
  categories,
  currentBudget,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [reportType, setReportType] = useState<'monthly' | 'category'>('monthly');

  const generateCSVReport = () => {
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = format(new Date(expense.date), 'yyyy-MM');
      return expenseDate === selectedMonth;
    });

    const csvContent = [
      ['Ngày', 'Mô tả', 'Danh mục', 'Số tiền', 'Ghi chú', 'Định kỳ'].join(','),
      ...filteredExpenses.map(expense => {
        const category = categories.find(cat => cat.id === expense.categoryId);
        return [
          format(new Date(expense.date), 'dd/MM/yyyy'),
          `"${expense.description}"`,
          `"${category ? category.name : 'Không xác định'}"`,
          expense.amount.toString(),
          `"${expense.notes || ''}"`,
          expense.isRecurring ? 'Có' : 'Không',
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bao-cao-chi-tieu-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDFReport = () => {
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = format(new Date(expense.date), 'yyyy-MM');
      return expenseDate === selectedMonth;
    });

    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const [year, month] = selectedMonth.split('-');
    const monthName = format(new Date(parseInt(year), parseInt(month) - 1), 'MMMM yyyy', { locale: vi });

    // Simple HTML report that can be printed as PDF
    const reportHTML = `
      <html>
        <head>
          <title>Báo cáo chi tiêu ${monthName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; background-color: #e8f4f8; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Báo cáo chi tiêu</h1>
            <h2>${monthName}</h2>
          </div>
          
          <div class="summary">
            <p><strong>Tổng chi tiêu:</strong> ${formatCurrency(total)}</p>
            <p><strong>Số giao dịch:</strong> ${filteredExpenses.length}</p>
            <p><strong>Ngày tạo báo cáo:</strong> ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Mô tả</th>
                <th>Danh mục</th>
                <th>Số tiền</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              ${filteredExpenses.map(expense => {
                const category = categories.find(cat => cat.id === expense.categoryId);
                return `
                  <tr>
                    <td>${format(new Date(expense.date), 'dd/MM/yyyy')}</td>
                    <td>${expense.description}</td>
                    <td>${category ? category.name : 'Không xác định'}</td>
                    <td>${formatCurrency(expense.amount)}</td>
                    <td>${expense.notes || ''}</td>
                  </tr>
                `;
              }).join('')}
              <tr class="total">
                <td colspan="3"><strong>Tổng cộng</strong></td>
                <td><strong>${formatCurrency(total)}</strong></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Báo cáo chi tiêu</h2>
        <div className="flex space-x-3">
          <button
            onClick={generateCSVReport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download size={20} />
            <span>Xuất CSV</span>
          </button>
          <button
            onClick={generatePDFReport}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <FileText size={20} />
            <span>Xuất PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar size={20} className="text-gray-500" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setReportType('monthly')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                reportType === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Báo cáo tháng
            </button>
            <button
              onClick={() => setReportType('category')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                reportType === 'category'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Báo cáo danh mục
            </button>
          </div>
        </div>

        {reportType === 'monthly' ? (
          <MonthlyReport
            expenses={expenses}
            categories={categories}
            selectedMonth={selectedMonth}
            currentBudget={currentBudget}
          />
        ) : (
          <CategoryReport
            expenses={expenses}
            categories={categories}
            selectedMonth={selectedMonth}
          />
        )}
      </div>
    </div>
  );
};