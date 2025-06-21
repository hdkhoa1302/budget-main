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
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Chi tiêu gần đây
        </h3>
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Tag size={24} className="sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Chưa có chi tiêu nào được ghi nhận
          </p>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors touch-manipulation">
            Thêm chi tiêu đầu tiên
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Chi tiêu gần đây
        </h3>
        <button className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors touch-manipulation">
          <span>Xem tất cả</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {expenses.map((expense) => (
          <div key={expense.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <Tag size={12} className="sm:w-3.5 sm:h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                  {expense.description}
                </span>
                {expense.isRecurring && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium flex-shrink-0">
                    Định kỳ
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <Calendar size={10} className="sm:w-3 sm:h-3 flex-shrink-0" />
                <span>{format(new Date(expense.date), 'dd/MM/yyyy', { locale: vi })}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                {formatCurrency(expense.amount)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};