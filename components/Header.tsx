
import React, { useState } from 'react';
import type { Page } from '../types';
import { LogoIcon, UserIcon, SunIcon, MoonIcon, MenuIcon, XIcon } from './Icons';
import { storage } from '../services/storage';
import { motion } from 'motion/react';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentPage: Page;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, theme, toggleTheme, currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = storage.getUser();

  const navLinks: { page: Page; label: string }[] = [
    { page: 'dashboard', label: 'Dashboard' },
    { page: 'history', label: 'History' },
    { page: 'affiliate', label: 'Affiliate' },
    { page: 'education', label: 'Education' },
  ];

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 h-20 flex items-center">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div 
          className="flex items-center space-x-2 cursor-pointer group" 
          onClick={() => handleNavigate('home')}
        >
          <div className="bg-green-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
            <LogoIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
            Halal Auditor<span className="text-green-600">.ai</span>
          </h1>
        </div>

        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNavigate(link.page)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                currentPage === link.page 
                  ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 text-gray-500 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl transition-colors hover:text-green-600"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
          </button>

          <div className="h-8 w-px bg-gray-100 dark:bg-gray-800 mx-1 hidden md:block" />

          {user ? (
            <button
              onClick={() => handleNavigate('settings')}
              className={`flex items-center space-x-3 pl-3 pr-1 py-1 rounded-xl transition-all border-2 ${
                currentPage === 'settings' ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              <div className="hidden md:block text-right">
                <p className="text-xs font-black text-gray-900 dark:text-white truncate max-w-[100px]">{user.name}</p>
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">{user.subscription.plan} Plan</p>
              </div>
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                alt="Avatar" 
                className="w-9 h-9 rounded-lg object-cover"
              />
            </button>
          ) : (
            <button
              onClick={() => handleNavigate('dashboard')}
              className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
            >
              Sign In
            </button>
          )}

          <button 
            className="lg:hidden p-2.5 text-gray-500 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden absolute top-20 left-0 right-0 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 p-4 space-y-2 shadow-2xl"
        >
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNavigate(link.page)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                currentPage === link.page 
                  ? 'bg-green-50 text-green-600 dark:bg-green-900/30' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              {link.label}
            </button>
          ))}
        </motion.div>
      )}
    </header>
  );
};

export default Header;
