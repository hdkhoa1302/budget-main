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
    if (percentage >= 100) return 'bg-red-100';
    if (percentage >= 80) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{category.icon}</div>
          <div>
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-600">
              {formatCurrency(category.spentAmount)} / {formatCurrency(category.allocatedAmount)}
            </p>
          </div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          <span className="text-gray-600">{percentage.toFixed(1)}% đã sử dụng</span>
          <span className={`font-medium ${percentage >= 100 ? 'text-red-600' : 'text-green-600'}`}>
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