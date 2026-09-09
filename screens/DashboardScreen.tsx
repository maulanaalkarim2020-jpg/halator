import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../services/storage';
import { ProductIcon, TransactionIcon, ProcessIcon, HistoryIcon, ActivityIcon } from '../components/Icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useLanguage } from '../hooks/useLanguage';
import { Page, AuditHistoryItem } from '../types';

const StatCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  trend?: string;
  isPositive?: boolean;
  colorClass: string;
  delay: number;
}> = ({ title, value, icon, trend, isPositive, colorClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -4 }}
    className="relative group overflow-hidden bg-white dark:bg-gray-900 p-5 md:p-6 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300"
  >
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
        <div className={colorClass.replace('bg-', 'text-')}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${isPositive ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'text-amber-500 bg-amber-50 dark:bg-amber-500/10'}`}>
          {isPositive ? '↑' : '↓'} {trend}
        </div>
      )}
    </div>
    <div className="mt-4">
      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500">{title}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{value}</h4>
      </div>
    </div>
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${colorClass} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.08] transition-opacity`} />
  </motion.div>
);

interface DashboardScreenProps {
  onNavigate: (page: Page, auditId?: string) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const user = storage.getUser();
  const [history, setHistory] = React.useState<AuditHistoryItem[]>(() => storage.getHistory() as AuditHistoryItem[]);
  const { t, language } = useLanguage();

  React.useEffect(() => {
    storage.syncHistoryWithBackend().then((synced) => {
      setHistory(synced);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  const complianceScore = useMemo(() => {
    if (history.length === 0) return '0%';
    const count = history.filter(h => {
      const out = h.output;
      // Heuristic for "Halal" or "Compliant"
      if (typeof out === 'string') return out.toLowerCase().includes('halal') || out.toLowerCase().includes('compliant');
      if (out?.verdict) return out.verdict.toLowerCase().includes('permissible') || out.verdict.toLowerCase().includes('halal');
      if (out?.assessment) return out.assessment.toLowerCase().includes('compliant');
      if (Array.isArray(out)) return out.every((i: any) => i.status?.toLowerCase() === 'halal');
      return false;
    }).length;
    return `${Math.round((count / history.length) * 100)}%`;
  }, [history]);

  const stats = useMemo(() => [
    { title: t('totalAudits'), value: history.length, icon: <HistoryIcon className="w-6 h-6" />, colorClass: 'bg-green-600', trend: 'Live', isPositive: true },
    { title: t('productChecks'), value: history.filter(h => h.type === 'product').length, icon: <ProductIcon className="w-6 h-6" />, colorClass: 'bg-emerald-600', trend: 'Real-time', isPositive: true },
    { title: t('transactions'), value: history.filter(h => h.type === 'transaction').length, icon: <TransactionIcon className="w-6 h-6" />, colorClass: 'bg-teal-600', trend: 'Updated', isPositive: true },
    { title: t('complianceScore'), value: complianceScore, icon: <ProcessIcon className="w-6 h-6" />, colorClass: 'bg-green-700', trend: 'Calculated', isPositive: true },
  ], [history, t, complianceScore]);

  const chartData = useMemo(() => {
    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNamesId = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const months = language === 'id' ? monthNamesId : monthNamesEn;
    
    // Use April 18, 2026 as current time context
    const now = new Date('2026-04-18'); 
    const data = [];
    
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      
      const count = history.filter(h => {
        const hDate = new Date(h.timestamp);
        return hDate.getMonth() === m && hDate.getFullYear() === y;
      }).length;
      
      data.push({ name: months[m], audits: count });
    }
    return data;
  }, [history, language]);

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
            <div className="h-12 w-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
          </div>
          <div className="h-14 w-48 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-[1.5rem] animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-[450px] bg-gray-200 dark:bg-gray-800 rounded-[2.5rem] animate-pulse" />
          <div className="lg:col-span-4 h-[450px] bg-gray-200 dark:bg-gray-800 rounded-[2.5rem] animate-pulse" />
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-2xl">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-between gap-4">
              <span>Audits</span>
              <span className="text-green-600">{payload[0].value}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-center md:justify-start gap-2 text-green-600 mb-2"
          >
            <ActivityIcon className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('dashboard')}</span>
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
            {t('welcome')}, <span className="text-green-600">{user?.name.split(' ')[0]}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 font-medium text-base md:text-lg tracking-tight">
            {t('dashboardSubtitle')}
          </p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center md:justify-start gap-3 bg-white dark:bg-gray-900 pl-2 pr-6 py-2 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm self-center md:self-end"
        >
          <div className="w-10 h-10 bg-green-100 dark:bg-green-600/20 rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status</p>
            <span className="text-sm font-bold text-green-700 dark:text-green-400 leading-none">{t('proPlanActive')}</span>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <StatCard 
            key={stat.title} 
            {...stat} 
            delay={0.1 + (i * 0.05)} 
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Chart Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-8 bg-white dark:bg-gray-900 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('auditActivity')}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Last 4 Months</p>
            </div>
            <div className="hidden sm:flex items-center gap-4 bg-gray-50 dark:bg-gray-950 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Growth</span>
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="premiumGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.15}/>
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" className="dark:stroke-gray-800/10" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                  dy={10}
                  height={50}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#22c55e', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="audits" 
                  stroke="#22c55e" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#premiumGradient)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Audits Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-4 bg-white dark:bg-gray-900 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('recentAudits')}</h3>
            <span className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center shadow-inner">
              <HistoryIcon className="w-4 h-4" />
            </span>
          </div>

          <div className="flex-grow space-y-3">
            <AnimatePresence mode="popLayout">
              {history.length > 0 ? (
                history.slice(0, 5).map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (idx * 0.05) }}
                    onClick={() => onNavigate('history', item.id)}
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-950/50 border border-transparent hover:border-gray-100 dark:hover:border-gray-800 hover:bg-white dark:hover:bg-gray-900 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-black/5"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                      {item.type === 'product' ? (
                        <ProductIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <TransactionIcon className="w-5 h-5 text-teal-600" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-black text-gray-900 dark:text-white truncate capitalize">{item.type} Audit</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{new Date(item.timestamp).toLocaleDateString()}</p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 h-8 px-3 rounded-full bg-green-600 text-white text-[10px] font-black uppercase tracking-widest transition-all duration-300 transform scale-90 group-hover:scale-100 shadow-lg shadow-green-600/20">
                      {t('view')}
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-gray-950 flex items-center justify-center mb-4">
                    <HistoryIcon className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm font-bold text-gray-400 italic">No recent audits yet</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => onNavigate('history')}
            className="w-full mt-8 p-4 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] transition-all duration-300 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-600/10 border border-gray-100 dark:border-gray-800"
          >
            {t('viewAllHistory')}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardScreen;
