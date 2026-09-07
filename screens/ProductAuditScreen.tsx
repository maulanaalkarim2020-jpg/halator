import React, { useState, useRef, useEffect } from 'react';
import { analyzeIngredients, analyzeImageIngredients } from '../services/geminiService';
import type { AuditResult } from '../types';
import Spinner from '../components/Spinner';
import AuditResultDisplay from '../components/AuditResult';
import { CameraIcon, ProductIcon } from '../components/Icons';
import { storage } from '../services/storage';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';
import { Zap, Upload, RefreshCw, AlertCircle, CheckCircle2, Search, Info } from 'lucide-react';

type Tab = 'manual' | 'ocr';

const ProductAuditScreen: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('manual');
  const [productName, setProductName] = useState('');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveToHistory = (input: string, output: any) => {
    const user = storage.getUser();
    if (user) {
      storage.addHistory({
        id: `h-${Date.now()}`,
        userId: user.id,
        type: 'product',
        input: productName ? `${productName}: ${input}` : input,
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

  const handleManualSubmit = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setResult(null);
    try {
      const apiResult = await analyzeIngredients(inputText, productName);
      setResult(apiResult);
      if (!(apiResult as any).error) {
        saveToHistory(inputText, apiResult);
        toast.success(t('auditComplete'));
      } else {
        toast.error(t('auditFailed'));
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        setImagePreview(reader.result as string);
        setIsLoading(true);
        setResult(null);
        try {
          const apiResult = await analyzeImageIngredients(base64String, file.type);
          setResult(apiResult);
          if (!(apiResult as any).error) {
            saveToHistory('Image Scan', apiResult);
            toast.success(t('auditComplete'));
          } else {
            toast.error(t('scanFailed'));
          }
        } catch (error) {
          toast.error('Scan failed. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearInputs = () => {
    setProductName('');
    setInputText('');
    setResult(null);
    setImagePreview(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-3 pb-10">
      {/* Header Section */}
      <div className="text-center pt-0">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-1">
          {t('productAuditTitle')}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium text-xs md:text-sm leading-tight">
          {t('productAuditSubtitle')}
        </p>
      </div>
      
      {/* Main Analysis Card */}
      <div className="relative group/card">
        {/* Decorative background glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-[3rem] blur opacity-5 group-hover/card:opacity-10 transition duration-1000"></div>
        
        <motion.div 
          layout
          className="relative bg-white dark:bg-gray-950 p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden"
        >
          {/* Card Header with Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Audit Engine</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Ready for Analysis</p>
              </div>
            </div>

            {/* Compact Mode Toggle */}
            <div className="bg-green-50/50 dark:bg-gray-900 p-1 rounded-2xl flex items-center border border-green-100 dark:border-gray-800 shadow-inner relative overflow-hidden h-10">
              <motion.div
                animate={{ x: activeTab === 'manual' ? 0 : '100%' }}
                className={`absolute left-1 top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-green-600 dark:bg-gradient-to-r dark:from-green-600 dark:to-emerald-600 rounded-xl shadow-lg z-0`}
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
              />
              
              <button
                onClick={() => { setActiveTab('manual'); clearInputs(); }}
                className={`relative z-10 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors duration-300 w-28 ${
                  activeTab === 'manual' ? 'text-white' : 'text-green-700/60 hover:text-green-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {t('manualInput')}
              </button>
              
              <button
                onClick={() => { setActiveTab('ocr'); clearInputs(); }}
                className={`relative z-10 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors duration-300 w-28 ${
                  activeTab === 'ocr' ? 'text-white' : 'text-green-700/60 hover:text-green-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {t('scanLabel')}
              </button>
            </div>
          </div>

          {/* Subtle background texture/gradient */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
          
          <AnimatePresence mode="wait">
            {activeTab === 'manual' ? (
              <motion.div 
                key="manual-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {/* Product Name Input */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-2">
                        <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <ProductIcon className="w-3 h-3" />
                          {t('productName')}
                        </label>
                      </div>
                      <div className="relative group">
                        <input
                          id="product-name"
                          type="text"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          placeholder={t('productPlaceholder')}
                          className="w-full px-6 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900/50 focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 outline-none transition-all font-bold text-gray-900 dark:text-white shadow-inner"
                        />
                         <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                           <Search className="w-4 h-4 text-green-500" />
                         </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50/50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-800/30">
                       <div className="flex gap-2">
                          <Info className="w-4 h-4 text-green-600 dark:text-green-500 shrink-0" />
                          <div>
                             <p className="text-[10px] font-black text-green-800 dark:text-green-400 uppercase tracking-tighter mb-0.5">Audit Tips</p>
                             <p className="text-[11px] text-green-700/70 dark:text-green-400/60 font-medium leading-tight">Focus on chemical names like "Emulsifier", "Gelatin", or specific E-Codes.</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Ingredients Textarea */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest px-2">
                      {t('ingredientsList')}
                    </label>
                    <div className="relative">
                      <textarea
                        id="ingredients-text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={t('ingredientsPlaceholder')}
                        className="w-full h-56 px-7 py-5 border border-gray-100 dark:border-gray-800 rounded-[2rem] bg-gray-50 dark:bg-gray-900/50 focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 outline-none transition-all resize-none text-base font-bold text-gray-900 dark:text-white shadow-inner"
                      />
                      {inputText && (
                         <div className="absolute bottom-6 right-8">
                           <CheckCircle2 className="w-6 h-6 text-green-500" />
                         </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleManualSubmit}
                    disabled={isLoading || !inputText.trim()}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    className="group relative w-full h-20 bg-green-600 dark:bg-gradient-to-r dark:from-green-600 dark:to-emerald-600 text-white rounded-[2rem] overflow-hidden shadow-[0_20px_40px_rgba(22,163,74,0.3)] transition-all duration-300 disabled:opacity-30 disabled:shadow-none hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-4 border border-green-500/20"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-4">
                      {isLoading ? (
                         <>
                           <RefreshCw className="w-6 h-6 animate-spin" />
                           <span className="text-sm font-black uppercase tracking-[0.3em]">{t('analyzing')}</span>
                         </>
                      ) : (
                         <>
                           <Zap className={`w-6 h-6 transition-transform duration-500 ${isHovering ? 'scale-125' : ''}`} />
                           <span className="text-sm font-black uppercase tracking-[0.3em]">{t('startAnalysis')}</span>
                         </>
                      )}
                    </div>
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="ocr-scanner"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-12">
                    <div 
                      onClick={() => !isLoading && fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem] p-8 md:p-12 cursor-pointer hover:border-green-500/50 transition-all group/scanner overflow-hidden ${isLoading ? 'pointer-events-none' : ''}`}
                    >
                      {/* Scanning Line Animation */}
                      {isLoading && (
                         <motion.div 
                           className="absolute left-0 w-full h-1 bg-green-500/50 z-20"
                           animate={{ top: ['0%', '100%', '0%'] }}
                           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                         />
                      )}
                      
                      <div className="relative z-10 text-center flex flex-col items-center">
                        <div className="bg-green-100 dark:bg-green-600/10 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover/scanner:scale-110 transition-transform shadow-2xl shadow-green-600/10 border border-green-500/20">
                          <CameraIcon className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
                          {isLoading ? t('processingImage') : t('clickToScan')}
                        </h3>
                        <p className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                           {t('scanInstructions')}
                        </p>
                      </div>

                      {/* Corner Accents */}
                      <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-green-500/30 rounded-tl-2xl group-hover/scanner:border-green-500 transition-colors" />
                      <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-green-500/30 rounded-tr-2xl group-hover/scanner:border-green-500 transition-colors" />
                      <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-green-500/30 rounded-bl-2xl group-hover/scanner:border-green-500 transition-colors" />
                      <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-green-500/30 rounded-br-2xl group-hover/scanner:border-green-500 transition-colors" />
                    </div>
                  </div>

                  {imagePreview && (
                    <div className="lg:col-span-12">
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden relative shadow-sm">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          {isLoading && (
                            <div className="absolute inset-0 bg-white/60 dark:bg-gray-950/60 flex items-center justify-center">
                              <Spinner />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Preview Status</p>
                          <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">Image Loaded Successfully</p>
                        </div>
                        <button 
                          onClick={() => setImagePreview(null)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Result Section */}
      <div className="mt-8">
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex items-center justify-center gap-3 mb-8">
                 <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1" />
                 <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.4em]">Audit Findings</span>
                 <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1" />
              </div>
              <AuditResultDisplay result={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductAuditScreen;
