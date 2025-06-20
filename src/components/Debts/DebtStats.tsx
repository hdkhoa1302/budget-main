import React from 'react';
import { TrendingUp, TrendingDown, Users, Clock } from 'lucide-react';
import { Debt, DebtParticipant } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface DebtStatsProps {
  debts: Debt[];
  participants: DebtParticipant[];
}

export const DebtStats: React.FC<DebtStatsProps> = ({
  debts,
  participants,
}) => {
  const lendingDebts = debts.filter(debt => debt.type === 'lend' || debt.type === 'group_receive');
  const borrowingDebts = debts.filter(debt => debt.type === 'borrow' || debt.type === 'group_payment');
  
  const totalLending = lendingDebts.reduce((sum, debt) => sum + debt.totalAmount, 0);
  const totalBorrowing = borrowingDebts.reduce((sum, debt) => sum + debt.totalAmount, 0);
  
  const paidLending = lendingDebts.reduce((sum, debt) => sum + (debt.paidAmount || 0), 0);
  const paidBorrowing = borrowingDebts.reduce((sum, debt) => sum + (debt.paidAmount || 0), 0);
  
  const pendingLending = totalLending - paidLending;
  const pendingBorrowing = totalBorrowing - paidBorrowing;
  
  const overdueDebts = debts.filter(debt => {
    if (!debt.dueDate || debt.status === 'completed') return false;
    return new Date(debt.dueDate) < new Date();
  });

  const activeParticipants = new Set(
    debts
      .filter(debt => debt.status !== 'completed')
      .flatMap(debt => {
        if (debt.participantId) return [debt.participantId];
        if (debt.splits) return debt.splits.map(split => split.participantId);
        return [];
      })
  ).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tôi cho mượn</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(pendingLending)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Tổng: {formatCurrency(totalLending)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-green-50 text-green-700">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tôi mượn</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(pendingBorrowing)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Tổng: {formatCurrency(totalBorrowing)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-red-50 text-red-700">
            <TrendingDown size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Quá hạn</p>
            <p className="text-2xl font-bold text-orange-600">
              {overdueDebts.length}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Khoản vay nợ
            </p>
          </div>
          <div className="p-3 rounded-lg bg-orange-50 text-orange-700">
            <Clock size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Người tham gia</p>
            <p className="text-2xl font-bold text-blue-600">
              {activeParticipants}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Đang hoạt động
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 text-blue-700">
            <Users size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};