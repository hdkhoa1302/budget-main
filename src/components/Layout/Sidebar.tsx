import React from 'react';
import { 
  Home, 
  DollarSign, 
  PieChart, 
  BarChart3, 
  Plus,
  X,
  HandHeart,
  TrendingUp
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigation = [
  { id: 'dashboard', name: 'Tổng quan', icon: Home, color: 'text-blue-600 dark:text-blue-400' },
  { id: 'budget', name: 'Ngân sách', icon: DollarSign, color: 'text-green-600 dark:text-green-400' },
  { id: 'expenses', name: 'Chi tiêu', icon: Plus, color: 'text-red-600 dark:text-red-400' },
  { id: 'debts', name: 'Vay nợ', icon: HandHeart, color: 'text-purple-600 dark:text-purple-400' },
  { id: 'analytics', name: 'Phân tích', icon: BarChart3, color: 'text-orange-600 dark:text-orange-400' },
  { id: 'reports', name: 'Báo cáo', icon: PieChart, color: 'text-indigo-600 dark:text-indigo-400' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-out z-50',
          'lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200 lg:dark:border-gray-700',
          {
            'translate-x-0': isOpen,
            '-translate-x-full': !isOpen,
          }
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">₫</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={clsx(
                  'w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group',
                  {
                    'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm': isActive,
                    'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white': !isActive,
                  }
                )}
              >
                <Icon 
                  size={20} 
                  className={clsx(
                    'transition-colors',
                    isActive ? item.color : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  )}
                />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="p-4 mt-auto">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Tháng này</span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Theo dõi chi tiêu và ngân sách của bạn
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};