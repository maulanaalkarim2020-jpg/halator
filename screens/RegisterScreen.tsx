import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';
import { storage } from '../services/storage';
import { authApi } from '../services/api';
import { LogoIcon, MailIcon, ShieldIcon, UserIcon, ActivityIcon, EyeIcon, EyeOffIcon } from '../components/Icons';
import { Page } from '../types';
import { toast } from 'sonner';

interface RegisterScreenProps {
  onNavigate: (page: Page) => void;
  onRegisterSuccess: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigate, onRegisterSuccess }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('passwordsDoNotMatch'));
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      // Try Backend REST API first
      const res = await authApi.register(registerData);

      if (res.success && res.data?.user) {
        toast.success(res.message || t('authSuccess'));
        storage.setUser(res.data.user);
        onRegisterSuccess();
      } else if (res.message && !res.message.includes('Koneksi ke server gagal')) {
        // Backend reached and returned business validation error (e.g. Email already used)
        toast.error(res.message);
      } else {
        // Fallback to local storage if backend server is not running
        console.warn('Backend server unreachable, falling back to local storage');
        const localResult = storage.register(registerData);
        if (typeof localResult === 'string') {
          toast.error(localResult);
        } else {
          toast.success(t('authSuccess'));
          storage.setUser(localResult);
          onRegisterSuccess();
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden text-center md:text-left">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-green-500/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] md:rounded-[3.5rem] p-6 xs:p-10 md:p-14 shadow-2xl border border-gray-100 dark:border-gray-800">
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 bg-green-50 dark:bg-green-900/20 px-6 py-3 rounded-full border border-green-100 dark:border-green-800 mb-8"
              onClick={() => onNavigate('home')}
            >
              <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
              <span className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-[0.3em] cursor-pointer">
                Join Halator Hub
              </span>
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">
              {t('registerTitle')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm text-center">
              {t('registerSubtitle')}
            </p>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                {t('name')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none font-medium dark:text-white"
                  placeholder="Abdullah Ahmad"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                {t('email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MailIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none font-medium dark:text-white"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                {t('phone')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ActivityIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none font-medium dark:text-white"
                  placeholder="0812...."
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                {t('password')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ShieldIcon className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                {t('confirmPassword')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ShieldIcon className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                </div>
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none font-medium dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-green-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="md:col-span-2 w-full py-5 mt-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-green-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('creatingAccount')}
                </>
              ) : (
                t('registerTitle')
              )}
            </button>
          </form>

          <div className="mt-10 text-center space-y-4">
            <p className="text-xs font-bold text-gray-400">
              {t('haveAccount')}{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-green-600 hover:text-green-700 underline underline-offset-4"
              >
                {t('login')}
              </button>
            </p>
            <button
              onClick={() => onNavigate('home')}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors block mx-auto"
            >
              {t('backToHome')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterScreen;
