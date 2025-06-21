import React from 'react';
import { Calendar, Tag, ArrowUpRight } from 'lucide-react';
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Chi tiêu gần đây
        </h3>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Tag size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Chưa có chi tiêu nào được ghi nhận
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            Thêm chi tiêu đầu tiên
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Chi tiêu gần đây
        </h3>
        <button className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          <span>Xem tất cả</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
      
      <div className="space-y-4">
        {expenses.map((expense) => (
          <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Tag size={14} className="text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {expense.description}
                </span>
                {expense.isRecurring && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                    Định kỳ
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar size={12} />
                <span>{format(new Date(expense.date), 'dd/MM/yyyy', { locale: vi })}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(expense.amount)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};