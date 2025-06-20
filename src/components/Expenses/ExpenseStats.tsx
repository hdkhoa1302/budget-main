import React from 'react';
import { TrendingUp, TrendingDown, Calendar, Target } from 'lucide-react';
import { Expense, BudgetCategory } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface ExpenseStatsProps {
  expenses: Expense[];
  categories: BudgetCategory[];
}

export const ExpenseStats: React.FC<ExpenseStatsProps> = ({
  expenses,
  categories,
}) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const lastMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear;
  });

  const currentMonthTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const lastMonthTotal = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const monthlyChange = lastMonthTotal > 0 
    ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
    : 0;

  const totalBudget = categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
  const budgetUsedPercentage = totalBudget > 0 ? (currentMonthTotal / totalBudget) * 100 : 0;

  const avgDailySpending = currentMonthExpenses.length > 0 
    ? currentMonthTotal / new Date().getDate()
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Chi tiêu tháng này</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(currentMonthTotal)}
            </p>
            <p className={`text-sm mt-1 ${
              monthlyChange >= 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {monthlyChange >= 0 ? '↗' : '↘'} {Math.abs(monthlyChange).toFixed(1)}% so với tháng trước
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 text-blue-700">
            <Calendar size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Sử dụng ngân sách</p>
            <p className="text-2xl font-bold text-gray-900">
              {budgetUsedPercentage.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatCurrency(currentMonthTotal)} / {formatCurrency(totalBudget)}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${
            budgetUsedPercentage >= 100 ? 'bg-red-50 text-red-700' :
            budgetUsedPercentage >= 80 ? 'bg-yellow-50 text-yellow-700' :
            'bg-green-50 text-green-700'
          }`}>
            <Target size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Trung bình/ngày</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(avgDailySpending)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Tính theo {new Date().getDate()} ngày
            </p>
          </div>
          <div className="p-3 rounded-lg bg-purple-50 text-purple-700">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Giao dịch</p>
            <p className="text-2xl font-bold text-gray-900">
              {currentMonthExpenses.length}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Trong tháng này
            </p>
          </div>
          <div className="p-3 rounded-lg bg-orange-50 text-orange-700">
            <TrendingDown size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};