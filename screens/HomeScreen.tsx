import React, { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import type { Page } from '../types';
import { storage } from '../services/storage';
import {
  ProductIcon,
  ProcessIcon,
  TransactionIcon,
  EducationIcon,
  LogoIcon,
  ShieldIcon,
  ActivityIcon,
  GlobeIcon,
  XIcon as LucideXIcon,
  MailIcon
} from '../components/Icons';
import { useLanguage } from '../hooks/useLanguage';

interface HomeScreenProps {
  onNavigate: (page: Page) => void;
}

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode
}> = ({ isOpen, onClose, title, content }) => {
  const { t } = useLanguage();
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
          >
            <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <LucideXIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
              {content}
            </div>
            <div className="p-8 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={onClose}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all"
              >
                {t('understand')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const SocialIcon: React.FC<{ href: string; icon: string }> = ({ href, icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-green-600 hover:text-white transition-all transform hover:scale-110"
  >
    <i className={`fab fa-${icon}`}></i>
    {/* Using simple text for icons as placeholder if fontawesome not loaded, but I'll use text for now or icons if available */}
    <span className="sr-only">{icon}</span>
    {icon === 'instagram' && <InstagramIcon className="w-5 h-5" />}
    {icon === 'threads' && <ThreadsIcon className="w-5 h-5" />}
    {icon === 'twitter' && <XIcon className="w-5 h-5" />}
    {icon === 'facebook' && <FacebookIcon className="w-5 h-5" />}
    {icon === 'tiktok' && <TikTokIcon className="w-5 h-5" />}
    {icon === 'youtube' && <YouTubeIcon className="w-5 h-5" />}
  </a>
);

// Internal Icons for social since they aren't in Icons.tsx but needed here
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733-16zM4 20l6.768-6.768m2.464-2.464L20 4"></path></svg>
);
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
);
const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
);
const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12c-3.14 0-5-1.86-5-5s1.86-5 5-5 5 1.86 5 5-1.86 5-5 5z"></path><path d="M12 12c3.14 0 5 1.86 5 5s-1.86 5-5 5-5-1.86-5-5 1.86-5 5-5z"></path></svg>
);

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode; delay: number }> = ({ title, description, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-black/5 hover:border-green-500/30 transition-all duration-500 group"
  >
    <div className="w-14 h-14 bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 dark:text-white">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const TestimonialCard: React.FC<{ name: string; role: string; text: string; delay: number }> = ({ name, role, text, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg"
  >
    <div className="flex text-yellow-400 mb-4 text-sm">
      {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
    </div>
    <p className="text-gray-600 dark:text-gray-300 italic mb-6 leading-relaxed">"{text}"</p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-black text-sm uppercase">
        {name[0]}
      </div>
      <div>
        <p className="font-bold text-sm dark:text-white leading-none">{name}</p>
        <p className="text-xs text-gray-500 mt-1">{role}</p>
      </div>
    </div>
  </motion.div>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const [modalContent, setModalContent] = useState<{ title: string; content: React.ReactNode } | null>(null);

  const openLegalModal = (type: 'privacy' | 'terms' | 'cookie') => {
    let title = '';
    let content = null;

    if (type === 'privacy') {
      title = t('privacyPolicy');
      content = (
        <div className="space-y-4">
          <p>{t('privacyPolicyContent1')}</p>
          <p>{t('privacyPolicyContent2')}</p>
        </div>
      );
    } else if (type === 'terms') {
      title = t('termsOfService');
      content = (
        <div className="space-y-4">
          <p>{t('termsOfServiceContent1')}</p>
          <p>{t('termsOfServiceContent2')}</p>
        </div>
      );
    } else {
      title = t('cookiePolicy');
      content = (
        <div className="space-y-4">
          <p>{t('cookiePolicyContent1')}</p>
          <p>{t('cookiePolicyContent2')}</p>
        </div>
      );
    }

    setModalContent({ title, content });
  };

  return (
    <div className="bg-white dark:bg-gray-950 font-sans selection:bg-green-100 selection:text-green-900">
      <Modal
        isOpen={!!modalContent}
        onClose={() => setModalContent(null)}
        title={modalContent?.title || ''}
        content={modalContent?.content}
      />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-green-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full" />

        <div className="container mx-auto px-4 pt-48 pb-20 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full border border-green-100 dark:border-green-800"
            >
              <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
              <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-widest">{t('aiShariahCompliance')}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-9xl font-black leading-[0.8] tracking-tighter"
            >
              <span className="bg-clip-text text-transparent bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white">
                Halator
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed font-medium"
            >
              {t('heroSubtitle').split(' ').map((word, i) => {
                const highlights = [
                  'Artificial', 'Intelligence', 'Syariah',
                  'Bahan', 'Produk,', 'Alur', 'Kerja', 'Bisnis,', 'Transaksi', 'Keuangan',
                  'Product', 'Ingredients,', 'Business', 'Workflows,', 'Financial', 'Transactions.'
                ];
                const cleanWord = word.replace(/[**]/g, '');
                return highlights.includes(cleanWord) ? (
                  <span key={i} className="text-green-600 dark:text-green-400 font-black">{word} </span>
                ) : (
                  <span key={i}>{word} </span>
                );
              })}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center gap-4 pt-4"
            >
              <button
                onClick={() => onNavigate('register')}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-green-600/30 hover:scale-105 active:scale-95"
              >
                {t('getStarted')}
              </button>
              <button
                className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-10 py-5 rounded-2xl font-bold text-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform">
                  <ActivityIcon className="w-4 h-4" />
                </div>
                {t('viewDemo')}
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="bg-gray-100 dark:bg-gray-900 aspect-square rounded-[5rem] overflow-hidden border-8 border-white dark:border-gray-800 shadow-2xl relative group">
              <img
                src="https://picsum.photos/seed/halal-modern-tech/1000/1000"
                alt="Halal Verification AI"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80"
              />
              <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/10 to-black/40" />
              <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/20 dark:border-gray-700 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] space-y-8 w-full transform -rotate-2 hover:rotate-0 transition-all duration-700">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-green-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-green-600/40 border-4 border-white/20">
                      <LogoIcon className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                      <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-5 pt-4">
                    <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full" />
                    <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full" />
                    <div className="h-3 w-3/4 bg-gray-100 dark:bg-gray-800 rounded-full" />
                  </div>
                  <div className="pt-8 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-100/50 dark:border-gray-700/50">
                    <div className="space-y-1">
                      <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('analysisStatus')}</span>
                      <div className="h-4 w-20 bg-green-200 dark:bg-green-900/30 rounded-full" />
                    </div>
                    <div className="px-8 py-4 bg-green-600 text-white text-[12px] font-black rounded-2xl uppercase tracking-[0.2em] shadow-[0_15px_30px_-5px_rgba(22,163,74,0.5)] border-2 border-white/20">
                      {t('verifiedHalal')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section (Red Style) */}
      <section id="why-us" className="py-40 bg-linear-to-b from-white to-red-50 dark:from-gray-950 dark:to-red-950/10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-block px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-extrabold text-xs uppercase tracking-[0.3em] rounded-full border border-red-200 dark:border-red-900/50"
              >
                {t('problem')}
              </motion.div>
              <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-[0.9] tracking-tighter max-w-3xl mx-auto">
                {t('problemTitle')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  title: t('problemDesc1'),
                  icon: <ActivityIcon className="w-8 h-8 text-red-600" />,
                  detail: t('problemDetail1')
                },
                {
                  title: t('problemDesc2'),
                  icon: <GlobeIcon className="w-8 h-8 text-red-600" />,
                  detail: t('problemDetail2')
                },
                {
                  title: t('problemDesc3'),
                  icon: <ShieldIcon className="w-8 h-8 text-red-600" />,
                  detail: t('problemDetail3')
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-red-100 dark:border-red-900/20 shadow-2xl shadow-red-500/5 group hover:border-red-500/40 transition-all duration-500"
                >
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform duration-500">
                    {item.icon}
                  </div>
                  <h3 className="font-black text-2xl text-gray-900 dark:text-white mb-4 leading-tight tracking-tight">{item.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium">{item.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section (Green Style) */}
      <section id="features" className="py-40 bg-white dark:bg-gray-950 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div className="space-y-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-block px-6 py-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-extrabold text-xs uppercase tracking-[0.3em] rounded-full border border-green-200 dark:border-green-900/50"
              >
                {t('solution')}
              </motion.div>
              <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-[0.9] tracking-tighter">{t('solutionTitle')}</h2>

              <div className="space-y-8">
                {[
                  { text: t('solutionDesc1'), icon: ShieldIcon, detail: t('solutionDetail1') },
                  { text: t('solutionDesc2'), icon: ActivityIcon, detail: t('solutionDetail2') },
                  { text: t('solutionDesc3'), icon: LogoIcon, detail: t('solutionDetail3') }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-8 group"
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-green-600/5">
                      <item.icon className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{item.text}</p>
                      <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{item.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, rotate: 5, scale: 0.9 }}
              whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-green-600/20 blur-[120px] rounded-full scale-150" />
              <div className="bg-green-600 h-[650px] rounded-[4rem] p-16 flex flex-col justify-between text-white overflow-hidden relative shadow-[0_50px_100px_-20px_rgba(22,163,74,0.4)]">
                <div className="w-full h-full absolute inset-0 opacity-10 mix-blend-overlay">
                  <img src="https://picsum.photos/seed/green-texture/1000/1000" className="w-full h-full object-cover" alt="texture" />
                </div>
                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                  <div className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20">
                    <LogoIcon className="w-16 h-16 text-white" />
                  </div>
                  <h4 className="text-3xl font-black uppercase tracking-[0.2em]">Verified Hub</h4>
                </div>
                <div className="relative z-10 space-y-2">
                  <p className="text-8xl font-black tracking-tighter leading-none">99.9%</p>
                  <p className="text-2xl font-black text-green-100 uppercase tracking-[0.3em]">{t('aiAccuracy')}</p>
                  <div className="h-2 w-full bg-white/20 dark:bg-black/20 rounded-full mt-6 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '99.9%' }}
                      transition={{ duration: 2, delay: 0.5 }}
                      className="h-full bg-white shadow-[0_0_20px_white]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-40 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('demoTitle')}</h2>
            <div className="h-2 w-24 bg-green-600 mx-auto rounded-full" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="aspect-video bg-gray-900 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[12px] border-white dark:border-gray-800 overflow-hidden relative group"
          >
            <img
              src="https://picsum.photos/seed/halal-audit-demo/1280/720"
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
              alt="Demo thumbnail"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-28 h-28 bg-green-600 rounded-full flex items-center justify-center text-white shadow-[0_20px_50px_-10px_rgba(22,163,74,0.5)] hover:scale-110 transition-transform active:scale-95 group/play relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/play:translate-y-0 transition-transform duration-300" />
                <svg className="w-12 h-12 ml-2 relative z-10" fill="currentColor" viewBox="0 0 20 20"><path d="M4.5 3.5v13L16 10 4.5 3.5z" /></svg>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white">{t('testimonials')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <TestimonialCard name="Ahmad" role={t('cateringOwner')} text={t('testimonial1')} delay={0.1} />
            <TestimonialCard name="Siti" role={t('foodAuditor')} text={t('testimonial2')} delay={0.2} />
            <TestimonialCard name="Budi" role={t('retailManager')} text={t('testimonial3')} delay={0.3} />
            <TestimonialCard name="Fatimah" role={t('homeBusiness')} text={t('testimonial4')} delay={0.4} />
          </div>
        </div>
      </section>

      {/* Pricing / Subscription Section */}
      <section className="py-32 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-20">
            <h2 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('chooseYourPlan')}</h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-bold leading-relaxed">
              {t('subscriptionSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {[
              {
                name: 'Free',
                price: '0',
                features: t('language') === 'id' ? ['5 Audit Produk / bln', 'Daftar Periksa Proses Dasar', 'Dukungan Komunitas', 'Notifikasi Email'] : ['5 Product Audits / mo', 'Basic Process Checklist', 'Community Support', 'Email Notifications'],
                cta: t('currentPlanLabel'),
                popular: false,
              },
              {
                name: 'Pro',
                price: '149.000',
                features: t('language') === 'id' ? ['Audit Produk Tak Terbatas', 'Audit Proses Lengkap (HAS 23000)', 'Analisis Transaksi', 'Dukungan Prioritas', 'Ekspor Laporan PDF', 'Akses Afiliasi'] : ['Unlimited Product Audits', 'Full Process Audit (HAS 23000)', 'Transaction Analysis', 'Priority Support', 'Export PDF Reports', 'Affiliate Access'],
                cta: t('upgradeToPro'),
                popular: true,
              },
              {
                name: 'Enterprise',
                price: t('language') === 'id' ? 'Kustom' : 'Custom',
                features: t('language') === 'id' ? ['Akses Multi-pengguna', 'Alur Kerja Audit Kustom', 'Integrasi API', 'Manajer Akun Khusus', 'Pelatihan di Tempat'] : ['Multi-user Access', 'Custom Audit Workflow', 'API Integration', 'Dedicated Account Manager', 'On-site Training'],
                cta: t('contactSales'),
                popular: false,
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
                className={`relative bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-2xl border-4 flex flex-col transition-all hover:scale-[1.02] ${plan.popular ? 'border-green-600 shadow-green-600/10 z-10' : 'border-gray-50 dark:border-gray-800'
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
                  onClick={() => onNavigate('register')}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 ${plan.popular
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gray-900 dark:bg-gray-800 rounded-[3rem] p-12 md:p-24 text-center space-y-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/20 blur-[150px] rounded-full -ml-48 -mt-48" />
            <div className="relative z-10 space-y-8">
              <h2 className="text-5xl md:text-7xl font-black text-white">{t('ctaTitle')}</h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">{t('ctaSubtitle')}</p>
              <button
                onClick={() => onNavigate('register')}
                className="bg-green-600 hover:bg-green-700 text-white px-12 py-6 rounded-2xl font-black text-xl transition-all shadow-2xl shadow-green-600/30 hover:scale-105 active:scale-95"
              >
                {t('getStarted')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 pt-24 pb-12 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2 space-y-10 border-r border-gray-100 dark:border-gray-800 pr-12">
              <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => onNavigate('home')}>
                <img
                  src="/logo.jpeg"
                  alt="Logo"
                  className="w-30 h-24 object-contain rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none"
                />
                <h1 className="text-3xl font-black dark:text-white tracking-tighter">
                  Halator
                </h1>
              </div>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm text-xl font-medium leading-relaxed italic pr-6">
                {t('footerDescription')}
              </p>
              <div className="flex items-center gap-6 pt-2">
                <a href="https://contech.id/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-600 transition-colors">
                  <GlobeIcon className="w-8 h-8" />
                </a>
                <a href="mailto:info@contech.id" className="text-gray-400 hover:text-green-600 transition-colors">
                  <MailIcon className="w-8 h-8" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-[0.2em] text-[10px] mb-10 text-gray-400 dark:text-gray-500">{t('company')}</h4>
              <ul className="space-y-6 text-gray-600 dark:text-gray-300 font-black uppercase text-xs tracking-widest text-left">
                <li><button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); onNavigate('home'); }} className="hover:text-green-600 transition-colors">{t('aboutUs')}</button></li>
                <li><button onClick={() => openLegalModal('privacy')} className="hover:text-green-600 transition-colors text-left">{t('privacyPolicy')}</button></li>
                <li><button onClick={() => openLegalModal('terms')} className="hover:text-green-600 transition-colors text-left">{t('termsOfService')}</button></li>
                <li><button onClick={() => openLegalModal('cookie')} className="hover:text-green-600 transition-colors text-left">{t('cookiePolicy')}</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-[0.2em] text-[10px] mb-10 text-gray-400 dark:text-gray-500">{t('connect')}</h4>
              <div className="flex flex-wrap gap-4">
                <SocialIcon icon="instagram" href="https://www.instagram.com/contech.id/" />
                <SocialIcon icon="threads" href="https://www.threads.com/@contech.id?hl=id" />
                <SocialIcon icon="twitter" href="https://x.com/contechofficial" />
                <SocialIcon icon="facebook" href="https://web.facebook.com/contech.id." />
                <SocialIcon icon="tiktok" href="https://www.tiktok.com/@contech.id" />
                <SocialIcon icon="youtube" href="https://www.youtube.com/@contechid1288" />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-center gap-2">
            <p className="text-sm text-gray-400 font-bold tracking-wider">
              &copy; {new Date().getFullYear()} HALATOR. {t('rights')}
            </p>
            <span className="text-sm text-gray-300 dark:text-gray-600 hidden md:block">|</span>
            <p className="text-sm text-gray-400 font-bold tracking-wider flex items-center gap-1">
              {t('createdBy')} <a href="https://contech.id/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-500 transition-colors font-black">Contech</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeScreen;
