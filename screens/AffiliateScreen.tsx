import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../services/storage';
import { toast } from 'sonner';
import { useLanguage } from '../hooks/useLanguage';
import { 
  Users, 
  Wallet, 
  TrendingUp, 
  Link as LinkIcon, 
  Copy, 
  ExternalLink,
  History as HistoryIcon,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  MousePointer2,
  Calendar
} from 'lucide-react';

const AffiliateScreen: React.FC = () => {
  const { language, t } = useLanguage();
  const affiliate = storage.getAffiliate();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (affiliate) {
      navigator.clipboard.writeText(`https://halalauditor.ai/ref/${affiliate.code}`);
      setCopied(true);
      toast.success(t('copied'));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!affiliate) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
      <p className="font-black uppercase tracking-widest text-gray-400 text-xs">Loading Affiliate Data...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header & Main Link Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-12 text-center space-y-5">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest mb-2">
              <TrendingUp className="w-2.5 h-2.5" />
              Grow with us
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
              {t('affiliateTitle')}
           </h1>
           <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed text-sm md:text-base">
              {t('affiliateSubtitle')}
           </p>
        </div>

        {/* Link Card */}
        <div className="lg:col-span-8">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="relative bg-white dark:bg-gray-950 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-[0_20px_40px_rgba(0,0,0,0.03)] overflow-hidden group"
           >
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              
              <div className="relative space-y-8">
                <div className="flex items-center justify-between">
                   <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-green-500" />
                      {t('referralLink')}
                   </h3>
                   <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">Active Link</span>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-grow bg-gray-50 dark:bg-gray-900 px-6 py-5 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 font-mono text-sm flex items-center overflow-hidden shadow-inner group-focus-within:border-green-500/50 transition-colors">
                    <span className="truncate text-gray-600 dark:text-gray-300 font-bold">https://halalauditor.ai/ref/{affiliate.code}</span>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="group/btn relative bg-green-600 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-green-600/20 active:scale-95 overflow-hidden flex items-center justify-center gap-3"
                  >
                    <div className="relative z-10 flex items-center gap-3">
                       {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5 transition-transform group-hover/btn:scale-110" />}
                       {copied ? t('copied') : t('copyLink')}
                    </div>
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                  {t('shareLinkInstructions')}
                </p>
              </div>
           </motion.div>
        </div>

        {/* Earning Card */}
        <div className="lg:col-span-4">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="relative bg-white dark:bg-gray-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-black/5 dark:shadow-green-900/10 flex flex-col justify-between h-full min-h-[220px] md:min-h-[250px] overflow-hidden group border border-gray-100 dark:border-gray-800"
           >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 dark:bg-green-500/10 rounded-full blur-3xl -mr-8 -mt-8" />
              
              <div>
                 <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/50 rounded-2xl flex items-center justify-center backdrop-blur-md">
                       <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <ArrowUpRight className="w-6 h-6 text-gray-300 dark:text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                 </div>
                 <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{t('totalEarnings')}</p>
                 <p className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">Rp {affiliate.earnings.toLocaleString()}</p>
              </div>

              <button className="mt-8 bg-green-600 dark:bg-green-500 text-white dark:text-gray-900 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 dark:hover:bg-green-400 transition-all shadow-xl active:scale-95">
                {t('withdrawFunds')}
              </button>
           </motion.div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: t('totalReferrals'), value: affiliate.referrals, icon: Users, color: 'blue', sub: 'Active members' },
          { label: t('clicks'), value: '1,248', icon: MousePointer2, color: 'purple', sub: 'Link popularity' },
          { label: t('totalCommission'), value: '25%', icon: TrendingUp, color: 'green', sub: 'Earning rate' }
        ].map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className="bg-white dark:bg-gray-950 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex items-center gap-6 shadow-[0_20px_40px_rgba(0,0,0,0.03)] group"
          >
            <div className={`bg-${stat.color}-50 dark:bg-${stat.color}-900/10 p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-8 h-8 text-${stat.color}-600 dark:text-${stat.color}-400`} />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                 <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stat.value}</p>
                 <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{stat.sub}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Payout & Referral Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payout History */}
        <div className="bg-white dark:bg-gray-950 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.03)]">
          <div className="p-6 md:p-8 pb-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center">
                  <HistoryIcon className="w-5 h-5 text-gray-400" />
               </div>
               <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('payoutHistory')}</h3>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-y border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/10 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                  <th className="px-8 py-5 tracking-widest">{t('date')}</th>
                  <th className="px-8 py-5 tracking-widest">{t('amount')}</th>
                  <th className="px-8 py-5 tracking-widest">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {affiliate.payoutHistory.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-12 text-center text-gray-400 font-black uppercase tracking-widest text-[10px]">No payout data</td>
                  </tr>
                ) : (
                  affiliate.payoutHistory.map((payout, i) => (
                    <tr key={i} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="px-8 py-6 text-xs text-gray-600 dark:text-gray-400 font-bold">
                        {new Date(payout.date).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-lg font-black text-gray-900 dark:text-white">Rp {payout.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-500/20 shadow-sm">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {payout.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Member Referrals (Mock data for visuals as requested) */}
        <div className="bg-white dark:bg-gray-950 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.03)]">
           <div className="p-6 md:p-8 pb-4 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/10 rounded-xl flex items-center justify-center">
                   <Users className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('referralList')}</h3>
             </div>
           </div>

           <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-y border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/10 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                  <th className="px-8 py-5 tracking-widest">{t('fullName')}</th>
                  <th className="px-8 py-5 tracking-widest">{t('joinDate')}</th>
                  <th className="px-8 py-5 tracking-widest">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {[
                  { name: 'Adam Syahrul', date: '2024-03-12', status: 'Pro' },
                  { name: 'Siti Aminah', date: '2024-03-15', status: 'Free' },
                  { name: 'Budi Hartono', date: '2024-03-20', status: 'Pro' },
                  { name: 'Maya Sari', date: '2024-03-25', status: 'Pro' }
                ].map((ref, i) => (
                  <tr key={i} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-xs text-gray-400">
                             {ref.name[0]}
                          </div>
                          <span className="text-sm font-black text-gray-900 dark:text-white leading-none">{ref.name}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-xs text-gray-500 dark:text-gray-500 font-bold uppercase tracking-tighter">
                       {ref.date}
                    </td>
                    <td className="px-8 py-6">
                       <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                         ref.status === 'Pro' 
                           ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' 
                           : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-transparent dark:text-gray-500'
                       }`}>
                         {ref.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateScreen;
