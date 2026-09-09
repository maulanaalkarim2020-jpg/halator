import React, { useState } from 'react';
import { storage } from '../services/storage';
import { authApi } from '../services/api';
import { User } from '../types';
import { toast } from 'sonner';
import { UserIcon, SunIcon, MoonIcon, HistoryIcon, ShieldIcon, GlobeIcon, CreditCardIcon } from '../components/Icons';
import { useLanguage } from '../hooks/useLanguage';
import { motion } from 'motion/react';

interface SettingsScreenProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ theme, toggleTheme }) => {
  const { language, setLanguage, t } = useLanguage();
  const user = storage.getUser();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [gender, setGender] = useState<User['gender']>(user?.gender || 'male');
  const [phone, setPhone] = useState(user?.phone || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [businessAddress, setBusinessAddress] = useState(user?.businessAddress || '');
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'account'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updates = {
        name,
        email,
        gender,
        phone,
        businessName,
        businessAddress,
      };

      // Call Backend REST API (MongoDB)
      const res = await authApi.updateProfile(updates);

      if (res.success && res.data?.user) {
        // Successfully updated in MongoDB!
        storage.setUser(res.data.user);
        toast.success(res.message || t('profileUpdated'));
      } else if (!res.isNetworkError && res.message) {
        toast.error(res.message);
      } else {
        // Fallback for offline mode
        storage.setUser({ 
          ...user, 
          ...updates,
        });
        toast.success(t('profileUpdated'));
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan perubahan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm(t('resetDataConfirm'))) {
      storage.clear();
      window.location.reload();
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  if (!user) return <div className="flex items-center justify-center min-h-[400px] font-black uppercase tracking-widest text-gray-400">Loading...</div>;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-6xl mx-auto space-y-12 pb-20"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase leading-none">{t('settings')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium text-base md:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
            Manage your account preferences and application settings.
          </p>
        </div>
        
        <div className="flex items-center p-1 md:p-1.5 bg-gray-100 dark:bg-gray-900 rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-800 shadow-inner overflow-hidden mx-auto lg:mx-0">
           {(['profile', 'appearance', 'account'] as const).map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative ${
                 activeTab === tab 
                 ? 'text-gray-900 dark:text-white' 
                 : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
               }`}
             >
               {activeTab === tab && (
                 <motion.div 
                   layoutId="settingTab"
                   className="absolute inset-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg md:rounded-xl z-0"
                 />
               )}
               <span className="relative z-10">{tab}</span>
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Settings Card */}
        <div className="lg:col-span-8 space-y-10">
          {activeTab === 'profile' && (
            <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-black/5 space-y-8 md:space-y-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                 <div className="relative group">
                    <img 
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                      alt="Avatar" 
                      className="w-20 md:w-24 h-20 md:h-24 rounded-2xl md:rounded-3xl border-4 border-white dark:border-gray-800 shadow-2xl transition-transform duration-300 group-hover:scale-105"
                    />
                    <button className="absolute -bottom-2 -right-2 bg-green-600 text-white p-2 rounded-lg md:rounded-xl shadow-xl hover:bg-green-700 transition-colors border-4 border-white dark:border-gray-900">
                      <UserIcon className="w-3 md:w-4 h-3 md:h-4" />
                    </button>
                 </div>
                 <div>
                    <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{user.name}</h3>
                    <p className="text-xs md:text-sm text-gray-500 font-medium">Profile photo will be visible across the app.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('fullName')}</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-bold text-gray-900 dark:text-white shadow-inner"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('emailAddress')}</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-bold text-gray-900 dark:text-white shadow-inner"
                  />
                </div>
                {/* Additional Fields */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('gender') || 'Jenis Kelamin'}</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-bold text-gray-900 dark:text-white shadow-inner appearance-none"
                  >
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('phoneNumber') || 'No Telepon'}</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62..."
                    className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-bold text-gray-900 dark:text-white shadow-inner"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('businessName') || 'Nama Bisnis'}</label>
                  <input 
                    type="text" 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-bold text-gray-900 dark:text-white shadow-inner"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('businessAddress') || 'Alamat Bisnis'}</label>
                  <input 
                    type="text" 
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-bold text-gray-900 dark:text-white shadow-inner"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-3 px-10 py-5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-2xl shadow-green-600/30 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{language === 'id' ? 'Menyimpan...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <span>{t('saveChanges')}</span>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-black/5 space-y-8 md:space-y-10">
               <div>
                  <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4 md:mb-6">Language & Region</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-800 gap-4">
                    <div className="flex items-center gap-4">
                       <div className="w-10 md:w-12 h-10 md:h-12 rounded-xl md:rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                          <GlobeIcon className="w-5 md:w-6 h-5 md:h-6 text-green-600" />
                       </div>
                       <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white lowercase first-letter:uppercase">{language === 'id' ? 'Bahasa Indonesia' : 'English'}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">System Language</p>
                       </div>
                    </div>
                    <button 
                      onClick={toggleLanguage}
                      className="px-5 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white dark:bg-gray-900 text-[10px] font-black uppercase tracking-widest border border-gray-100 dark:border-gray-800 hover:border-green-500 transition-all active:scale-95 shadow-sm"
                    >
                      Change to {language === 'id' ? 'English' : 'Indonesia'}
                    </button>
                  </div>
               </div>

               <div>
                  <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4 md:mb-6">App Theme</h3>
                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                     <div 
                       onClick={() => theme === 'dark' && toggleTheme()}
                       className={`relative group cursor-pointer p-5 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all ${theme === 'light' ? 'bg-green-50/50 border-green-500' : 'bg-gray-50 dark:bg-gray-800/50 border-transparent hover:border-gray-200 dark:hover:border-gray-700'}`}
                      >
                        <SunIcon className={`w-6 md:w-8 h-6 md:h-8 mb-3 md:mb-4 transition-colors ${theme === 'light' ? 'text-green-600' : 'text-gray-400'}`} />
                        <p className="text-xs md:text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Light Mode</p>
                        <div className={`mt-1 h-1 w-6 md:h-1.5 md:w-8 rounded-full ${theme === 'light' ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'}`} />
                     </div>
                     <div 
                       onClick={() => theme === 'light' && toggleTheme()}
                       className={`relative group cursor-pointer p-5 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all ${theme === 'dark' ? 'bg-green-900/10 border-green-500' : 'bg-gray-50 dark:bg-gray-800/50 border-transparent hover:border-gray-200 dark:hover:border-gray-700'}`}
                      >
                        <MoonIcon className={`w-6 md:w-8 h-6 md:h-8 mb-3 md:mb-4 transition-colors ${theme === 'dark' ? 'text-green-400' : 'text-gray-400'}`} />
                        <p className="text-xs md:text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Dark Mode</p>
                        <div className={`mt-1 h-1 w-6 md:h-1.5 md:w-8 rounded-full ${theme === 'dark' ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-700'}`} />
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'account' && (
            <motion.div variants={itemVariants} className="space-y-6 md:space-y-8">
              <div className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-black/5 space-y-6 md:space-y-8">
                <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('subscriptionStatus')}</h3>
                <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-950 p-6 md:p-8 rounded-2xl md:rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-inner group">
                   <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="text-center md:text-left">
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-1">{t('currentPlan')}</p>
                         <h4 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">{user.subscription.plan.toUpperCase()}</h4>
                         <p className={`text-[10px] md:text-xs font-bold mt-3 md:mt-4 inline-block px-3 py-1 rounded-full ${user.subscription.plan === 'pro' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                           {t('joined')} {new Date(user.createdAt).getFullYear()}
                         </p>
                      </div>
                      <button className="bg-green-600 text-white px-8 py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-green-700 transition-all active:scale-95 shadow-xl shadow-green-600/20">
                        {t('managePlan')}
                      </button>
                   </div>
                   <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/[0.03] rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-950/20 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-red-100 dark:border-red-900/30 space-y-4 md:space-y-6">
                <div className="flex items-center gap-4 text-red-600 dark:text-red-400">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg md:rounded-xl">
                    <HistoryIcon className="w-5 md:w-6 h-5 md:h-6" />
                  </div>
                  <h3 className="text-lg md:text-xl font-black uppercase tracking-tight">{t('dangerZone')}</h3>
                </div>
                <p className="text-xs md:text-sm text-red-700/60 dark:text-red-400/60 font-medium max-w-lg">
                  {t('resetDataDescription')}
                </p>
                <button 
                  onClick={handleReset}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-red-600/20 active:scale-95 transition-all"
                >
                  {t('resetAllData')}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar Cards */}
        <div className="lg:col-span-4 space-y-8">
           <motion.div variants={itemVariants} className="bg-gray-100/50 dark:bg-gray-900/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <ShieldIcon className="w-5 h-5" />
                 </div>
                 <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Security Status</h4>
              </div>
              <p className="text-xs text-gray-500 font-bold leading-relaxed">Your account is currently protected by Shariah-compliant high-entropy encryption.</p>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 w-fit">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                 <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Two-Factor Active</span>
              </div>
           </motion.div>

           <motion.div variants={itemVariants} className="bg-green-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                 <CreditCardIcon className="w-10 h-10 mb-6 group-hover:scale-110 transition-transform" />
                 <h4 className="text-lg font-black uppercase tracking-tight">Need Help?</h4>
                 <p className="text-sm opacity-80 mt-2 font-medium">Contact our expert support team for any Shariah auditing guidance.</p>
                 <button className="w-full mt-6 bg-white text-green-700 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all shadow-xl">
                    Contact Specialist
                 </button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 opacity-50" />
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsScreen;
