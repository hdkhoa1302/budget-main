import React, { useState } from 'react';
import { SpendingChart } from './SpendingChart';
import { CategoryChart } from './CategoryChart';
import { TrendChart } from './TrendChart';
import { Expense, BudgetCategory } from '../../types';

interface AnalyticsViewProps {
  expenses: Expense[];
  categories: BudgetCategory[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  expenses,
  categories,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Phân tích chi tiêu</h2>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as 'month' | 'quarter' | 'year')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="month">Tháng này</option>
          <option value="quarter">Quý này</option>
          <option value="year">Năm này</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart 
          expenses={expenses} 
          categories={categories} 
          period={selectedPeriod}
        />
        <CategoryChart 
          expenses={expenses} 
          categories={categories} 
          period={selectedPeriod}
        />
      </div>

      <TrendChart expenses={expenses} period={selectedPeriod} />
    </div>
  );
};