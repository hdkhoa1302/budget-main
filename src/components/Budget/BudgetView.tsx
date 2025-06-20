import React, { useState } from 'react';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { Budget, BudgetCategory } from '../../types';
import { BudgetSetup } from './BudgetSetup';
import { BudgetSelector } from './BudgetSelector';
import { CategoryCard } from './CategoryCard';
import { formatCurrency } from '../../utils/currency';

interface BudgetViewProps {
  budgets: Budget[];
  currentBudget: Budget | null;
  onBudgetUpdate: (budget: Budget) => void;
  onBudgetDelete: (budgetId: string) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgets,
  currentBudget,
  onBudgetUpdate,
  onBudgetDelete,
}) => {
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(currentBudget);
  const [showSetup, setShowSetup] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);

  const handleBudgetSave = (budget: Budget) => {
    onBudgetUpdate(budget);
    setSelectedBudget(budget);
    setShowSetup(false);
  };

  const handleCreateNew = (month: string, year: number) => {
    const newBudget: Budget = {
      id: Date.now().toString(),
      monthlyIncome: 0,
      categories: [],
      totalAllocated: 0,
      totalSpent: 0,
      month,
      year,
    };
    setSelectedBudget(newBudget);
    setShowSetup(true);
  };

  const handleCopyFromPrevious = () => {
    if (!selectedBudget) return;

    const previousMonth = new Date(selectedBudget.year, parseInt(selectedBudget.month.split('-')[1]) - 2);
    const previousMonthStr = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;
    
    const previousBudget = budgets.find(b => 
      b.month === previousMonthStr && b.year === previousMonth.getFullYear()
    );

    if (previousBudget) {
      const copiedBudget: Budget = {
        ...selectedBudget,
        monthlyIncome: previousBudget.monthlyIncome,
        categories: previousBudget.categories.map(cat => ({
          ...cat,
          id: Date.now().toString() + Math.random(),
          spentAmount: 0, // Reset spent amount for new month
        })),
        totalAllocated: previousBudget.totalAllocated,
        totalSpent: 0,
      };
      
      onBudgetUpdate(copiedBudget);
      setSelectedBudget(copiedBudget);
    }
  };

  const handleCategoryUpdate = (updatedCategory: BudgetCategory) => {
    if (!selectedBudget) return;

    const updatedCategories = selectedBudget.categories.map(cat =>
      cat.id === updatedCategory.id ? updatedCategory : cat
    );

    const totalAllocated = updatedCategories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);

    const updatedBudget = {
      ...selectedBudget,
      categories: updatedCategories,
      totalAllocated,
    };

    onBudgetUpdate(updatedBudget);
    setSelectedBudget(updatedBudget);
  };

  const handleCategoryDelete = (categoryId: string) => {
    if (!selectedBudget) return;

    const updatedCategories = selectedBudget.categories.filter(cat => cat.id !== categoryId);
    const totalAllocated = updatedCategories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);

    const updatedBudget = {
      ...selectedBudget,
      categories: updatedCategories,
      totalAllocated,
    };

    onBudgetUpdate(updatedBudget);
    setSelectedBudget(updatedBudget);
  };

  const handleDeleteBudget = () => {
    if (!selectedBudget || !selectedBudget.id) return;
    
    if (confirm('Bạn có chắc chắn muốn xóa ngân sách này?')) {
      onBudgetDelete(selectedBudget.id);
      setSelectedBudget(null);
    }
  };

  if (showSetup) {
    return (
      <BudgetSetup
        existingBudget={selectedBudget}
        onSave={handleBudgetSave}
        onCancel={() => setShowSetup(false)}
      />
    );
  }

  const remainingIncome = selectedBudget 
    ? selectedBudget.monthlyIncome - selectedBudget.totalAllocated 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý ngân sách</h2>
      </div>

      <BudgetSelector
        budgets={budgets}
        selectedBudget={selectedBudget}
        onBudgetSelect={setSelectedBudget}
        onCreateNew={handleCreateNew}
      />

      {selectedBudget && (
        <>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tổng quan ngân sách
              </h3>
              <div className="flex space-x-2">
                {budgets.some(b => b.id !== selectedBudget.id) && (
                  <button
                    onClick={handleCopyFromPrevious}
                    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
                  >
                    <Copy size={16} />
                    <span>Sao chép từ tháng trước</span>
                  </button>
                )}
                <button
                  onClick={() => setShowSetup(true)}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                >
                  <Plus size={16} />
                  <span>Chỉnh sửa</span>
                </button>
                {selectedBudget.id && budgets.find(b => b.id === selectedBudget.id) && (
                  <button
                    onClick={handleDeleteBudget}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 text-sm"
                  >
                    <Trash2 size={16} />
                    <span>Xóa</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Thu nhập tháng</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(selectedBudget.monthlyIncome)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Đã phân bổ</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(selectedBudget.totalAllocated)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Đã chi tiêu</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(selectedBudget.totalSpent)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Còn lại</p>
                <p className={`text-xl font-bold ${remainingIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(remainingIncome)}
                </p>
              </div>
            </div>
          </div>

          {selectedBudget.categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedBudget.categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={setEditingCategory}
                  onDelete={handleCategoryDelete}
                  onUpdate={handleCategoryUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Chưa có danh mục nào được thiết lập</p>
              <button
                onClick={() => setShowSetup(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thêm danh mục
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};