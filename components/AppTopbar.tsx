import React from 'react';
import { Page } from '../types';
import { storage } from '../services/storage';
import { MoonIcon, SunIcon, GlobeIcon, UserIcon, ActivityIcon } from './Icons';
import { useLanguage } from '../hooks/useLanguage';
import { motion, AnimatePresence } from 'motion/react';

interface AppTopbarProps {
  currentPage: Page;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onNavigate: (page: Page) => void;
}

const AppTopbar: React.FC<AppTopbarProps> = ({ currentPage, theme, toggleTheme, onNavigate }) => {
  const user = storage.getUser();
  const { language, setLanguage, t } = useLanguage();

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return t('dashboard');
      case 'product': return t('productAudit');
      case 'process': return t('processAudit');
      case 'transaction': return t('transactionAudit');
      case 'history': return t('history');
      case 'affiliate': return t('affiliate');
      case 'education': return t('education');
      case 'settings': return t('settings');
      case 'subscription': return t('subscription');
      default: return '';
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  const handleLogout = () => {
    storage.logout();
    window.location.reload();
  };

  return (
    <header className="h-20 md:h-24 border-b border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-950/70 backdrop-blur-2xl sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
      <div className="flex flex-col">
        <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{getPageTitle()}</h2>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest hidden xs:inline">{t('shariahVerified')}</span>
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-6">
        <div className="flex items-center bg-gray-100/50 dark:bg-gray-900/50 p-1.5 rounded-2xl border border-gray-100/50 dark:border-gray-800/50">
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 text-gray-500 hover:text-green-600 rounded-xl transition-all duration-300 flex items-center space-x-2 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm"
          >
            <GlobeIcon className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{language}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-green-600 rounded-xl transition-all duration-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'light' ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>

        <div className="h-8 w-px bg-gray-100 dark:bg-gray-800" />

        {user && (
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-gray-900 dark:text-white leading-none mb-1">{user.name}</p>
              <div className="flex items-center justify-end gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-green-600 text-white text-[8px] font-black uppercase tracking-[0.2em] shadow-lg shadow-green-600/20">
                  {user.subscription.plan}
                </span>
              </div>
            </div>
            
            <div className="relative group">
              <button 
                className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 p-0.5 border border-gray-100 dark:border-gray-800 hover:border-green-500/50 transition-all duration-300 hover:scale-105 active:scale-95 group-hover:shadow-2xl group-hover:shadow-green-500/10"
              >
                <div className="w-full h-full rounded-[14px] overflow-hidden">
                  <img 
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </button>
              
              <div className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-50 p-4">
                 <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50 mb-3 border border-gray-100 dark:border-gray-800">
                    <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white">
                       <UserIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                       <p className="text-xs font-black text-gray-900 dark:text-white truncate">{user.name}</p>
                       <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold truncate">{t('professionalAuditor')}</p>
                    </div>
                 </div>
                 
                 <div className="space-y-1">
                    <button 
                      onClick={() => onNavigate('settings')}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all group/item"
                    >
                      <span className="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest group-hover/item:text-green-600">{t('profile')}</span>
                      <ActivityIcon className="w-3 h-3 text-gray-300 group-hover/item:text-green-600" />
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group/item"
                    >
                      <span className="text-xs font-black text-red-600 uppercase tracking-widest">{t('logout')}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    </button>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppTopbar;
