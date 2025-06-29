import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Home,
  Package,
  Users,
  Hammer,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Settings,
  FileText,
  Wallet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const { t } = useLanguage();
  
  const menuItems = [
    { icon: Home, label: t('dashboard'), path: '/dashboard' },
    { icon: Package, label: t('materials'), path: '/materials' },
    { icon: Hammer, label: t('furniture'), path: '/furniture' },
    { icon: Users, label: t('workers'), path: '/workers' },
    { icon: ShoppingCart, label: t('production'), path: '/production' },
    { icon: TrendingUp, label: t('sales'), path: '/sales' },
    { icon: Wallet, label: t('payments'), path: '/payments' },
    { icon: Calendar, label: t('calendar'), path: '/calendar' },
    { icon: FileText, label: t('reports'), path: '/reports' },
    { icon: Settings, label: t('settings'), path: '/settings' },
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Hammer className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-800 dark:text-white">FurniPro</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;