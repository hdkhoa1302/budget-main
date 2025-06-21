import React, { useState } from 'react';
import { X, DollarSign, Calendar, User } from 'lucide-react';
import { Debt, DebtParticipant, DebtPayment } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { format } from 'date-fns';

interface PaymentModalProps {
  debt: Debt;
  participants: DebtParticipant[];
  onClose: () => void;
  onPaymentAdd: (payment: DebtPayment) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  debt,
  participants,
  onClose,
  onPaymentAdd,
}) => {
  const [amount, setAmount] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');

  const isGroupType = debt.type === 'group_payment' || debt.type === 'group_receive';
  const remainingAmount = debt.totalAmount - (debt.paidAmount || 0);

  const getParticipantName = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    return participant?.name || 'Không xác định';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentAmount = parseFloat(amount);
    if (paymentAmount <= 0 || paymentAmount > remainingAmount) {
      alert('Số tiền thanh toán không hợp lệ');
      return;
    }

    if (isGroupType && !selectedParticipant) {
      alert('Vui lòng chọn người thanh toán');
      return;
    }

    const payment: DebtPayment = {
      id: Date.now().toString(),
      debtId: debt.id,
      amount: paymentAmount,
      date: new Date(date),
      participantId: isGroupType ? selectedParticipant : debt.participantId,
      notes: notes.trim() || undefined,
    };

    onPaymentAdd(payment);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ghi nhận thanh toán</h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-2"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">{debt.title}</h4>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Tổng số tiền:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(debt.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Đã thanh toán:</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(debt.paidAmount || 0)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
              <span className="text-gray-600 dark:text-gray-400">Còn lại:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(remainingAmount)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Số tiền thanh toán <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                step="0.01"
                max={remainingAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
                required
              />
            </div>
          </div>

          {isGroupType && debt.splits && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Người thanh toán <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={selectedParticipant}
                  onChange={(e) => setSelectedParticipant(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Chọn người thanh toán</option>
                  {debt.splits.map(split => (
                    <option key={split.participantId} value={split.participantId}>
                      {getParticipantName(split.participantId)} - {formatCurrency(split.amount)}
                      {split.isPaid ? ' (Đã trả)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ngày thanh toán <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ghi chú
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Thêm ghi chú về thanh toán này..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <DollarSign size={16} />
              <span>Ghi nhận thanh toán</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};