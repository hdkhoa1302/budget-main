import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { StatCard } from './StatCard';
import { BudgetOverview } from './BudgetOverview';
import { RecentExpenses } from './RecentExpenses';
import { Budget, Expense } from '../../types';

interface DashboardViewProps {
  currentBudget: Budget | null;
  expenses: Expense[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentBudget,
  expenses,
}) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalBudget = currentBudget?.totalAllocated || 0;
  const monthlyIncome = currentBudget?.monthlyIncome || 0;
  const remainingBudget = totalBudget - totalSpent;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tổng quan tài chính</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Thu nhập tháng"
            value={monthlyIncome}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Tổng ngân sách"
            value={totalBudget}
            icon={PieChart}
            color="blue"
          />
          <StatCard
            title="Đã chi tiêu"
            value={totalSpent}
            icon={TrendingDown}
            color="red"
          />
          <StatCard
            title="Còn lại"
            value={remainingBudget}
            icon={TrendingUp}
            color={remainingBudget >= 0 ? 'green' : 'red'}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetOverview budget={currentBudget} />
        <RecentExpenses expenses={currentMonthExpenses.slice(0, 5)} />
      </div>
    </div>
  );
};