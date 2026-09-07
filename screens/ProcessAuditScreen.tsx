
import React, { useState, useRef, useEffect } from 'react';
import { PROCESS_AUDIT_QUESTIONS } from '../constants';
import { analyzeProcess, analyzeProcessFromDocument } from '../services/geminiService';
import type { AuditResult } from '../types';
import Spinner from '../components/Spinner';
import AuditResultDisplay from '../components/AuditResult';
import { CameraIcon, IngredientIcon, FacilityIcon, ProcessIcon as ProcessCategoryIcon, UserIcon, TransportIcon } from '../components/Icons';
import { storage } from '../services/storage';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';
import { Zap, Upload, FileText, CheckCircle, Shield, Download, Trash2, ArrowRight, RefreshCw, Sparkles, ChevronRight, List as ListChecks, X, RotateCcw } from 'lucide-react';
import { useScroll, useTransform } from 'motion/react';

// Declare libraries loaded from CDN in index.html
declare const html2canvas: any;
declare const jspdf: any;

type Answers = Record<string, string>;

const CategoryIcon: React.FC<{ category: string; className?: string }> = ({ category, className }) => {
  const iconProps = { className: className || "w-6 h-6" };
  switch (category) {
    case 'Bahan (Ingredients)':
      return <IngredientIcon {...iconProps} />;
    case 'Fasilitas Produksi':
      return <FacilityIcon {...iconProps} />;
    case 'Proses Produksi':
      return <ProcessCategoryIcon {...iconProps} />;
    case 'Pekerja':
      return <UserIcon {...iconProps} />;
    case 'Penyimpanan & Transportasi':
      return <TransportIcon {...iconProps} />;
    default:
      return <FileText {...iconProps} />;
  }
};

const ProcessAuditScreen: React.FC = () => {
  const { t } = useLanguage();
  const [answers, setAnswers] = useState<Answers>(() => {
    // Try to load from "auto-save" (session storage or just local state if refreshing is an issue)
    const saved = localStorage.getItem('halal_process_audit_answers');
    return saved ? JSON.parse(saved) : {};
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Scroll logic for compact progress bar
  const { scrollY } = useScroll();
  const progressScale = useTransform(scrollY, [0, 100], [1, 0.8]);
  const progressTranslateY = useTransform(scrollY, [0, 100], [0, -10]);
  const isCompact = useRef(false);

  // Track scroll to simplify progress bar
  const [scrollYValue, setScrollYValue] = useState(0);
  useEffect(() => {
    return scrollY.on("change", (latest) => setScrollYValue(latest));
  }, [scrollY]);

  const showCompact = scrollYValue > 150;

  // Auto-save simulation
  useEffect(() => {
    localStorage.setItem('halal_process_audit_answers', JSON.stringify(answers));
  }, [answers]);

  const saveToHistory = (input: string, output: any) => {
    const user = storage.getUser();
    if (user) {
      storage.addHistory({
        id: `h-${Date.now()}`,
        userId: user.id,
        type: 'process',
        input,
        output,
        timestamp: new Date().toISOString(),
      });
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

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const clearAnswer = (questionId: string) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      return newAnswers;
    });
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | undefined;
    if ('files' in event.target && event.target.files) {
      file = event.target.files[0];
    } else if ('dataTransfer' in event) {
      event.preventDefault();
      file = event.dataTransfer.files[0];
      setIsDragging(false);
    }

    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        setImagePreview(reader.result as string);
        setIsExtracting(true);
        setResult(null);
        
        try {
          const apiResult = await analyzeProcessFromDocument(base64String, file!.type, PROCESS_AUDIT_QUESTIONS);
          if ('error' in apiResult) {
              toast.error(`OCR Error: ${apiResult.error}`);
          } else {
              setAnswers(prev => ({ ...prev, ...apiResult }));
              toast.success(t('prefilledNotification'));
          }
        } catch (error) {
          toast.error("Failed to process document.");
        } finally {
          setIsExtracting(false);
        }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== PROCESS_AUDIT_QUESTIONS.length) {
      toast.error('Please answer all questions before submitting.');
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const apiResult = await analyzeProcess(answers);
      setResult(apiResult);
      if (!(apiResult as any).error) {
        saveToHistory('Process Checklist Audit', apiResult);
        toast.success(t('auditComplete'));
        // Optional: clear auto-save on success
        localStorage.removeItem('halal_process_audit_answers');
      } else {
        toast.error(t('auditFailed'));
      }
    } catch (error) {
      toast.error("Audit failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!result || typeof result === 'string' || !('assessment' in result) || !resultRef.current) {
        toast.error(t('noValidExport'));
        return;
    }
    setIsExporting(true);

    try {
        const { jsPDF } = jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 15;
        let y = margin;

        pdf.setFontSize(20).setFont(undefined, 'bold');
        pdf.text("Halal Process Audit Report", pageWidth / 2, y, { align: 'center' });
        y += 15;

        pdf.setFontSize(10).setFont(undefined, 'normal');
        pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
        y += 10;
        
        const canvas = await html2canvas(resultRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
        pdf.save('halal-process-audit.pdf');
        toast.success('Report exported!');
    } catch (error) {
        toast.error("Export failed.");
    } finally {
        setIsExporting(false);
    }
  };

  const groupedQuestions = PROCESS_AUDIT_QUESTIONS.reduce((acc, q) => {
    (acc[q.category] = acc[q.category] || []).push(q);
    return acc;
  }, {} as Record<string, typeof PROCESS_AUDIT_QUESTIONS>);

  const completedCount = Object.keys(answers).length;
  const totalCount = PROCESS_AUDIT_QUESTIONS.length;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="text-center space-y-4 pt-8 px-4">
        <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-4">
          {t('processAuditTitle')}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium text-sm md:text-lg">
          {t('processAuditSubtitle')}
        </p>
      </div>

      {/* OCR Section - Dropzone Style */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-5 group-hover:opacity-10 transition duration-1000"></div>
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleImageChange}
          className={`relative bg-white dark:bg-gray-950 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed transition-all duration-300 ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-800'}`}
        >
          <div className="flex flex-col items-center text-center space-y-6">
            <div className={`w-20 md:w-28 h-20 md:h-28 rounded-[1.5rem] md:rounded-[2.5rem] bg-blue-500/10 flex items-center justify-center transition-all duration-500 border border-blue-500/20 relative overflow-hidden ${isExtracting ? 'animate-pulse' : 'group-hover:scale-110 shadow-2xl shadow-blue-500/20'}`}>
              <div className="absolute inset-0 bg-blue-500/5 blur-2xl" />
              <Upload className={`w-8 md:w-12 h-8 md:h-12 relative z-10 transition-colors ${isDragging ? 'text-blue-500' : 'text-gray-400 dark:text-gray-600'}`} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('automateWithAi')}</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-xs md:text-base max-w-lg">
                Drag & Drop or Upload documents (Procedure Guides, Certificates) to pre-fill the checklist automatically.
              </p>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="hidden"
            />
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting}
                className="inline-flex items-center justify-center bg-blue-600 text-white font-black py-4 px-10 rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl shadow-blue-600/20 uppercase tracking-widest text-xs"
              >
                {isExtracting ? (
                  <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                ) : (
                  <CameraIcon className="w-5 h-5 mr-3" />
                )}
                {isExtracting ? t('readingDocument') : t('scanUploadDoc')}
              </button>
              
              {imagePreview && !isExtracting && (
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                  <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover rounded-xl border border-white dark:border-gray-800" />
                  <button onClick={() => setImagePreview(null)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {isExtracting && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-10 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Spinner />
                    <span className="text-blue-700 dark:text-blue-400 font-black uppercase tracking-widest text-[10px]">{t('extractingInfo')}</span>
                  </div>
                  <span className="text-blue-700 dark:text-blue-400 font-black text-xs animate-pulse">Analyzing...</span>
                </div>
                <div className="w-full h-1.5 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5 }}
                    className="h-full bg-blue-600"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="sticky top-28 z-30 flex justify-center pointer-events-none">
        <motion.div 
          style={{ scale: progressScale, y: progressTranslateY }}
          className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl flex items-center transition-all duration-300 pointer-events-auto ${showCompact ? 'px-6 py-2 gap-4' : 'px-8 py-4 gap-6'}`}
        >
          <div className="flex flex-col">
            {!showCompact && <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{t('progress')}</span>}
            <span className={`${showCompact ? 'text-sm' : 'text-lg'} font-black text-gray-900 dark:text-white leading-none mt-1`}>{completedCount} <span className="text-gray-400">/ {totalCount}</span></span>
          </div>
          <div className={`${showCompact ? 'w-24 h-1.5' : 'w-32 h-2'} bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner`}>
            <motion.div 
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all"
            />
          </div>
          {completedCount === totalCount && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-green-500 text-white p-1 rounded-full shadow-lg shadow-green-500/50 scale-100">
              <CheckCircle className="w-4 h-4" />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Checklist Sections */}
      <div className="space-y-16">
        {Object.entries(groupedQuestions).map(([category, questions], groupIdx) => (
          <div key={category} className="space-y-8">
            <div className="flex items-center gap-4 px-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-500/20 text-green-600">
                <CategoryIcon category={category} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{category}</h3>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Section {groupIdx + 1}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {questions.map((q, idx) => {
                const isSelected = answers[q.id] !== undefined;
                return (
                  <motion.div 
                    key={q.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className={`group relative p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-2 transition-all duration-500 ${isSelected ? 'bg-white dark:bg-gray-900 border-green-500/30' : 'bg-white dark:bg-gray-900/40 border-gray-200 dark:border-white/5'} shadow-xl hover:shadow-2xl hover:scale-[1.01]`}
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                      <div className="flex items-start gap-5 flex-1">
                        <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all duration-500 shadow-sm ${isSelected ? 'bg-green-600 text-white shadow-green-600/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-white/5'}`}>
                          {idx + 1}
                        </div>
                        <div className="space-y-1">
                          <p className={`text-base md:text-lg font-black leading-tight uppercase tracking-tight transition-colors duration-300 ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                            {q.text}
                          </p>
                          {isSelected && (
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="flex items-center gap-1 text-[9px] font-black text-green-500 uppercase tracking-widest animate-in fade-in slide-in-from-left-2">
                                <Shield className="w-3 h-3" /> Answer Captured
                              </div>
                              <button 
                                onClick={() => clearAnswer(q.id)}
                                className="flex items-center gap-1 text-[9px] font-black text-red-500 hover:text-red-600 dark:text-red-400 uppercase tracking-widest transition-colors"
                              >
                                <RotateCcw className="w-2.5 h-2.5" /> Reset Jawaban
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
 
                      {/* Segmented Control Selector */}
                      <div className="bg-gray-100 dark:bg-gray-950 p-1 rounded-2xl md:p-1.5 md:rounded-3xl flex items-center border border-gray-200 dark:border-white/5 shadow-inner h-12 md:h-14 shrink-0 relative overflow-hidden group-hover:border-gray-300 dark:group-hover:border-white/10 transition-colors">
                        {['Yes', 'No', 'N/A'].map((option) => {
                          const isActive = answers[q.id] === option;
                          let activeColor = 'bg-gray-400';
                          if (option === 'Yes') activeColor = 'bg-green-500';
                          if (option === 'No') activeColor = 'bg-red-500';
 
                          return (
                            <button
                              key={option}
                              onClick={() => handleAnswerChange(q.id, option)}
                              className={`relative z-10 px-4 md:px-8 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 w-24 md:w-28 ${
                                isActive ? 'text-white shadow-xl scale-100 ring-2 ring-white/20' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-105'
                              } ${isActive ? activeColor : ''} active:scale-90`}
                            >
                              {option === 'Yes' ? t('yes') : option === 'No' ? t('no') : t('na')}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute top-6 right-8">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle className="w-5 h-5 text-green-500 opacity-20" />
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="pt-10 flex flex-col md:flex-row gap-6 px-4 md:px-0">
        <button
          onClick={handleSubmit}
          disabled={isLoading || completedCount < totalCount}
          className="group relative flex-grow h-20 bg-green-500 hover:bg-green-600 text-white rounded-[2rem] overflow-hidden shadow-[0_20px_40px_rgba(34,197,94,0.3)] transition-all duration-300 disabled:opacity-30 disabled:shadow-none hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-4 border border-white/20"
        >
          <div className="relative z-10 flex items-center justify-center gap-4">
            {isLoading ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin text-white" />
                <span className="text-sm font-black uppercase tracking-[0.3em]">Analyzing with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 animate-pulse" />
                <span className="text-sm font-black uppercase tracking-[0.3em]">{t('submitForAi')}</span>
              </>
            )}
          </div>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {result && !isLoading && typeof result !== 'string' && 'assessment' in result && (
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="h-20 px-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-black dark:hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95"
          >
            {isExporting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {t('exportPdf')}
          </button>
        )}
      </div>

      {/* Results Section */}
      <div className="mt-16">
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 space-y-8"
            >
              <div className="relative">
                <div className="w-24 h-24 border-b-4 border-green-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-green-500 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-gray-900 dark:text-white font-black uppercase tracking-widest leading-none">AI Auditor is Scanning</p>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">{t('analysingProcess')}</p>
              </div>
            </motion.div>
          )}

          {result && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              ref={resultRef}
              className="space-y-8"
            >
              <div className="flex items-center justify-center gap-4">
                <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Audit Assessment Result</span>
                <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1" />
              </div>
              <AuditResultDisplay result={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProcessAuditScreen;
