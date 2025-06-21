import React, { useState } from 'react';
import { Menu, Bell, Settings, Download, Upload, Sun, Moon, Search } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { isDark, toggleTheme } = useTheme();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">₫</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
              Finance Tracker
            </h1>
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm giao dịch, danh mục..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden transition-colors"
            aria-label="Toggle search"
          >
            <Search size={18} className="text-gray-600 dark:text-gray-400" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun size={18} className="text-yellow-500" />
            ) : (
              <Moon size={18} className="text-gray-600" />
            )}
          </button>

          <button
            onClick={onImportClick}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            title="Nhập dữ liệu"
          >
            <Upload size={18} />
          </button>

          <button
            onClick={onExportClick}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            title="Xuất dữ liệu"
          >
            <Download size={18} />
          </button>

          <button
            onClick={onSettingsClick}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            title="Cài đặt"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showSearch && (
        <div className="px-4 pb-3 md:hidden">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};