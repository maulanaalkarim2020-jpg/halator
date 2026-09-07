import React from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useLanguage } from '../hooks/useLanguage';

const SubscriptionScreen: React.FC = () => {
  const { language, t } = useLanguage();

  const plans = [
    {
      name: 'Free',
      price: '0',
      features: language === 'id' ? ['5 Audit Produk / bln', 'Daftar Periksa Proses Dasar', 'Dukungan Komunitas', 'Notifikasi Email'] : ['5 Product Audits / mo', 'Basic Process Checklist', 'Community Support', 'Email Notifications'],
      cta: t('currentPlanLabel'),
      popular: false,
      color: 'gray',
    },
    {
      name: 'Pro',
      price: '149.000',
      features: language === 'id' ? ['Audit Produk Tak Terbatas', 'Audit Proses Lengkap (HAS 23000)', 'Analisis Transaksi', 'Dukungan Prioritas', 'Ekspor Laporan PDF', 'Akses Afiliasi'] : ['Unlimited Product Audits', 'Full Process Audit (HAS 23000)', 'Transaction Analysis', 'Priority Support', 'Export PDF Reports', 'Affiliate Access'],
      cta: t('upgradeToPro'),
      popular: true,
      color: 'green',
    },
    {
      name: 'Enterprise',
      price: language === 'id' ? 'Kustom' : 'Custom',
      features: language === 'id' ? ['Akses Multi-pengguna', 'Alur Kerja Audit Kustom', 'Integrasi API', 'Manajer Akun Khusus', 'Pelatihan di Tempat'] : ['Multi-user Access', 'Custom Audit Workflow', 'API Integration', 'Dedicated Account Manager', 'On-site Training'],
      cta: t('contactSales'),
      popular: false,
      color: 'blue',
    },
  ];

  const handleUpgrade = (plan: string) => {
    if (plan === 'Pro') {
      toast.success(t('redirectingPayment'));
    } else if (plan === 'Enterprise') {
      toast.info(t('contactShortly'));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 md:space-y-16 px-4 md:px-0">
      <div className="text-center space-y-4 md:space-y-6">
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight">{t('chooseYourPlan')}</h1>
        <p className="text-base md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
          {t('subscriptionSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
            className={`relative bg-white dark:bg-gray-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl border-4 flex flex-col transition-all hover:scale-[1.02] ${
              plan.popular ? 'border-green-600 shadow-green-600/10 z-10' : 'border-gray-50 dark:border-gray-800'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-green-600/40 border-4 border-white dark:border-gray-900">
                {t('mostPopular')}
              </div>
            )}
            <div className="mb-10 text-center sm:text-left">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">{plan.name}</h3>
              <div className="flex items-baseline justify-center sm:justify-start gap-1">
                <span className="text-sm font-black text-green-600 uppercase">Rp</span>
                <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">{plan.price}</span>
                {plan.price !== 'Custom' && plan.price !== 'Kustom' && <span className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">/mo</span>}
              </div>
            </div>
            <ul className="space-y-5 mb-12 flex-grow">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-4 text-sm text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
                  <div className="mt-1 bg-green-50 dark:bg-green-900/20 p-1.5 rounded-xl shadow-sm">
                    <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(plan.name)}
              disabled={plan.name === 'Free'}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 ${
                plan.popular 
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-2xl shadow-green-600/40' 
                  : plan.name === 'Free' 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-default font-black'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 shadow-xl'
              }`}
            >
              {plan.cta}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] text-center border border-gray-100 dark:border-gray-800 shadow-inner relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-green-500/10" />
        <h3 className="text-2xl md:text-3xl font-black mb-4 uppercase tracking-tight text-gray-900 dark:text-white">{t('needCustomSolution')}</h3>
        <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-8 md:mb-10 max-w-2xl mx-auto font-medium">
          {t('customSolutionText')}
        </p>
        <button className="text-green-600 font-black uppercase tracking-widest text-sm hover:underline flex items-center gap-2 mx-auto active:scale-95 transition-all">
          {t('contactEnterprise')}
          <span className="text-xl">→</span>
        </button>
      </div>
    </div>
  );
};

export default SubscriptionScreen;
