import React from 'react';
import { Calendar, Tag } from 'lucide-react';
import { Expense } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface RecentExpensesProps {
  expenses: Expense[];
}

export const RecentExpenses: React.FC<RecentExpensesProps> = ({ expenses }) => {
  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiêu gần đây</h3>
        <p className="text-gray-500 text-center py-8">
          Chưa có chi tiêu nào được ghi nhận
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiêu gần đây</h3>
      
      <div className="space-y-3">
        {expenses.map((expense) => (
          <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Tag size={14} className="text-gray-500" />
                <span className="font-medium text-gray-900">{expense.description}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar size={12} />
                <span>{format(new Date(expense.date), 'dd/MM/yyyy', { locale: vi })}</span>
                {expense.isRecurring && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Định kỳ
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">
                {formatCurrency(expense.amount)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};