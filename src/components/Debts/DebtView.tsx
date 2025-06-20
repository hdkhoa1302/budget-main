import React, { useState } from 'react';
import { Plus, Filter, Search, Users, User, CreditCard, Banknote } from 'lucide-react';
import { Debt, DebtParticipant, DebtPayment, DebtFormData } from '../../types';
import { DebtForm } from './DebtForm';
import { DebtList } from './DebtList';
import { DebtStats } from './DebtStats';
import { DebtSummary } from './DebtSummary';

interface DebtViewProps {
  debts: Debt[];
  participants: DebtParticipant[];
  payments: DebtPayment[];
  onDebtAdd: (debt: Debt) => void;
  onDebtUpdate: (debt: Debt) => void;
  onDebtDelete: (debtId: string) => void;
  onParticipantAdd: (participant: DebtParticipant) => void;
  onPaymentAdd: (payment: DebtPayment) => void;
}

export const DebtView: React.FC<DebtViewProps> = ({
  debts,
  participants,
  payments,
  onDebtAdd,
  onDebtUpdate,
  onDebtDelete,
  onParticipantAdd,
  onPaymentAdd,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const handleDebtSubmit = (formData: DebtFormData) => {
    const debt: Debt = {
      id: editingDebt?.id || Date.now().toString(),
      type: formData.type,
      title: formData.title,
      description: formData.description,
      totalAmount: parseFloat(formData.totalAmount),
      date: new Date(formData.date),
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      status: 'active',
      participantId: formData.participantId,
      paidAmount: 0,
      splits: formData.type === 'group_payment' || formData.type === 'group_receive' 
        ? (formData.participants || []).map(p => ({
            participantId: p.id,
            amount: formData.splitType === 'equal' 
              ? parseFloat(formData.totalAmount) / (formData.participants?.length || 1)
              : parseFloat(formData.customSplits?.find(s => s.participantId === p.id)?.amount || '0'),
            isPaid: false,
          }))
        : undefined,
      splitType: formData.splitType,
      payments: editingDebt?.payments || [],
      notes: formData.notes,
    };

    if (editingDebt) {
      onDebtUpdate(debt);
    } else {
      onDebtAdd(debt);
    }

    setShowForm(false);
    setEditingDebt(null);
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setShowForm(true);
  };

  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debt.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || debt.type === selectedType;
    const matchesStatus = !statusFilter || debt.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const debtTypeOptions = [
    { value: 'lend', label: 'Tôi cho mượn', icon: CreditCard, color: 'text-green-600' },
    { value: 'borrow', label: 'Tôi mượn', icon: Banknote, color: 'text-red-600' },
    { value: 'group_payment', label: 'Tôi trả cho nhóm', icon: Users, color: 'text-blue-600' },
    { value: 'group_receive', label: 'Nhóm trả cho tôi', icon: User, color: 'text-purple-600' },
  ];

  if (showForm) {
    return (
      <DebtForm
        debt={editingDebt}
        participants={participants}
        onSubmit={handleDebtSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingDebt(null);
        }}
        onParticipantAdd={onParticipantAdd}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý vay nợ</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Thêm khoản vay nợ</span>
        </button>
      </div>

      <DebtSummary debts={debts} />
      <DebtStats debts={debts} participants={participants} />

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm vay nợ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả loại</option>
              {debtTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="partially_paid">Trả một phần</option>
              <option value="completed">Hoàn thành</option>
              <option value="overdue">Quá hạn</option>
            </select>
          </div>

          <div className="flex space-x-2">
            {debtTypeOptions.map(option => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedType(selectedType === option.value ? '' : option.value)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    selectedType === option.value
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={16} className={selectedType === option.value ? 'text-blue-600' : option.color} />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <DebtList
          debts={filteredDebts}
          participants={participants}
          onEdit={handleEdit}
          onDelete={onDebtDelete}
          onPaymentAdd={onPaymentAdd}
        />
      </div>
    </div>
  );
};