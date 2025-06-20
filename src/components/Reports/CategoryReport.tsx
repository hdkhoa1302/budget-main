import React from 'react';
import { Expense, BudgetCategory } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CategoryReportProps {
  expenses: Expense[];
  categories: BudgetCategory[];
  selectedMonth: string;
}

export const CategoryReport: React.FC<CategoryReportProps> = ({
  expenses,
  categories,
  selectedMonth,
}) => {
  const [year, month] = selectedMonth.split('-').map(Number);
  
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getFullYear() === year && expenseDate.getMonth() === month - 1;
  });

  const categoryDetails = categories.map(category => {
    const categoryExpenses = monthlyExpenses.filter(expense => expense.categoryId === category.id);
    const totalSpent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const avgTransaction = categoryExpenses.length > 0 ? totalSpent / categoryExpenses.length : 0;
    
    return {
      ...category,
      expenses: categoryExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      totalSpent,
      avgTransaction,
      transactionCount: categoryExpenses.length,
    };
  }).filter(category => category.expenses.length > 0);

  const monthName = format(new Date(year, month - 1), 'MMMM yyyy', { locale: vi });

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Báo cáo chi tiết theo danh mục - {monthName}
        </h3>
        <p className="text-gray-600">
          Phân tích chi tiết từng danh mục chi tiêu
        </p>
      </div>

      {categoryDetails.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Không có chi tiêu nào trong tháng này</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categoryDetails
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .map((category) => (
              <div key={category.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{category.icon}</div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {category.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {category.transactionCount} giao dịch
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(category.totalSpent)}
                      </p>
                      <p className="text-sm text-gray-600">
                        TB: {formatCurrency(category.avgTransaction)}
                      </p>
                    </div>
                  </div>
                  
                  {category.allocatedAmount > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Ngân sách: {formatCurrency(category.allocatedAmount)}</span>
                        <span>
                          {((category.totalSpent / category.allocatedAmount) * 100).toFixed(1)}% đã sử dụng
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (category.totalSpent / category.allocatedAmount) * 100 >= 100
                              ? 'bg-red-500'
                              : (category.totalSpent / category.allocatedAmount) * 100 >= 80
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ 
                            width: `${Math.min((category.totalSpent / category.allocatedAmount) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    {category.expenses.map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{expense.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{format(new Date(expense.date), 'dd/MM/yyyy', { locale: vi })}</span>
                            {expense.isRecurring && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                Định kỳ
                              </span>
                            )}
                          </div>
                          {expense.notes && (
                            <p className="text-sm text-gray-500 mt-1">{expense.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(expense.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};