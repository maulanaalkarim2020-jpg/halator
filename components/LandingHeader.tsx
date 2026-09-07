import React, { useState, useEffect } from 'react';
import { Page, Language } from '../types';
import { storage } from '../services/storage';
import { LogoIcon, MoonIcon, SunIcon, MenuIcon, XIcon, GlobeIcon } from './Icons';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';

interface LandingHeaderProps {
  onNavigate: (page: Page) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({ onNavigate, theme, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-white/40 dark:border-gray-800/60 rounded-2xl md:rounded-[2rem] px-4 md:px-8 py-2 md:py-4 flex justify-between items-center shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)]">
          <div
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              onNavigate('home');
            }}
          >
            <img
              src="/logo.jpeg"
              alt="Logo"
              className="w-10 h-10 object-contain rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none"
            />
            <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Halator
            </h1>
          </div>

          <nav className="hidden lg:flex items-center space-x-8">
            <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors uppercase tracking-wider">{t('features')}</button>
            <button onClick={() => scrollToSection('why-us')} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors uppercase tracking-wider">{t('whyUs')}</button>
            <button onClick={() => scrollToSection('testimonials')} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors uppercase tracking-wider">{t('testimonials')}</button>
          </nav>

          <div className="flex items-center space-x-1 md:space-x-4">
            <div className="hidden sm:flex items-center space-x-1 md:space-x-4">
              <button
                onClick={toggleLanguage}
                className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors flex items-center space-x-1"
                title={t('language')}
              >
                <GlobeIcon className="h-5 w-5" />
                <span className="text-xs font-bold uppercase">{language}</span>
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                title={t('theme')}
              >
                {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
              </button>
            </div>

            {storage.getUser() ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="bg-green-600 text-white px-4 md:px-5 py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-green-600/20"
              >
                {t('dashboard')}
              </button>
            ) : (
              <div className="flex items-center space-x-1 md:space-x-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="hidden sm:block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2 md:px-3 py-2 text-xs md:text-sm font-bold transition-colors"
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 md:px-5 py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold hover:scale-105 transition-transform active:scale-95"
                >
                  {t('register')}
                </button>
              </div>
            )}

            <button
              className="lg:hidden p-2 text-gray-500 dark:text-gray-400"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden mt-2"
          >
            <div className="p-6 flex flex-col space-y-4">
              <button onClick={() => scrollToSection('features')} className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-300 hover:text-green-600 transition-colors border-b border-gray-50 dark:border-gray-800 uppercase tracking-widest text-xs">{t('features')}</button>
              <button onClick={() => scrollToSection('why-us')} className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-300 hover:text-green-600 transition-colors border-b border-gray-50 dark:border-gray-800 uppercase tracking-widest text-xs">{t('whyUs')}</button>
              <button onClick={() => scrollToSection('testimonials')} className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-300 hover:text-green-600 transition-colors border-b border-gray-50 dark:border-gray-800 uppercase tracking-widest text-xs">{t('testimonials')}</button>

              <div className="flex items-center justify-between px-4 py-4 pt-6">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleLanguage}
                    className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl"
                  >
                    <GlobeIcon className="h-5 w-5 text-green-600" />
                    <span className="text-xs font-black uppercase dark:text-white">{language}</span>
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl"
                  >
                    {theme === 'light' ? <MoonIcon className="h-5 w-5 text-amber-500" /> : <SunIcon className="h-5 w-5 text-amber-400" />}
                  </button>
                </div>

                {!storage.getUser() && (
                  <button
                    onClick={() => onNavigate('login')}
                    className="text-gray-600 dark:text-gray-400 font-bold text-sm"
                  >
                    {t('login')}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default LandingHeader;
