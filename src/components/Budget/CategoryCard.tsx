import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { BudgetCategory } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface CategoryCardProps {
  category: BudgetCategory;
  onEdit: (category: BudgetCategory) => void;
  onDelete: (categoryId: string) => void;
  onUpdate: (category: BudgetCategory) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  onUpdate,
}) => {
  const percentage = category.allocatedAmount > 0 
    ? (category.spentAmount / category.allocatedAmount) * 100 
    : 0;

  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressBgColor = () => {
    if (percentage >= 100) return 'bg-red-100 dark:bg-red-900/20';
    if (percentage >= 80) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-green-100 dark:bg-green-900/20';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="text-2xl flex-shrink-0">{category.icon}</div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{category.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {formatCurrency(category.spentAmount)} / {formatCurrency(category.allocatedAmount)}
            </p>
          </div>
        </div>
        <div className="flex space-x-1 flex-shrink-0">
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors touch-manipulation"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors touch-manipulation"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className={`w-full rounded-full h-3 ${getProgressBgColor()}`}>
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">{percentage.toFixed(1)}% đã sử dụng</span>
          <span className={`font-medium ${percentage >= 100 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {percentage >= 100 
              ? `Vượt ${formatCurrency(category.spentAmount - category.allocatedAmount)}`
              : `Còn ${formatCurrency(category.allocatedAmount - category.spentAmount)}`
            }
          </span>
        </div>
      </div>
    </div>
  );
};