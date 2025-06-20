import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, DollarSign, TrendingUp } from 'lucide-react';
import { Debt } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface DebtSummaryProps {
  debts: Debt[];
}

export const DebtSummary: React.FC<DebtSummaryProps> = ({ debts }) => {
  const lendingDebts = debts.filter(debt => debt.type === 'lend' || debt.type === 'group_receive');
  const borrowingDebts = debts.filter(debt => debt.type === 'borrow' || debt.type === 'group_payment');
  
  const totalLending = lendingDebts.reduce((sum, debt) => sum + debt.totalAmount, 0);
  const totalBorrowing = borrowingDebts.reduce((sum, debt) => sum + debt.totalAmount, 0);
  
  const paidLending = lendingDebts.reduce((sum, debt) => sum + (debt.paidAmount || 0), 0);
  const paidBorrowing = borrowingDebts.reduce((sum, debt) => sum + (debt.paidAmount || 0), 0);
  
  const netPosition = (totalLending - paidLending) - (totalBorrowing - paidBorrowing);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <ArrowUpCircle size={24} className="text-green-300" />
          </div>
          <p className="text-sm opacity-90">Tôi cho mượn</p>
          <p className="text-2xl font-bold">
            {formatCurrency(totalLending - paidLending)}
          </p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <ArrowDownCircle size={24} className="text-red-300" />
          </div>
          <p className="text-sm opacity-90">Tôi mượn</p>
          <p className="text-2xl font-bold">
            {formatCurrency(totalBorrowing - paidBorrowing)}
          </p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp size={24} className="text-yellow-300" />
          </div>
          <p className="text-sm opacity-90">Vị thế ròng</p>
          <p className={`text-2xl font-bold ${netPosition >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            {netPosition >= 0 ? '+' : ''}{formatCurrency(netPosition)}
          </p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <DollarSign size={24} className="text-blue-300" />
          </div>
          <p className="text-sm opacity-90">Tổng giao dịch</p>
          <p className="text-2xl font-bold">
            {debts.length}
          </p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-center text-sm opacity-90">
          {netPosition >= 0 
            ? `Bạn đang được nợ ${formatCurrency(Math.abs(netPosition))}` 
            : `Bạn đang nợ ${formatCurrency(Math.abs(netPosition))}`
          }
        </p>
      </div>
    </div>
  );
};