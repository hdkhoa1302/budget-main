import React from 'react';
import { Menu, Bell, Settings, Download, Upload } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
  onSettingsClick: () => void;
  onExportClick: () => void;
  onImportClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  onSettingsClick,
  onExportClick,
  onImportClick,
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            Quản lý Tài chính Cá nhân
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onImportClick}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            title="Nhập dữ liệu"
          >
            <Upload size={18} />
          </button>
          <button
            onClick={onExportClick}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            title="Xuất dữ liệu"
          >
            <Download size={18} />
          </button>
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            title="Cài đặt"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};