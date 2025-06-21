import React, { useState } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { Budget, BudgetCategory } from '../../types';
import { formatCurrency, parseCurrency } from '../../utils/currency';

interface BudgetSetupProps {
  existingBudget: Budget | null;
  onSave: (budget: Budget) => void;
  onCancel: () => void;
}

const defaultCategories = [
  { name: 'Thực phẩm & Đồ uống', color: '#ef4444', icon: '🍽️' },
  { name: 'Giao thông', color: '#3b82f6', icon: '🚗' },
  { name: 'Giải trí', color: '#8b5cf6', icon: '🎬' },
  { name: 'Mua sắm', color: '#06b6d4', icon: '🛍️' },
  { name: 'Y tế', color: '#10b981', icon: '🏥' },
  { name: 'Giáo dục', color: '#f59e0b', icon: '📚' },
];

export const BudgetSetup: React.FC<BudgetSetupProps> = ({
  existingBudget,
  onSave,
  onCancel,
}) => {
  const [monthlyIncome, setMonthlyIncome] = useState(
    existingBudget?.monthlyIncome.toString() || ''
  );
  const [categories, setCategories] = useState<BudgetCategory[]>(
    existingBudget?.categories || []
  );

  const addCategory = (preset?: typeof defaultCategories[0]) => {
    const newCategory: BudgetCategory = {
      id: Date.now().toString(),
      name: preset?.name || 'Danh mục mới',
      allocatedAmount: 0,
      spentAmount: 0,
      color: preset?.color || '#6b7280',
      icon: preset?.icon || '💰',
    };
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (id: string, field: keyof BudgetCategory, value: any) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  const removeCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const handleSave = () => {
    const income = parseCurrency(monthlyIncome);
    const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
    
    const budget: Budget = {
      id: existingBudget?.id || Date.now().toString(),
      monthlyIncome: income,
      categories,
      totalAllocated,
      totalSpent: categories.reduce((sum, cat) => sum + cat.spentAmount, 0),
      month: new Date().toISOString().slice(0, 7),
      year: new Date().getFullYear(),
    };

    onSave(budget);
  };

  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
  const income = parseCurrency(monthlyIncome);
  const remaining = income - totalAllocated;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {existingBudget ? 'Chỉnh sửa ngân sách' : 'Thiết lập ngân sách'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-2"
        >
          <X size={24} />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Thu nhập hàng tháng
        </label>
        <input
          type="text"
          value={monthlyIncome}
          onChange={(e) => setMonthlyIncome(e.target.value)}
          placeholder="0"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Danh mục ngân sách</h3>
          <div className="flex space-x-2">
            {defaultCategories.map((preset, index) => (
              <button
                key={index}
                onClick={() => addCategory(preset)}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                title={preset.name}
              >
                {preset.icon}
              </button>
            ))}
            <button
              onClick={() => addCategory()}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <input
                type="text"
                value={category.icon}
                onChange={(e) => updateCategory(category.id, 'icon', e.target.value)}
                className="w-12 text-center bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-2 py-1 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                value={category.name}
                onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                className="flex-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-3 py-2 text-gray-900 dark:text-white"
              />
              <input
                type="color"
                value={category.color}
                onChange={(e) => updateCategory(category.id, 'color', e.target.value)}
                className="w-12 h-10 border border-gray-300 dark:border-gray-500 rounded"
              />
              <input
                type="number"
                value={category.allocatedAmount}
                onChange={(e) => updateCategory(category.id, 'allocatedAmount', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-32 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-3 py-2 text-right text-gray-900 dark:text-white"
              />
              <button
                onClick={() => removeCategory(category.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">Thu nhập:</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(income)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">Đã phân bổ:</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(totalAllocated)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t border-blue-200 dark:border-blue-800 pt-2 mt-2">
            <span className="text-gray-700 dark:text-gray-300">Còn lại:</span>
            <span className={remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={handleSave}
          disabled={!monthlyIncome || categories.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <Save size={16} />
          <span>Lưu ngân sách</span>
        </button>
      </div>
    </div>
  );
};