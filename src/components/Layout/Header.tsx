import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, Settings, Download, Upload, Sun, Moon, Search, LogOut, User, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuToggle: () => void;
  onSettingsClick: () => void;
  onExportClick: () => void;
  onImportClick: () => void;
  onQuickAdd?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  onSettingsClick,
  onExportClick,
  onImportClick,
  onQuickAdd,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getUserDisplayName = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName;
    }
    if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    return 'User';
  };

  const getUserAvatar = () => {
    if (currentUser?.photoURL) {
      return (
        <img
          src={currentUser.photoURL}
          alt="User Avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <User size={16} className="text-white" />
      </div>
    );
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
        <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
          {/* Left Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden transition-colors touch-manipulation"
              aria-label="Toggle menu"
            >
              <Menu size={20} className="text-gray-700 dark:text-gray-300" />
            </button>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">₫</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                Finance Tracker
              </h1>
            </div>
          </div>

          {/* Center Section - Search (Desktop only) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm giao dịch, danh mục..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              />
            </div>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center space-x-1">
            {/* Mobile Quick Add Button */}
            {onQuickAdd && (
              <button
                onClick={onQuickAdd}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white sm:hidden transition-colors touch-manipulation"
                aria-label="Thêm nhanh"
              >
                <Plus size={18} />
              </button>
            )}

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden transition-colors touch-manipulation"
              aria-label="Toggle search"
            >
              <Search size={18} className="text-gray-600 dark:text-gray-400" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-manipulation"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun size={18} className="text-yellow-500" />
              ) : (
                <Moon size={18} className="text-gray-600" />
              )}
            </button>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center space-x-1">
              <button
                onClick={onImportClick}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors touch-manipulation"
                title="Nhập dữ liệu"
              >
                <Upload size={18} />
              </button>

              <button
                onClick={onExportClick}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors touch-manipulation"
                title="Xuất dữ liệu"
              >
                <Download size={18} />
              </button>

              <button
                onClick={onSettingsClick}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors touch-manipulation"
                title="Cài đặt"
              >
                <Settings size={18} />
              </button>
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-manipulation"
              >
                {getUserAvatar()}
                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-24 truncate">
                  {getUserDisplayName()}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      {getUserAvatar()}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {currentUser?.displayName || 'Người dùng'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {currentUser?.email}
                        </p>
                        {currentUser?.providerData?.[0]?.providerId === 'google.com' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 mt-1">
                            <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Google
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="sm:hidden border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        onSettingsClick();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Settings size={16} />
                      <span>Cài đặt</span>
                    </button>
                    <button
                      onClick={() => {
                        onExportClick();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Download size={16} />
                      <span>Xuất dữ liệu</span>
                    </button>
                    <button
                      onClick={() => {
                        onImportClick();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Upload size={16} />
                      <span>Nhập dữ liệu</span>
                    </button>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="px-3 pb-3 lg:hidden">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base"
                autoFocus
              />
            </div>
          </div>
        )}
      </header>
    </>
  );
};