import React from 'react';
import { Page } from '../types';
import { storage } from '../services/storage';
import { motion } from 'motion/react';
import {
  LogoIcon,
  ActivityIcon,
  ProductIcon,
  ProcessIcon,
  TransactionIcon,
  HistoryIcon,
  UsersIcon,
  EducationIcon,
  ShieldIcon,
  CreditCardIcon
} from './Icons';
import { useLanguage } from '../hooks/useLanguage';

interface AppSidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  className?: string;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ currentPage, onNavigate, className }) => {
  const { t } = useLanguage();

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: ActivityIcon },
    { id: 'product', label: t('productAudit'), icon: ProductIcon },
    { id: 'process', label: t('processAudit'), icon: ProcessIcon },
    { id: 'transaction', label: t('transactionAudit'), icon: TransactionIcon },
    { id: 'history', label: t('history'), icon: HistoryIcon },
    { id: 'affiliate', label: t('affiliate'), icon: UsersIcon },
    { id: 'education', label: t('education'), icon: EducationIcon },
  ];

  const bottomItems = [
    { id: 'subscription', label: t('subscription'), icon: CreditCardIcon },
    { id: 'settings', label: t('settings'), icon: ShieldIcon },
  ];

  const handleLogout = () => {
    storage.logout();
    window.location.reload();
  };

  return (
    <aside className={`w-72 border-r border-gray-100 dark:border-gray-800 hidden md:flex flex-col h-screen bg-white dark:bg-gray-950 sticky top-0 ${className}`}>
      <div className="p-8 pb-4 flex items-center gap-3">
        <img
          src="/logo.jpeg"
          alt="Logo"
          className="h-10 w-auto object-contain"
        />

        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
          HALA<span className="text-green-600">TOR</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-8">
        {menuItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Page)}
              className={`w-full relative flex items-center space-x-3 px-4 py-3 rounded-2xl text-[14px] font-black uppercase tracking-widest transition-all duration-300 group ${isActive
                ? 'text-white'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarActive"
                  className="absolute inset-0 bg-green-600 rounded-2xl shadow-xl shadow-green-600/20 z-0"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={`h-5 w-5 relative z-10 ${isActive ? 'text-white' : 'group-hover:text-green-600 transition-colors'}`} />
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
        <div className="space-y-1">
          {bottomItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as Page)}
                className={`w-full relative flex items-center space-x-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 group ${isActive
                  ? 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? 'text-gray-900 dark:text-white' : 'group-hover:text-green-600 transition-colors'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 group hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-300 shadow-sm hover:shadow-red-500/5 active:scale-95"
        >
          <div className="w-2 h-2 rounded-full bg-red-500 group-hover:animate-ping" />
          <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">
            {t('logout')}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
