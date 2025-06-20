import React, { useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { Expense, BudgetCategory, ExpenseFormData } from '../../types';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseList } from './ExpenseList';
import { ExpenseStats } from './ExpenseStats';

interface ExpenseViewProps {
  expenses: Expense[];
  categories: BudgetCategory[];
  onExpenseAdd: (expense: Expense) => void;
  onExpenseUpdate: (expense: Expense) => void;
  onExpenseDelete: (expenseId: string) => void;
}

export const ExpenseView: React.FC<ExpenseViewProps> = ({
  expenses,
  categories,
  onExpenseAdd,
  onExpenseUpdate,
  onExpenseDelete,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  const handleExpenseSubmit = (formData: ExpenseFormData) => {
    const expense: Expense = {
      id: editingExpense?.id || Date.now().toString(),
      amount: parseFloat(formData.amount),
      categoryId: formData.categoryId,
      description: formData.description,
      date: new Date(formData.date),
      isRecurring: formData.isRecurring,
      recurringType: formData.recurringType,
      notes: formData.notes,
    };

    if (editingExpense) {
      onExpenseUpdate(expense);
    } else {
      onExpenseAdd(expense);
    }

    setShowForm(false);
    setEditingExpense(null);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || expense.categoryId === selectedCategory;
    const matchesDateRange = (!dateRange.start || expense.date >= new Date(dateRange.start)) &&
                            (!dateRange.end || expense.date <= new Date(dateRange.end));
    
    return matchesSearch && matchesCategory && matchesDateRange;
  });

  if (showForm) {
    return (
      <ExpenseForm
        categories={categories}
        expense={editingExpense}
        onSubmit={handleExpenseSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingExpense(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý chi tiêu</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Thêm chi tiêu</span>
        </button>
      </div>

      <ExpenseStats expenses={filteredExpenses} categories={categories} />

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm chi tiêu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">đến</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <ExpenseList
          expenses={filteredExpenses}
          categories={categories}
          onEdit={handleEdit}
          onDelete={onExpenseDelete}
        />
      </div>
    </div>
  );
};