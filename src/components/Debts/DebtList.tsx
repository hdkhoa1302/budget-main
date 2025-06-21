import React, { useState } from 'react';
import { Edit2, Trash2, Calendar, User, Users, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Debt, DebtParticipant, DebtPayment } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { PaymentModal } from './PaymentModal';

interface DebtListProps {
  debts: Debt[];
  participants: DebtParticipant[];
  onEdit: (debt: Debt) => void;
  onDelete: (debtId: string) => void;
  onPaymentAdd: (payment: DebtPayment) => void;
}

export const DebtList: React.FC<DebtListProps> = ({
  debts,
  participants,
  onEdit,
  onDelete,
  onPaymentAdd,
}) => {
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const getParticipantName = (participantId: string) => {
    const participant = participants.find(p => p.id === participantId);
    return participant?.name || 'Không xác định';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'partially_paid':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'overdue':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'partially_paid':
        return 'Trả một phần';
      case 'overdue':
        return 'Quá hạn';
      default:
        return 'Đang hoạt động';
    }
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'lend':
        return { label: 'Cho mượn', icon: DollarSign, color: 'text-green-600 dark:text-green-400' };
      case 'borrow':
        return { label: 'Mượn', icon: DollarSign, color: 'text-red-600 dark:text-red-400' };
      case 'group_payment':
        return { label: 'Trả cho nhóm', icon: Users, color: 'text-blue-600 dark:text-blue-400' };
      case 'group_receive':
        return { label: 'Nhận từ nhóm', icon: User, color: 'text-purple-600 dark:text-purple-400' };
      default:
        return { label: 'Không xác định', icon: DollarSign, color: 'text-gray-600 dark:text-gray-400' };
    }
  };

  const handlePaymentClick = (debt: Debt) => {
    setSelectedDebt(debt);
    setShowPaymentModal(true);
  };

  if (debts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Chưa có khoản vay nợ nào được ghi nhận</p>
      </div>
    );
  }

  const sortedDebts = [...debts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      <div className="space-y-4">
        {sortedDebts.map((debt) => {
          const typeInfo = getTypeInfo(debt.type);
          const TypeIcon = typeInfo.icon;
          const isGroupType = debt.type === 'group_payment' || debt.type === 'group_receive';
          
          return (
            <div
              key={debt.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <TypeIcon size={20} className={typeInfo.color} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{debt.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(debt.status)}`}>
                      {getStatusText(debt.status)}
                    </span>
                  </div>
                  
                  {debt.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{debt.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{format(new Date(debt.date), 'dd/MM/yyyy', { locale: vi })}</span>
                    </div>
                    
                    {debt.dueDate && (
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>Đến hạn: {format(new Date(debt.dueDate), 'dd/MM/yyyy', { locale: vi })}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <span className={`px-2 py-1 rounded text-xs ${typeInfo.color} bg-gray-100 dark:bg-gray-700`}>
                        {typeInfo.label}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(debt)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(debt.id)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(debt.totalAmount)}
                    </p>
                    {debt.paidAmount !== undefined && debt.paidAmount > 0 && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Đã trả: {formatCurrency(debt.paidAmount)}
                      </p>
                    )}
                  </div>
                  
                  {debt.status !== 'completed' && (
                    <button
                      onClick={() => handlePaymentClick(debt)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <DollarSign size={16} />
                      <span>Ghi nhận thanh toán</span>
                    </button>
                  )}
                </div>

                {/* Participant Information */}
                {!isGroupType && debt.participantId && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <User size={14} />
                    <span>{getParticipantName(debt.participantId)}</span>
                  </div>
                )}

                {/* Group Payment Details */}
                {isGroupType && debt.splits && debt.splits.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chi tiết chia tiền:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {debt.splits.map((split, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-2 rounded border ${
                            split.isPaid 
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {split.isPaid ? (
                              <CheckCircle size={14} className="text-green-600 dark:text-green-400" />
                            ) : (
                              <AlertCircle size={14} className="text-yellow-600 dark:text-yellow-400" />
                            )}
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {getParticipantName(split.participantId)}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(split.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment History */}
                {debt.payments && debt.payments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lịch sử thanh toán:</h4>
                    <div className="space-y-1">
                      {debt.payments.slice(0, 3).map((payment, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {format(new Date(payment.date), 'dd/MM/yyyy', { locale: vi })}
                            {payment.participantId && ` - ${getParticipantName(payment.participantId)}`}
                          </span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(payment.amount)}
                          </span>
                        </div>
                      ))}
                      {debt.payments.length > 3 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          và {debt.payments.length - 3} thanh toán khác...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {debt.notes && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{debt.notes}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showPaymentModal && selectedDebt && (
        <PaymentModal
          debt={selectedDebt}
          participants={participants}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedDebt(null);
          }}
          onPaymentAdd={onPaymentAdd}
        />
      )}
    </>
  );
};