import React, { useState, useRef } from 'react';
import { analyzeTransaction, getFollowUpAnalysis } from '../services/geminiService';
import type { AuditResult, TransactionAuditResult } from '../types';
import Spinner from '../components/Spinner';
import AuditResultDisplay from '../components/AuditResult';
import { storage } from '../services/storage';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { TransactionIcon, ChatIcon } from '../components/Icons';
import { useLanguage } from '../hooks/useLanguage';
import { 
  Zap, 
  Sparkles, 
  RefreshCw, 
  FileText, 
  ChevronRight, 
  ShieldCheck, 
  Send, 
  ArrowRight,
  Info,
  BadgeCent
} from 'lucide-react';

const TransactionAuditScreen: React.FC = () => {
  const { language, t } = useLanguage();
  
  const suggestedTransactions = [
    {
      title: language === 'id' ? 'Kredit Kepemilikan Rumah (KPR) Konvensional' : 'Conventional Mortgage (KPR)',
      description: language === 'id' ? 'Pembelian rumah melalui KPR bank konvensional dengan bunga tetap 7% per tahun selama 15 tahun.' : 'A house purchase through a conventional bank mortgage with a fixed interest rate of 7% per year over 15 years.',
    },
    {
      title: language === 'id' ? 'Asuransi Jiwa' : 'Life Insurance',
      description: language === 'id' ? 'Kontrak asuransi jiwa di mana premi dibayar rutin, tetapi nilai klaim dan waktunya tidak pasti.' : 'A life insurance contract where premiums are paid regularly, but the claim payout and its timing are uncertain.',
    },
    {
      title: language === 'id' ? 'Jual Beli Ijon' : 'Forward Sale (Ijon)',
      description: language === 'id' ? 'Menjual buah yang masih di pohon dan belum matang, di mana kualitas dan kuantitasnya belum pasti.' : 'Selling fruits that are still on the tree and not yet ripe, where the quality and quantity are uncertain.',
    },
    {
      title: language === 'id' ? 'Skema Investasi' : 'Investment Scheme',
      description: language === 'id' ? 'Skema investasi "money game" yang menjanjikan keuntungan 30% per bulan tanpa bisnis riil.' : 'A "money game" investment scheme promising a 30% monthly return with no underlying real business.',
    }
  ];

  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  const [chatHistory, setChatHistory] = useState<{ user: string; ai: string }[]>([]);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const saveToHistory = (input: string, output: any) => {
    const user = storage.getUser();
    if (user) {
      storage.addHistory({
        id: `h-${Date.now()}`,
        userId: user.id,
        type: 'transaction',
        input,
        output,
        timestamp: new Date().toISOString(),
      });
      // Update user limits
      storage.setUser({
        ...user,
        subscription: {
          ...user.subscription,
          limits: {
            ...user.subscription.limits,
            auditsUsed: user.subscription.limits.auditsUsed + 1
          }
        }
      });
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setIsLoading(true);
    setResult(null);
    setChatHistory([]); // Reset chat on new analysis
    const apiResult = await analyzeTransaction(description);
    setResult(apiResult);
    setIsLoading(false);
    if (!(apiResult as any).error) {
      saveToHistory(description, apiResult);
      toast.success(t('auditComplete'));
    } else {
      toast.error(t('auditFailed'));
    }
  };
  
  const handleSuggestionClick = (text: string) => {
    setDescription(text);
    textAreaRef.current?.focus();
  };
  
  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuestion.trim() || !result || typeof result === 'string' || 'error' in result) return;

    setIsChatLoading(true);
    const question = followUpQuestion;
    const currentHistory = [...chatHistory, { user: question, ai: '' }];
    setChatHistory(currentHistory.slice(0, -1)); // Temporarily remove the AI part for the update
    setFollowUpQuestion(''); // Clear input immediately for better UX

    const apiResult = await getFollowUpAnalysis(description, result as TransactionAuditResult, chatHistory, question);

    if (typeof apiResult === 'string') {
        setChatHistory(prev => [...prev, { user: question, ai: apiResult }]);
    } else {
        setChatHistory(prev => [...prev, { user: question, ai: `Error: ${apiResult.error}` }]);
    }
    setIsChatLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-2 pb-10">
      {/* Header Section */}
      <div className="text-center pt-2">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-1">
          {t('transactionAuditTitle')}
        </h2>
        
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium text-xs md:text-sm leading-tight">
          {t('transactionAuditSubtitle')}
        </p>
      </div>

      <div className="relative group/main">
        {/* Decorative background glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-green-600/5 to-emerald-600/5 rounded-[3rem] blur opacity-0 group-hover/main:opacity-100 transition duration-1000" />
        
        <div className="relative bg-white dark:bg-gray-950 p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-[0_20px_40px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Subtle background texture/gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
          
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <label htmlFor="transaction-desc" className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="w-2.5 h-2.5" />
                  {t('transactionDescLabel')}
                </label>
                <div className="flex items-center gap-1.5">
                   <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[8px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">Shariah Logic Ready</span>
                </div>
              </div>
              
              <div className="relative group">
                <textarea
                  id="transaction-desc"
                  ref={textAreaRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('transactionPlaceholder')}
                  className="w-full h-40 md:h-48 px-5 md:px-8 py-4 md:py-6 border border-gray-100 dark:border-gray-800 rounded-2xl md:rounded-3xl bg-gray-50/50 dark:bg-gray-900/50 focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 outline-none transition-all resize-none text-base md:text-lg font-bold text-gray-900 dark:text-white shadow-inner custom-scrollbar leading-relaxed"
                />
                
                {description.length === 0 && (
                   <div className="absolute left-8 top-6 pointer-events-none text-gray-300 dark:text-gray-700 select-none">
                      <Sparkles className="w-6 h-6 opacity-20" />
                   </div>
                )}
                
                {description.length > 0 && (
                  <button 
                    onClick={() => setDescription('')}
                    className="absolute top-4 right-4 p-1.5 rounded-lg bg-gray-200/50 dark:bg-gray-800/50 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
              <div className="flex items-start gap-3 px-4 py-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-900/20">
                <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                <p className="text-[11px] text-blue-700/70 dark:text-blue-400/60 font-medium leading-tight">
                  Provide specific details such as interest rates, risk-sharing agreements, or contract types for the most accurate Shariah audit.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1" />
                 <h4 className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em]">{t('tryExample')}</h4>
                 <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {suggestedTransactions.map((item, idx) => (
                  <motion.button
                    key={item.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => handleSuggestionClick(item.description)}
                    className="group relative p-4 bg-white dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 text-left hover:border-green-500/30 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-green-500/5 hover:-translate-y-0.5 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <ArrowRight className="w-3.5 h-3.5 text-green-500" />
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-green-500/10 group-hover:text-green-500 transition-colors shrink-0">
                        <BadgeCent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <strong className="font-black text-[10px] text-gray-900 dark:text-white uppercase tracking-wider block truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors font-sans">{item.title}</strong>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5 leading-relaxed font-medium">{item.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={handleSubmit}
                disabled={isLoading || !description.trim()}
                className="group relative w-full h-20 bg-green-500 hover:bg-green-600 text-white font-black rounded-3xl overflow-hidden shadow-[0_20px_40px_rgba(34,197,94,0.3)] transition-all duration-300 disabled:opacity-30 disabled:shadow-none hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-4 border border-white/20"
              >
                <div className="relative z-10 flex items-center justify-center gap-4">
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span className="text-sm font-black uppercase tracking-[0.3em]">{t('analyzing')}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6 fill-current" />
                      <span className="text-sm font-black uppercase tracking-[0.3em]">{t('startTransactionAudit')}</span>
                    </>
                  )}
                </div>
                {/* Glossy overlay */}
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                {/* Progress-like background fill */}
                {isLoading && (
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '0%' }}
                    transition={{ duration: 15, ease: "linear" }}
                    className="absolute inset-0 bg-white/10"
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 space-y-8"
          >
            <div className="relative">
              <div className="w-24 h-24 border-b-4 border-green-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-green-500 animate-pulse" />
              </div>
              <div className="absolute inset-0 bg-green-500/10 blur-3xl rounded-full" />
            </div>
            <div className="text-center space-y-2">
               <p className="text-gray-900 dark:text-white font-black uppercase tracking-widest leading-none">AI is analyzing Finance Structures</p>
               <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">{t('analyzingFinance')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="flex items-center justify-center gap-4">
               <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1" />
               <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em]">Audit Assessment Result</h4>
               <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1" />
            </div>
            
            <div className="relative group/result">
               <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-[3rem] blur opacity-0 group-hover/result:opacity-100 transition duration-1000" />
               <AuditResultDisplay result={result} />
            </div>

            {result && typeof result !== 'string' && !('error' in result) && 'verdict' in result && (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-12 space-y-12"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6 px-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/30 flex items-center justify-center shrink-0">
                    <ChatIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                     <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('askFollowUp')}</h3>
                     <p className="text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Chat interactive with AI Auditor</p>
                  </div>
                </div>
                
                <div className="relative bg-white dark:bg-gray-950 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden">
                  <div className="max-h-[600px] overflow-y-auto p-5 md:p-12 custom-scrollbar space-y-10">
                    <AnimatePresence mode="popLayout">
                      {chatHistory.length === 0 && !isChatLoading && (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
                           <ChatIcon className="w-12 h-12" />
                           <p className="text-sm font-black uppercase tracking-widest">No conversation yet</p>
                        </div>
                      )}
                      
                      {chatHistory.map((chat, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-8"
                        >
                          <div className="flex justify-end">
                            <div className="bg-blue-600 text-white px-8 py-5 rounded-3xl rounded-tr-none max-w-[85%] shadow-xl shadow-blue-600/10 border border-white/5">
                              <p className="text-base font-bold leading-relaxed">{chat.user}</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-start">
                            <div className="bg-gray-50 dark:bg-gray-900 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] rounded-tl-none max-w-[95%] border border-gray-100 dark:border-gray-800 transition-colors">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center">
                                   <Zap className="w-3 h-3 text-white fill-current" />
                                </div>
                                <p className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-[0.2em]">{t('aiAuditor')}</p>
                              </div>
                              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-medium text-lg border-l-2 border-green-500/20 pl-6 ml-1">
                                {chat.ai}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {isChatLoading && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                         <div className="bg-gray-50 dark:bg-gray-900 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] rounded-tl-none min-w-[200px] md:min-w-[300px] border border-gray-100 dark:border-gray-800">
                           <div className="flex items-center gap-3">
                              <Spinner />
                              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest animate-pulse">Thinking...</span>
                           </div>
                         </div>
                      </motion.div>
                    )}
                  </div>

                   {/* Chat Input */}
                  <div className="p-4 md:p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <form onSubmit={handleFollowUpSubmit} className="relative group flex flex-col sm:block">
                      <div className="absolute inset-0 bg-green-500/10 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition duration-500" />
                      
                      <input
                        type="text"
                        value={followUpQuestion}
                        onChange={(e) => setFollowUpQuestion(e.target.value)}
                        placeholder={t('followUpPlaceholder')}
                        className="relative w-full h-16 md:h-20 pl-6 md:pl-8 pr-6 sm:pr-48 border border-gray-100 dark:border-gray-800 rounded-2xl md:rounded-3xl bg-white dark:bg-gray-900 focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 outline-none transition-all shadow-xl font-bold text-gray-900 dark:text-white"
                        disabled={isChatLoading}
                      />
                      
                      <button
                        type="submit"
                        disabled={isChatLoading || !followUpQuestion.trim()}
                        className="mt-3 sm:mt-0 relative sm:absolute sm:right-3 sm:top-3 sm:bottom-3 h-12 sm:h-auto bg-blue-600 text-white font-black px-8 sm:px-10 rounded-xl sm:rounded-2xl hover:bg-blue-700 disabled:opacity-30 disabled:shadow-none transition-all uppercase tracking-widest shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                        <span className="text-xs">{t('send')}</span>
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionAuditScreen;
