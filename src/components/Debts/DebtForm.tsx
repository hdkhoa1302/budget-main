import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, Users, User } from 'lucide-react';
import { Debt, DebtParticipant, DebtFormData } from '../../types';
import { format } from 'date-fns';

interface DebtFormProps {
  debt?: Debt | null;
  participants: DebtParticipant[];
  onSubmit: (formData: DebtFormData) => void;
  onCancel: () => void;
  onParticipantAdd: (participant: DebtParticipant) => void;
}

export const DebtForm: React.FC<DebtFormProps> = ({
  debt,
  participants,
  onSubmit,
  onCancel,
  onParticipantAdd,
}) => {
  const [formData, setFormData] = useState<DebtFormData>({
    type: debt?.type || 'lend',
    title: debt?.title || '',
    description: debt?.description || '',
    totalAmount: debt?.totalAmount.toString() || '',
    date: debt ? format(debt.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    dueDate: debt?.dueDate ? format(debt.dueDate, 'yyyy-MM-dd') : '',
    participantId: debt?.participantId || '',
    participants: [],
    splitType: debt?.splitType || 'equal',
    customSplits: [],
    notes: debt?.notes || '',
  });

  const [errors, setErrors] = useState<Partial<DebtFormData>>({});
  const [showNewParticipant, setShowNewParticipant] = useState(false);
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const isGroupType = formData.type === 'group_payment' || formData.type === 'group_receive';

  useEffect(() => {
    if (isGroupType && formData.participants && formData.splitType === 'equal') {
      const equalAmount = parseFloat(formData.totalAmount) / formData.participants.length || 0;
      setFormData(prev => ({
        ...prev,
        customSplits: prev.participants?.map(p => ({
          participantId: p.id,
          amount: equalAmount.toString(),
        })) || [],
      }));
    }
  }, [formData.totalAmount, formData.participants?.length, formData.splitType, isGroupType]);

  const validateForm = () => {
    const newErrors: Partial<DebtFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề';
    }

    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      newErrors.totalAmount = 'Số tiền phải lớn hơn 0';
    }

    if (!formData.date) {
      newErrors.date = 'Vui lòng chọn ngày';
    }

    if (!isGroupType && !formData.participantId) {
      newErrors.participantId = 'Vui lòng chọn người tham gia';
    }

    if (isGroupType && (!formData.participants || formData.participants.length === 0)) {
      newErrors.participants = 'Vui lòng chọn ít nhất một người tham gia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const updateField = (field: keyof DebtFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addNewParticipant = () => {
    if (newParticipant.name.trim()) {
      const participant: DebtParticipant = {
        id: Date.now().toString(),
        name: newParticipant.name.trim(),
        email: newParticipant.email.trim() || undefined,
        phone: newParticipant.phone.trim() || undefined,
      };
      
      onParticipantAdd(participant);
      setNewParticipant({ name: '', email: '', phone: '' });
      setShowNewParticipant(false);
    }
  };

  const toggleParticipant = (participant: DebtParticipant) => {
    const currentParticipants = formData.participants || [];
    const isSelected = currentParticipants.some(p => p.id === participant.id);
    
    if (isSelected) {
      updateField('participants', currentParticipants.filter(p => p.id !== participant.id));
    } else {
      updateField('participants', [...currentParticipants, participant]);
    }
  };

  const updateCustomSplit = (participantId: string, amount: string) => {
    const currentSplits = formData.customSplits || [];
    const updatedSplits = currentSplits.some(s => s.participantId === participantId)
      ? currentSplits.map(s => s.participantId === participantId ? { ...s, amount } : s)
      : [...currentSplits, { participantId, amount }];
    
    updateField('customSplits', updatedSplits);
  };

  const debtTypes = [
    { value: 'lend', label: 'Tôi cho người khác mượn tiền', icon: '💰' },
    { value: 'borrow', label: 'Tôi mượn tiền từ người khác', icon: '🏦' },
    { value: 'group_payment', label: 'Tôi trả tiền cho nhóm', icon: '👥' },
    { value: 'group_receive', label: 'Nhóm trả tiền cho tôi', icon: '🤝' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {debt ? 'Chỉnh sửa khoản vay nợ' : 'Thêm khoản vay nợ mới'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 p-2"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-6">
        {/* Debt Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Loại giao dịch <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {debtTypes.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => updateField('type', type.value)}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  formData.type === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{type.icon}</span>
                  <span className="font-medium">{type.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập tiêu đề"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tổng số tiền <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.totalAmount}
              onChange={(e) => updateField('totalAmount', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.totalAmount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {errors.totalAmount && <p className="text-red-500 text-sm mt-1">{errors.totalAmount}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mô tả chi tiết về khoản vay nợ"
          />
        </div>

        {/* Date Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày tạo <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => updateField('date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày đến hạn
            </label>
            <input
              type="date"
              value={formData.dueDate || ''}
              onChange={(e) => updateField('dueDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Participant Selection */}
        {!isGroupType ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Người tham gia <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2">
              <select
                value={formData.participantId || ''}
                onChange={(e) => updateField('participantId', e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.participantId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn người tham gia</option>
                {participants.map(participant => (
                  <option key={participant.id} value={participant.id}>
                    {participant.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewParticipant(true)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            {errors.participantId && <p className="text-red-500 text-sm mt-1">{errors.participantId}</p>}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Người tham gia <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowNewParticipant(true)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center space-x-1"
              >
                <Plus size={14} />
                <span>Thêm người mới</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {participants.map(participant => (
                <button
                  key={participant.id}
                  type="button"
                  onClick={() => toggleParticipant(participant)}
                  className={`p-3 border-2 rounded-lg text-left transition-colors ${
                    formData.participants?.some(p => p.id === participant.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <User size={16} />
                    <span className="font-medium">{participant.name}</span>
                  </div>
                  {participant.email && (
                    <p className="text-xs text-gray-500 mt-1">{participant.email}</p>
                  )}
                </button>
              ))}
            </div>
            {errors.participants && <p className="text-red-500 text-sm mt-1">{errors.participants}</p>}

            {/* Split Configuration */}
            {formData.participants && formData.participants.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Cách chia tiền</h4>
                
                <div className="flex space-x-4 mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="equal"
                      checked={formData.splitType === 'equal'}
                      onChange={(e) => updateField('splitType', e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Chia đều</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="custom"
                      checked={formData.splitType === 'custom'}
                      onChange={(e) => updateField('splitType', e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Chia tùy chỉnh</span>
                  </label>
                </div>

                <div className="space-y-3">
                  {formData.participants.map(participant => {
                    const splitAmount = formData.splitType === 'equal'
                      ? (parseFloat(formData.totalAmount) / formData.participants!.length || 0)
                      : parseFloat(formData.customSplits?.find(s => s.participantId === participant.id)?.amount || '0');

                    return (
                      <div key={participant.id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <span className="font-medium">{participant.name}</span>
                        {formData.splitType === 'custom' ? (
                          <input
                            type="number"
                            step="0.01"
                            value={formData.customSplits?.find(s => s.participantId === participant.id)?.amount || ''}
                            onChange={(e) => updateCustomSplit(participant.id, e.target.value)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                            placeholder="0"
                          />
                        ) : (
                          <span className="font-semibold text-blue-600">
                            {splitAmount.toLocaleString('vi-VN')} ₫
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {formData.splitType === 'custom' && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                    <div className="flex justify-between">
                      <span>Tổng đã chia:</span>
                      <span className="font-semibold">
                        {(formData.customSplits?.reduce((sum, split) => sum + parseFloat(split.amount || '0'), 0) || 0).toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Còn lại:</span>
                      <span className="font-semibold">
                        {(parseFloat(formData.totalAmount) - (formData.customSplits?.reduce((sum, split) => sum + parseFloat(split.amount || '0'), 0) || 0)).toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* New Participant Modal */}
        {showNewParticipant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Thêm người tham gia mới</h3>
                <button
                  type="button"
                  onClick={() => setShowNewParticipant(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newParticipant.name}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newParticipant.email}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={newParticipant.phone}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewParticipant(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={addNewParticipant}
                  disabled={!newParticipant.name.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Thêm ghi chú (không bắt buộc)"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Save size={16} />
            <span>{debt ? 'Cập nhật' : 'Thêm'} khoản vay nợ</span>
          </button>
        </div>
      </form>
    </div>
  );
};