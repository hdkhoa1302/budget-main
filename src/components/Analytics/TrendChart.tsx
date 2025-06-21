import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Expense } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { format, startOfWeek, startOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { vi } from 'date-fns/locale';

interface TrendChartProps {
  expenses: Expense[];
  period: 'month' | 'quarter' | 'year';
}

export const TrendChart: React.FC<TrendChartProps> = ({
  expenses,
  period,
}) => {
  const getChartData = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let intervals: Date[] = [];
    let formatStr = '';

    switch (period) {
      case 'month':
        intervals = eachDayOfInterval({
          start: new Date(currentYear, currentMonth, 1),
          end: now,
        });
        formatStr = 'dd/MM';
        break;
      case 'quarter':
        const quarterStart = new Date(currentYear, Math.floor(currentMonth / 3) * 3, 1);
        intervals = eachWeekOfInterval({
          start: quarterStart,
          end: now,
        });
        formatStr = 'dd/MM';
        break;
      case 'year':
        intervals = eachMonthOfInterval({
          start: new Date(currentYear, 0, 1),
          end: now,
        });
        formatStr = 'MM/yyyy';
        break;
    }

    return intervals.map(date => {
      const dayExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        
        if (period === 'month') {
          return expenseDate.toDateString() === date.toDateString();
        } else if (period === 'quarter') {
          const weekStart = startOfWeek(date, { weekStartsOn: 1 });
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          return expenseDate >= weekStart && expenseDate <= weekEnd;
        } else {
          return expenseDate.getMonth() === date.getMonth() && 
                 expenseDate.getFullYear() === date.getFullYear();
        }
      });

      const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);

      return {
        date: format(date, formatStr, { locale: vi }),
        amount: total,
        fullDate: date,
      };
    });
  };

  const data = getChartData();

  if (data.length === 0 || data.every(item => item.amount === 0)) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Xu hướng chi tiêu
        </h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Không có dữ liệu để hiển thị</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Xu hướng chi tiêu
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis 
              dataKey="date" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
              stroke="var(--chart-text)"
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value).replace('₫', '').trim()}
              fontSize={12}
              stroke="var(--chart-text)"
            />
            <Tooltip 
              formatter={(value) => [formatCurrency(value as number), 'Chi tiêu']}
              labelStyle={{ color: 'var(--tooltip-text)' }}
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg)',
                border: '1px solid var(--tooltip-border)',
                borderRadius: '8px',
                color: 'var(--tooltip-text)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};