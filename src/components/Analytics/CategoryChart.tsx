import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Expense, BudgetCategory } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface CategoryChartProps {
  expenses: Expense[];
  categories: BudgetCategory[];
  period: 'month' | 'quarter' | 'year';
}

export const CategoryChart: React.FC<CategoryChartProps> = ({
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
    
    const categoryTotals = categories.map(category => {
      const categoryExpenses = filteredExpenses.filter(expense => expense.categoryId === category.id);
      const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        name: category.name,
        value: total,
        color: category.color,
        icon: category.icon,
      };
    }).filter(item => item.value > 0);

    return categoryTotals;
  };

  const data = getChartData();

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Phân bổ chi tiêu theo danh mục
        </h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Không có dữ liệu để hiển thị</p>
        </div>
      </div>
    );
  }

  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Phân bổ chi tiêu theo danh mục
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => formatCurrency(value as number)}
              labelFormatter={(label) => `${data.find(d => d.name === label)?.icon} ${label}`}
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg)',
                border: '1px solid var(--tooltip-border)',
                borderRadius: '8px',
                color: 'var(--tooltip-text)'
              }}
            />
            <Legend 
              formatter={(value) => {
                const item = data.find(d => d.name === value);
                return `${item?.icon} ${value}`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};