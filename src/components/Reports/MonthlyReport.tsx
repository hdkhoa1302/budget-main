import React from 'react';
import { TrendingUp, TrendingDown, Calendar, Target } from 'lucide-react';
import { Expense, BudgetCategory, Budget } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface MonthlyReportProps {
  expenses: Expense[];
  categories: BudgetCategory[];
  selectedMonth: string;
  currentBudget: Budget | null;
}

export const MonthlyReport: React.FC<MonthlyReportProps> = ({
  expenses,
  categories,
  selectedMonth,
  currentBudget,
}) => {
  const [year, month] = selectedMonth.split('-').map(Number);
  
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getFullYear() === year && expenseDate.getMonth() === month - 1;
  });

  const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalBudget = currentBudget?.totalAllocated || 0;
  const budgetUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const categoryBreakdown = categories.map(category => {
    const categoryExpenses = monthlyExpenses.filter(expense => expense.categoryId === category.id);
    const spent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const percentage = totalSpent > 0 ? (spent / totalSpent) * 100 : 0;
    
    return {
      ...category,
      spent,
      percentage,
      transactionCount: categoryExpenses.length,
    };
  }).filter(category => category.spent > 0);

  const monthName = format(new Date(year, month - 1), 'MMMM yyyy', { locale: vi });

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Báo cáo chi tiêu tháng {monthName}
        </h3>
        <p className="text-gray-600">
          Tổng quan về tình hình tài chính trong tháng
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-blue-600 mb-2">
            <TrendingDown size={24} className="mx-auto" />
          </div>
          <p className="text-sm text-blue-600 font-medium">Tổng chi tiêu</p>
          <p className="text-xl font-bold text-blue-900">{formatCurrency(totalSpent)}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-green-600 mb-2">
            <Target size={24} className="mx-auto" />
          </div>
          <p className="text-sm text-green-600 font-medium">Sử dụng ngân sách</p>
          <p className="text-xl font-bold text-green-900">{budgetUsage.toFixed(1)}%</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-purple-600 mb-2">
            <Calendar size={24} className="mx-auto" />
          </div>
          <p className="text-sm text-purple-600 font-medium">Số giao dịch</p>
          <p className="text-xl font-bold text-purple-900">{monthlyExpenses.length}</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-orange-600 mb-2">
            <TrendingUp size={24} className="mx-auto" />
          </div>
          <p className="text-sm text-orange-600 font-medium">Trung bình/ngày</p>
          <p className="text-xl font-bold text-orange-900">
            {formatCurrency(totalSpent / new Date(year, month, 0).getDate())}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Chi tiết theo danh mục
        </h4>
        
        {categoryBreakdown.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Không có chi tiêu nào trong tháng này
          </p>
        ) : (
          <div className="space-y-4">
            {categoryBreakdown
              .sort((a, b) => b.spent - a.spent)
              .map((category) => (
                <div key={category.id} className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{category.icon}</div>
                      <div>
                        <h5 className="font-medium text-gray-900">{category.name}</h5>
                        <p className="text-sm text-gray-600">
                          {category.transactionCount} giao dịch
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(category.spent)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {category.percentage.toFixed(1)}% tổng chi tiêu
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${category.percentage}%`,
                        backgroundColor: category.color 
                      }}
                    />
                  </div>
                  
                  {category.allocatedAmount > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      Ngân sách: {formatCurrency(category.allocatedAmount)} | 
                      Sử dụng: {((category.spent / category.allocatedAmount) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};