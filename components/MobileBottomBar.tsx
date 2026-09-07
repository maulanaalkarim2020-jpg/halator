import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';
import { Page } from '../types';
import { 
  ActivityIcon, 
  ProductIcon, 
  ProcessIcon, 
  HistoryIcon, 
  MenuIcon,
  TransactionIcon,
  EducationIcon,
  UsersIcon,
  CreditCardIcon,
  ShieldIcon,
  XIcon
} from './Icons';

interface MobileBottomBarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ currentPage, onNavigate }) => {
  const { t } = useLanguage();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainItems = [
    { id: 'dashboard', label: t('dashboard'), icon: ActivityIcon },
    { id: 'product', label: t('productAudit'), icon: ProductIcon },
    { id: 'process', label: t('processAudit'), icon: ProcessIcon },
    { id: 'history', label: t('history'), icon: HistoryIcon },
  ];

  const moreItems = [
    { id: 'transaction', label: t('transactionAudit'), icon: TransactionIcon },
    { id: 'education', label: t('education'), icon: EducationIcon },
    { id: 'affiliate', label: t('affiliate'), icon: UsersIcon },
    { id: 'subscription', label: t('subscription'), icon: CreditCardIcon },
    { id: 'settings', label: t('settings'), icon: ShieldIcon },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 px-2 py-3 z-50 flex items-center justify-around safe-area-inset-bottom md:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {mainItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id as Page);
                setIsMoreOpen(false);
              }}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 relative px-3 py-1 ${
                isActive ? 'text-green-600' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomBarActive"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-green-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className="h-6 w-6" />
              <span className="text-[9px] font-black uppercase tracking-tighter truncate max-w-[60px]">
                {item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
            isMoreOpen ? 'text-green-600' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <MenuIcon className="h-6 w-6" />
          <span className="text-[9px] font-black uppercase tracking-tighter">More</span>
        </button>
      </nav>

      <AnimatePresence>
        {isMoreOpen && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-none md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full bg-white dark:bg-gray-900 rounded-t-[2.5rem] p-8 pb-12 pointer-events-auto border-t border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-widest uppercase">Other Menus</h3>
                <button 
                  onClick={() => setIsMoreOpen(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {moreItems.map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id as Page);
                        setIsMoreOpen(false);
                      }}
                      className={`flex flex-col items-center justify-center gap-3 p-4 rounded-3xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-green-600 text-white shadow-xl shadow-green-600/20' 
                          : 'bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800'
                      }`}
                    >
                      <item.icon className="h-6 w-6" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-center leading-tight">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileBottomBar;
