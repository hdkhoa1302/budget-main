import React, { useState } from 'react';
import { X, Bell, Shield, Palette, Database } from 'lucide-react';
import { AlertSettings } from '../../types';
import { notificationUtils } from '../../utils/notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertSettings: AlertSettings;
  onUpdateSettings: (settings: AlertSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  alertSettings,
  onUpdateSettings,
}) => {
  const [settings, setSettings] = useState<AlertSettings>(alertSettings);

  const handleSave = () => {
    onUpdateSettings(settings);
    onClose();
  };

  const requestNotificationPermission = async () => {
    const granted = await notificationUtils.requestPermission();
    if (granted) {
      setSettings(prev => ({ ...prev, enableSystemNotifications: true }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Cài đặt</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Notification Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Bell size={20} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Thông báo</h3>
            </div>
            
            <div className="space-y-3 pl-7">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.enableSystemNotifications}
                  onChange={(e) => {
                    if (e.target.checked) {
                      requestNotificationPermission();
                    } else {
                      setSettings(prev => ({ ...prev, enableSystemNotifications: false }));
                    }
                  }}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:checked:bg-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Bật thông báo hệ thống</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.weeklyReports}
                  onChange={(e) => setSettings(prev => ({ ...prev, weeklyReports: e.target.checked }))}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:checked:bg-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Báo cáo hàng tuần</span>
              </label>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ngưỡng cảnh báo ngân sách (%)
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={settings.budgetWarningThreshold}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    budgetWarningThreshold: parseInt(e.target.value) 
                  }))}
                  className="w-full accent-blue-600 dark:accent-blue-400"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>50%</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">{settings.budgetWarningThreshold}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield size={20} className="text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bảo mật</h3>
            </div>
            
            <div className="space-y-3 pl-7">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Database size={16} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">
                    Dữ liệu được lưu trữ an toàn
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  Tất cả dữ liệu tài chính của bạn được lưu trữ an toàn trên Firebase với mã hóa đầu cuối.
                  Chỉ bạn mới có thể truy cập dữ liệu của mình.
                </p>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Palette size={20} className="text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Giao diện</h3>
            </div>
            
            <div className="space-y-3 pl-7">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Ứng dụng hỗ trợ chế độ sáng/tối tự động theo cài đặt hệ thống của bạn.
                  Bạn có thể chuyển đổi thủ công bằng nút trong header.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors touch-manipulation"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-manipulation"
          >
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};