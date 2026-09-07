import React from 'react';
import { AuditResult, IngredientAnalysis, ProcessAuditResult, TransactionAuditResult, EducationResult } from '../types';
import { motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, Info, ArrowRight, ShieldCheck, Fingerprint, Scale } from 'lucide-react';

interface AuditResultProps {
  result: AuditResult | null;
}

const getStatusTheme = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'halal' || s === 'compliant' || s === 'permissible' || s === 'sukses') {
    return {
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100/50 dark:bg-green-500/10',
      border: 'border-green-200 dark:border-green-500/20',
      icon: <CheckCircle2 className="w-5 h-5" />,
      glow: 'shadow-[0_0_20px_rgba(34,197,94,0.15)]'
    };
  }
  if (s === 'syubhat' || s === 'needs improvement' || s === 'doubtful' || s === 'peringatan') {
    return {
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100/50 dark:bg-amber-500/10',
      border: 'border-amber-200 dark:border-amber-500/20',
      icon: <AlertTriangle className="w-5 h-5" />,
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]'
    };
  }
  if (s === 'haram' || s === 'non-compliant' || s === 'impermissible' || s === 'bahaya') {
    return {
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100/50 dark:bg-red-500/10',
      border: 'border-red-200 dark:border-red-500/20',
      icon: <XCircle className="w-5 h-5" />,
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]'
    };
  }
  return {
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100/50 dark:bg-gray-500/10',
    border: 'border-gray-200 dark:border-gray-500/20',
    icon: <Info className="w-5 h-5" />,
    glow: ''
  };
};

const ProductResult: React.FC<{ data: IngredientAnalysis[] }> = ({ data }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 mb-2 px-2">
       <Fingerprint className="w-6 h-6 text-green-600" />
       <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Ingredient Analysis</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((item, index) => {
        const theme = getStatusTheme(item.status);
        return (
          <motion.div 
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-white dark:bg-gray-900 border ${theme.border} ${theme.glow} flex flex-col justify-between group hover:scale-[1.02] transition-all`}
          >
            <div className="flex justify-between items-start gap-4 mb-3">
              <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight">{item.ingredient}</h4>
              <div className={`shrink-0 p-2 rounded-xl ${theme.bg} ${theme.color}`}>
                {theme.icon}
              </div>
            </div>
            
            <div className="space-y-3">
               <div className="flex items-center gap-2">
                 <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${theme.bg} ${theme.color}`}>
                   {item.status}
                 </span>
               </div>
               {item.reason && (
                 <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed italic">
                   "{item.reason}"
                 </p>
               )}
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
);

const ProcessResult: React.FC<{ data: ProcessAuditResult }> = ({ data }) => {
  const theme = getStatusTheme(data.assessment);
  return (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2 px-2">
           <ShieldCheck className="w-6 h-6 text-green-600" />
           <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Process Audit Summary</h3>
        </div>
        <div className={`p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-white dark:bg-gray-900 border ${theme.border} ${theme.glow} space-y-6 md:space-y-8`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div className="text-center md:text-left">
                   <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Overall Assessment</p>
                   <h4 className={`text-2xl md:text-3xl font-black uppercase tracking-tight ${theme.color}`}>{data.assessment}</h4>
                </div>
                <div className={`p-4 rounded-xl md:rounded-2xl ${theme.bg} ${theme.color} mx-auto md:mx-0`}>
                   {theme.icon}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Summary Executive</h5>
                  <p className="text-gray-600 dark:text-gray-300 font-medium text-base md:text-lg leading-relaxed">{data.summary}</p>
              </div>
              
              {data.risks && data.risks.length > 0 && (
                  <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-red-500 uppercase tracking-widest px-1">Risk Assessment</h5>
                      <ul className="space-y-3">
                          {data.risks.map((risk, index) => (
                             <li key={index} className="flex gap-3 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                               <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0" />
                               <span className="text-sm font-medium">{risk}</span>
                             </li>
                          ))}
                      </ul>
                  </div>
              )}
            </div>
        </div>
    </div>
  );
};

const TransactionResult: React.FC<{ data: TransactionAuditResult }> = ({ data }) => {
  const theme = getStatusTheme(data.verdict);
  return (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2 px-2">
           <Scale className="w-6 h-6 text-green-600" />
           <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Transaction Analysis</h3>
        </div>
        <div className={`p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-white dark:bg-gray-900 border ${theme.border} ${theme.glow} space-y-6 md:space-y-8`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div className="text-center md:text-left">
                   <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Final Verdict</p>
                   <h4 className={`text-3xl md:text-4xl font-black uppercase tracking-tight ${theme.color}`}>{data.verdict}</h4>
                </div>
                <div className={`p-4 rounded-xl md:rounded-2xl ${theme.bg} ${theme.color} mx-auto md:mx-0`}>
                   {theme.icon}
                </div>
            </div>
            
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Riba', detected: data.analysis.riba, icon: '💰' },
                  { label: 'Gharar', detected: data.analysis.gharar, icon: '🌫️' },
                  { label: 'Maysir', detected: data.analysis.maysir, icon: '🎲' }
                ].map((item) => (
                  <div key={item.label} className={`p-5 md:p-6 rounded-2xl md:rounded-[2rem] border transition-all flex flex-col items-center gap-3 ${item.detected ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' : 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'}`}>
                    <span className="text-xl md:text-2xl">{item.icon}</span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.label}</p>
                    <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider ${item.detected ? 'text-red-500' : 'text-green-500'}`}>
                      {item.detected ? 'Detected' : 'Clean'}
                    </span>
                  </div>
                ))}
            </div>

            <div className="space-y-4 pt-4">
                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Compliance Explanation</h5>
                <div className="p-5 md:p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-inner">
                   <p className="text-gray-600 dark:text-gray-300 font-medium text-base md:text-lg leading-relaxed whitespace-pre-wrap">{data.explanation}</p>
                </div>
            </div>
        </div>
    </div>
  );
};

const EducationInfoResult: React.FC<{ data: EducationResult }> = ({ data }) => {
  const theme = getStatusTheme(data.status);
  return (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2 px-2">
           <Info className="w-6 h-6 text-green-600" />
           <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Halal Directory Info</h3>
        </div>
        <div className={`p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] bg-white dark:bg-gray-900 border ${theme.border} ${theme.glow} space-y-6 md:space-y-8`}>
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                <div className="space-y-1 text-center sm:text-left">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Term Identity</p>
                   <h4 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{data.term}</h4>
                </div>
                <div className={`px-5 md:px-6 py-2 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest ${theme.bg} ${theme.color}`}>
                   {data.status}
                </div>
            </div>
            
            <div className="p-5 md:p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-inner">
               <p className="text-gray-600 dark:text-gray-300 font-medium text-lg md:text-xl leading-relaxed italic text-center sm:text-left">"{data.explanation}"</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-between items-center">
               {data.reference && (
                 <div className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    <ShieldCheck className="w-4 h-4" />
                    Ref: {data.reference}
                 </div>
               )}
               {data.link && (
                 <a 
                    href={data.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-green-600/20 transition-all active:scale-95 group"
                 >
                    Learn More Insights
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                 </a>
               )}
            </div>
        </div>
    </div>
  );
};

const AuditResultDisplay: React.FC<AuditResultDisplayProps> = ({ result }) => {
  if (!result) return null;

  const renderContent = () => {
     if (typeof result === 'string') {
       return <p className="text-gray-500 font-medium text-center py-10">{result}</p>;
     }
     if ('error' in result) {
       return (
         <div className="p-8 bg-red-50 dark:bg-red-950/20 border-2 border-dashed border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-3xl text-center font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3">
           <XCircle className="w-6 h-6" />
           {result.error}
         </div>
       );
     }
     if (Array.isArray(result) && result.length > 0 && 'ingredient' in result[0]) {
       return <ProductResult data={result as IngredientAnalysis[]} />;
     }
     if ('assessment' in result) {
       return <ProcessResult data={result as ProcessAuditResult} />;
     }
     if ('verdict' in result) {
       return <TransactionResult data={result as TransactionAuditResult} />;
     }
     if ('term' in result) {
       return <EducationInfoResult data={result as EducationResult} />;
     }
     return <div className="p-10 text-center text-gray-400 font-black uppercase tracking-widest border border-dashed border-gray-200 dark:border-gray-800 rounded-[3rem]">No valid high-confidence data found</div>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto"
    >
       {renderContent()}
    </motion.div>
  );
};

interface AuditResultDisplayProps {
  result: AuditResult | null;
}

export default AuditResultDisplay;
