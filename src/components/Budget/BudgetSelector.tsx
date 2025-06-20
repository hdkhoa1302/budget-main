import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Budget } from '../../types';
import { format, addMonths, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';

interface BudgetSelectorProps {
  budgets: Budget[];
  selectedBudget: Budget | null;
  onBudgetSelect: (budget: Budget | null) => void;
  onCreateNew: (month: string, year: number) => void;
}

export const BudgetSelector: React.FC<BudgetSelectorProps> = ({
  budgets,
  selectedBudget,
  onBudgetSelect,
  onCreateNew,
}) => {
  const currentDate = new Date();
  const [selectedDate, setSelectedDate] = React.useState(
    selectedBudget ? new Date(selectedBudget.year, parseInt(selectedBudget.month.split('-')[1]) - 1) : currentDate
  );

  const selectedMonth = format(selectedDate, 'yyyy-MM');
  const selectedYear = selectedDate.getFullYear();

  const existingBudget = budgets.find(budget => 
    budget.month === selectedMonth && budget.year === selectedYear
  );

  const handlePreviousMonth = () => {
    const newDate = subMonths(selectedDate, 1);
    setSelectedDate(newDate);
    
    const newMonth = format(newDate, 'yyyy-MM');
    const newYear = newDate.getFullYear();
    const budget = budgets.find(b => b.month === newMonth && b.year === newYear);
    onBudgetSelect(budget || null);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(selectedDate, 1);
    setSelectedDate(newDate);
    
    const newMonth = format(newDate, 'yyyy-MM');
    const newYear = newDate.getFullYear();
    const budget = budgets.find(b => b.month === newMonth && b.year === newYear);
    onBudgetSelect(budget || null);
  };

  const handleCreateBudget = () => {
    onCreateNew(selectedMonth, selectedYear);
  };

  React.useEffect(() => {
    onBudgetSelect(existingBudget || null);
  }, [selectedDate, existingBudget, onBudgetSelect]);

  const isCurrentMonth = format(currentDate, 'yyyy-MM') === selectedMonth;
  const isFutureMonth = selectedDate > currentDate;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Calendar size={20} />
          <span>Chọn ngân sách</span>
        </h3>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="text-center min-w-[200px]">
            <h4 className="text-xl font-bold text-gray-900">
              {format(selectedDate, 'MMMM yyyy', { locale: vi })}
            </h4>
            <div className="flex items-center justify-center space-x-2 mt-1">
              {isCurrentMonth && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  Tháng hiện tại
                </span>
              )}
              {isFutureMonth && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  Tương lai
                </span>
              )}
              {existingBudget && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Có ngân sách
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {!existingBudget ? (
        <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">
            Chưa có ngân sách cho tháng {format(selectedDate, 'MM/yyyy')}
          </p>
          <button
            onClick={handleCreateBudget}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tạo ngân sách mới
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600">Thu nhập</p>
            <p className="text-lg font-bold text-green-600">
              {existingBudget.monthlyIncome.toLocaleString('vi-VN')} ₫
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Đã phân bổ</p>
            <p className="text-lg font-bold text-blue-600">
              {existingBudget.totalAllocated.toLocaleString('vi-VN')} ₫
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Đã chi tiêu</p>
            <p className="text-lg font-bold text-red-600">
              {existingBudget.totalSpent.toLocaleString('vi-VN')} ₫
            </p>
          </div>
        </div>
      )}

      {budgets.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Ngân sách có sẵn:</p>
          <div className="flex flex-wrap gap-2">
            {budgets
              .sort((a, b) => new Date(b.year, parseInt(b.month.split('-')[1]) - 1).getTime() - 
                             new Date(a.year, parseInt(a.month.split('-')[1]) - 1).getTime())
              .slice(0, 6)
              .map((budget) => {
                const budgetDate = new Date(budget.year, parseInt(budget.month.split('-')[1]) - 1);
                const isSelected = budget.month === selectedMonth && budget.year === selectedYear;
                
                return (
                  <button
                    key={budget.id}
                    onClick={() => {
                      setSelectedDate(budgetDate);
                      onBudgetSelect(budget);
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {format(budgetDate, 'MM/yyyy')}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};