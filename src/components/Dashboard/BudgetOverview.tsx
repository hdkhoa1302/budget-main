import React from 'react';
import { Budget } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface BudgetOverviewProps {
  budget: Budget | null;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budget }) => {
  if (!budget || budget.categories.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tình hình ngân sách</h3>
        <p className="text-gray-500 text-center py-8">
          Chưa có ngân sách được thiết lập
        </p>
      </div>
    );
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-100';
    if (percentage >= 80) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tình hình ngân sách</h3>
      
      <div className="space-y-4">
        {budget.categories.map((category) => {
          const percentage = category.allocatedAmount > 0 
            ? (category.spentAmount / category.allocatedAmount) * 100 
            : 0;
          
          return (
            <div key={category.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {formatCurrency(category.spentAmount)} / {formatCurrency(category.allocatedAmount)}
                </span>
              </div>
              
              <div className={`w-full rounded-full h-2 ${getProgressBgColor(percentage)}`}>
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>{percentage.toFixed(1)}% đã sử dụng</span>
                <span className={percentage >= 100 ? 'text-red-600 font-medium' : ''}>
                  {percentage >= 100 ? 'Vượt ngân sách' : `Còn ${formatCurrency(category.allocatedAmount - category.spentAmount)}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};