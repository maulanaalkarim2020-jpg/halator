import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';
import { storage } from '../services/storage';
import { authApi } from '../services/api';
import { LogoIcon, MailIcon, ShieldIcon, EyeIcon, EyeOffIcon } from '../components/Icons';
import { Page } from '../types';
import { toast } from 'sonner';

interface LoginScreenProps {
  onNavigate: (page: Page) => void;
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate, onLoginSuccess }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Try Backend REST API first
      const res = await authApi.login(email, password);

      if (res.success && res.data?.user) {
        toast.success(res.message || t('authSuccess'));
        storage.setUser(res.data.user);
        onLoginSuccess();
      } else if (
        !res.isNetworkError &&
        res.message &&
        !res.message.includes('Koneksi ke server gagal') &&
        !res.message.toLowerCase().includes('failed to fetch')
      ) {
        // Backend reached and returned business validation error (e.g. wrong password)
        toast.error(res.message);
      } else {
        // Fallback to local storage if backend server is not running
        console.warn('Backend server unreachable, falling back to local storage');
        const result = storage.login(email, password);
        if (typeof result === 'string') {
          toast.error(result);
        } else {
          toast.success(t('authSuccess'));
          onLoginSuccess();
        }
      }
    } catch (error: any) {
      console.warn('Login exception, fallback to local storage', error);
      try {
        const result = storage.login(email, password);
        if (typeof result === 'string') {
          toast.error(result);
        } else {
          toast.success(t('authSuccess'));
          onLoginSuccess();
        }
      } catch (innerErr: any) {
        toast.error(innerErr.message || 'Terjadi kesalahan saat masuk');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Ornaments */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-green-500/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] md:rounded-[3rem] p-6 xs:p-10 shadow-2xl border border-gray-100 dark:border-gray-800">
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="inline-block p-4 rounded-3xl shadow-xl shadow-green-600/20 mb-6"
              onClick={() => onNavigate('home')}
            >
              <img
                src="/logo.jpeg"
                alt="Logo"
                className="w-40 h-24 object-contain rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none"
              />
            </motion.div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">
              {t('loginTitle')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
              {t('loginSubtitle')}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                {t('email')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MailIcon className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none font-medium dark:text-white"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                {t('password')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ShieldIcon className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none font-medium dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-green-600 transition-colors"
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-green-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('loggingIn')}
                </>
              ) : (
                t('login')
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-xs font-bold text-gray-400">
              {t('noAccount')}{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-green-600 hover:text-green-700 underline underline-offset-4"
              >
                {t('registerTitle')}
              </button>
            </p>
            <button
              onClick={() => onNavigate('home')}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {t('backToHome')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
