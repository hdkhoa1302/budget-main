import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Expense, BudgetCategory } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface SpendingChartProps {
  expenses: Expense[];
  categories: BudgetCategory[];
  period: 'month' | 'quarter' | 'year';
}

export const SpendingChart: React.FC<SpendingChartProps> = ({
  expenses,
  categories,
  period,
}) => {
  const getFilteredExpenses = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const expenseYear = expenseDate.getFullYear();
      const expenseMonth = expenseDate.getMonth();
      const expenseQuarter = Math.floor(expenseMonth / 3);

      switch (period) {
        case 'month':
          return expenseYear === currentYear && expenseMonth === currentMonth;
        case 'quarter':
          return expenseYear === currentYear && expenseQuarter === currentQuarter;
        case 'year':
          return expenseYear === currentYear;
        default:
          return true;
      }
    });
  };

  const getChartData = () => {
    const filteredExpenses = getFilteredExpenses();
    
    return categories.map(category => {
      const categoryExpenses = filteredExpenses.filter(expense => expense.categoryId === category.id);
      const spent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        name: category.name,
        'Ngân sách': category.allocatedAmount,
        'Đã chi': spent,
        'Còn lại': Math.max(0, category.allocatedAmount - spent),
        fill: category.color,
      };
    }).filter(item => item['Ngân sách'] > 0 || item['Đã chi'] > 0);
  };

  const data = getChartData();

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ngân sách vs Chi tiêu thực tế
        </h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Không có dữ liệu để hiển thị</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Ngân sách vs Chi tiêu thực tế
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value).replace('₫', '').trim()}
              fontSize={12}
            />
            <Tooltip 
              formatter={(value, name) => [formatCurrency(value as number), name]}
              labelStyle={{ color: '#374151' }}
            />
            <Bar dataKey="Ngân sách" fill="#3b82f6" opacity={0.7} />
            <Bar dataKey="Đã chi" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};