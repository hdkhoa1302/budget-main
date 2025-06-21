import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, CreditCard, Target } from 'lucide-react';
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

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const lastMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear;
  });

  const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const lastMonthTotal = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalBudget = currentBudget?.totalAllocated || 0;
  const monthlyIncome = currentBudget?.monthlyIncome || 0;
  const remainingBudget = totalBudget - totalSpent;
  const savingsAmount = monthlyIncome - totalSpent;

  const spendingTrend = lastMonthTotal > 0 ? ((totalSpent - lastMonthTotal) / lastMonthTotal) * 100 : 0;
  const budgetUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-4 sm:p-6 border border-blue-100 dark:border-blue-800/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Chào mừng trở lại! 👋
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Đây là tổng quan tài chính của bạn trong tháng {new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex-shrink-0 self-center sm:self-auto">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <DollarSign size={24} className="sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard
          title="Thu nhập tháng"
          value={monthlyIncome}
          icon={DollarSign}
          color="green"
          subtitle="Tổng thu nhập"
        />
        <StatCard
          title="Đã chi tiêu"
          value={totalSpent}
          icon={TrendingDown}
          color="red"
          trend={spendingTrend !== 0 ? {
            value: Math.abs(spendingTrend),
            direction: spendingTrend > 0 ? 'up' : 'down'
          } : undefined}
        />
        <StatCard
          title="Ngân sách còn lại"
          value={remainingBudget}
          icon={Target}
          color={remainingBudget >= 0 ? 'blue' : 'red'}
          subtitle={`${budgetUsage.toFixed(1)}% đã sử dụng`}
        />
        <StatCard
          title="Tiết kiệm"
          value={savingsAmount}
          icon={TrendingUp}
          color={savingsAmount >= 0 ? 'green' : 'red'}
          subtitle={monthlyIncome > 0 ? `${((savingsAmount / monthlyIncome) * 100).toFixed(1)}% thu nhập` : undefined}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        <div className="xl:col-span-2">
          <BudgetOverview budget={currentBudget} />
        </div>
        <div>
          <RecentExpenses expenses={currentMonthExpenses.slice(0, 5)} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Hành động nhanh
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group touch-manipulation">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <TrendingDown size={20} className="sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100 text-center">Thêm chi tiêu</span>
          </button>
          
          <button className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group touch-manipulation">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Target size={20} className="sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-100 text-center">Tạo ngân sách</span>
          </button>
          
          <button className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group touch-manipulation">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <CreditCard size={20} className="sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-purple-900 dark:text-purple-100 text-center">Quản lý nợ</span>
          </button>
          
          <button className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors group touch-manipulation">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <PieChart size={20} className="sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-orange-900 dark:text-orange-100 text-center">Xem báo cáo</span>
          </button>
        </div>
      </div>
    </div>
  );
};