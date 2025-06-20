import React from 'react';
import { 
  Home, 
  DollarSign, 
  PieChart, 
  BarChart3, 
  Settings,
  Plus,
  X,
  HandHeart
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigation = [
  { id: 'dashboard', name: 'Tổng quan', icon: Home },
  { id: 'budget', name: 'Ngân sách', icon: DollarSign },
  { id: 'expenses', name: 'Chi tiêu', icon: Plus },
  { id: 'debts', name: 'Vay nợ', icon: HandHeart },
  { id: 'analytics', name: 'Phân tích', icon: BarChart3 },
  { id: 'reports', name: 'Báo cáo', icon: PieChart },
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50',
          'lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200',
          {
            'translate-x-0': isOpen,
            '-translate-x-full': !isOpen,
          }
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={clsx(
                  'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors',
                  {
                    'bg-blue-50 text-blue-700 border border-blue-200': activeTab === item.id,
                    'text-gray-700 hover:bg-gray-100': activeTab !== item.id,
                  }
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};