import React from 'react';
import { Budget } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface BudgetOverviewProps {
  budget: Budget | null;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budget }) => {
  if (!budget || budget.categories.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tình hình ngân sách
        </h3>
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={24} className="sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Chưa có ngân sách được thiết lập
          </p>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors touch-manipulation">
            Tạo ngân sách đầu tiên
          </button>
        </div>
      </div>
    );
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-100 dark:bg-red-900/20';
    if (percentage >= 80) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-green-100 dark:bg-green-900/20';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 100) return <AlertTriangle size={16} className="text-red-500 dark:text-red-400" />;
    if (percentage >= 80) return <AlertTriangle size={16} className="text-yellow-500 dark:text-yellow-400" />;
    return <CheckCircle size={16} className="text-green-500 dark:text-green-400" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tình hình ngân sách
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {budget.categories.length} danh mục
        </div>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {budget.categories.map((category) => {
          const percentage = category.allocatedAmount > 0 
            ? (category.spentAmount / category.allocatedAmount) * 100 
            : 0;
          
          return (
            <div key={category.id} className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className="text-lg sm:text-xl flex-shrink-0">{category.icon}</div>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base block truncate">
                      {category.name}
                    </span>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(percentage)}
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                        {formatCurrency(category.spentAmount)} / {formatCurrency(category.allocatedAmount)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {percentage >= 100 ? 'Vượt ngân sách' : `Còn ${formatCurrency(category.allocatedAmount - category.spentAmount)}`}
                  </div>
                </div>
              </div>
              
              <div className={`w-full rounded-full h-2 ${getProgressBgColor(percentage)}`}>
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};