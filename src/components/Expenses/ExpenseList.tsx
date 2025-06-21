import React from 'react';
import { Edit2, Trash2, Calendar, Tag, Repeat } from 'lucide-react';
import { Expense, BudgetCategory } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ExpenseListProps {
  expenses: Expense[];
  categories: BudgetCategory[];
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  categories,
  onEdit,
  onDelete,
}) => {
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? `${category.icon} ${category.name}` : 'Không xác định';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#6b7280';
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Chưa có chi tiêu nào được ghi nhận</p>
      </div>
    );
  }

  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedExpenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: getCategoryColor(expense.categoryId) }}
              />
              <h3 className="font-medium text-gray-900 dark:text-white truncate">{expense.description}</h3>
              {expense.isRecurring && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 flex-shrink-0">
                  <Repeat size={12} className="mr-1" />
                  Định kỳ
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap gap-y-1">
              <div className="flex items-center space-x-1">
                <Tag size={14} />
                <span className="truncate">{getCategoryName(expense.categoryId)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{format(new Date(expense.date), 'dd/MM/yyyy', { locale: vi })}</span>
              </div>
            </div>
            
            {expense.notes && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{expense.notes}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-3 flex-shrink-0 ml-3">
            <div className="text-right">
              <div className="font-semibold text-lg text-gray-900 dark:text-white">
                {formatCurrency(expense.amount)}
              </div>
              {expense.isRecurring && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {expense.recurringType === 'daily' && 'Hàng ngày'}
                  {expense.recurringType === 'weekly' && 'Hàng tuần'}
                  {expense.recurringType === 'monthly' && 'Hàng tháng'}
                </div>
              )}
            </div>
            
            <div className="flex space-x-1">
              <button
                onClick={() => onEdit(expense)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors touch-manipulation"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(expense.id)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors touch-manipulation"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};