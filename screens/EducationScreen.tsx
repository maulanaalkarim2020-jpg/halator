import React, { useState, useMemo } from 'react';
import { getEducationInfo } from '../services/geminiService';
import type { AuditResult } from '../types';
import Spinner from '../components/Spinner';
import AuditResultDisplay from '../components/AuditResult';
import { storage } from '../services/storage';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';
import { 
  Search, 
  BookOpen, 
  Search as SearchIcon, 
  Lightbulb, 
  ChevronRight, 
  Tag, 
  ArrowRight,
  Info,
  Layers,
  Sparkles,
  PlayCircle,
  X
} from 'lucide-react';

const EducationScreen: React.FC = () => {
  const { language, t } = useLanguage();

  const categories = [
    { id: 'all', name: t('categoryAll'), icon: Layers },
    { id: 'ingredients', name: t('categoryIngredients'), icon: Tag },
    { id: 'business', name: t('categoryBusiness'), icon: Info },
    { id: 'workflow', name: t('categoryWorkflow'), icon: Sparkles },
  ];

  const articles = [
    {
      id: 1,
      title: language === 'id' ? 'Panduan Memahami E-Number Halal' : 'Guide to Understanding Halal E-Numbers',
      description: language === 'id' ? 'Pelajari cara mengidentifikasi bahan tambahan makanan melalui kode E-Number yang sering kita jumpai. E-Number adalah kode referensi internasional untuk bahan tambahan makanan yang telah disetujui untuk digunakan. Namun, tidak semua E-Number berasal dari sumber yang halal.' : 'Learn how to identify food additives through E-Number codes often found on products. E-numbers are international reference codes for food additives that have been approved for use. However, not all E-numbers come from halal sources.',
      category: 'ingredients',
      tag: 'Ingredients',
      image: 'https://picsum.photos/seed/halal1/800/600',
      content: language === 'id' ? t('ingredientsArticleContent') : t('ingredientsArticleContent')
    },
    {
      id: 2,
      title: language === 'id' ? 'Prinsip Dasar Ekonomi Syariah' : 'Basic Principles of Shariah Economics',
      description: language === 'id' ? 'Mengenal konsep Riba, Gharar, dan Maysir dalam transaksi keuangan modern. Ekonomi Syariah berorientasi pada keadilan dan keseimbangan sosial.' : 'Introduction to Riba, Gharar, and Maysir concepts in modern financial transactions. Shariah Economics is oriented towards justice and social balance.',
      category: 'business',
      tag: 'Business',
      image: 'https://picsum.photos/seed/halal2/800/600',
      content: language === 'id' ? t('businessArticleContent') : t('businessArticleContent')
    },
    {
      id: 3,
      title: language === 'id' ? 'Optimalisasi Alur Produksi Halal' : 'Optimizing Halal Production Workflow',
      description: language === 'id' ? 'Bagaimana menjaga integritas Halal dari bahan baku hingga produk jadi di tangan konsumen. Halal by design adalah kunci utama industri manufaktur.' : 'How to maintain Halal integrity from raw materials to finished products in the hands of consumers. Halal by design is the main key for the manufacturing industry.',
      category: 'workflow',
      tag: 'Workflow',
      image: 'https://picsum.photos/seed/halal3/800/600',
      content: language === 'id' ? t('workflowArticleContent') : t('workflowArticleContent')
    },
    {
      id: 4,
      title: language === 'id' ? 'Titik Kritis Bahan Hewani' : 'Critical Control Points for Animal-Based Ingredients',
      description: language === 'id' ? 'Memahami proses penyembelihan dan pengolahan gelatin yang sesuai standar Syariah. Mengapa asal-usul gelatin sangat krusial.' : 'Understanding the slaughtering process and gelatin processing that meet Shariah standards. Why the origin of gelatin is very crucial.',
      category: 'ingredients',
      tag: 'Ingredients',
      image: 'https://picsum.photos/seed/halal4/800/600',
      content: language === 'id' ? t('animalArticleContent') : t('animalArticleContent')
    }
  ];

  const suggestedTerms = [
    { term: 'Gelatin', reference: language === 'id' ? 'Dari kolagen hewan' : 'From animal collagen' },
    { term: 'Carmine', reference: language === 'id' ? 'E120, dari serangga cochineal' : 'E120, from cochineal insects' },
    { term: 'Glycerin', reference: language === 'id' ? 'E422, dari lemak hewan atau nabati' : 'E422, from animal fat or vegetable oil' },
    { term: 'L-cysteine', reference: language === 'id' ? 'E920, sering dari bulu atau rambut' : 'E920, often from human hair or feathers' },
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const faqs = storage.getFAQs();

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const performSearch = async (term: string, reference?: string) => {
    if (!term.trim()) return;
    setSearchTerm(term);
    setIsLoading(true);
    setResult(null);
    try {
      const apiResult = await getEducationInfo(term, reference);
      setResult(apiResult);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-20">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] md:rounded-[4rem] bg-gray-100 dark:bg-gray-900 p-8 md:p-20 border border-gray-200 dark:border-gray-800 shadow-2xl shadow-black/5 dark:shadow-green-900/10 transition-all duration-500">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/[0.03] dark:bg-green-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/[0.03] dark:bg-emerald-500/10 rounded-full blur-3xl -ml-16 -mb-16" />
        
        <div className="relative max-w-2xl space-y-8">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 dark:bg-green-500/20 border border-green-500/20 dark:border-green-500/30 text-green-600 dark:text-green-400 text-[9px] font-black uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="w-2.5 h-2.5" />
              Knowledge Hub
           </div>
           <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
              {t('educationTitle')}
           </h2>
           <p className="text-sm md:text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              {t('educationSubtitle')}
           </p>

           <form onSubmit={handleFormSubmit} className="relative group max-w-md">
              <div className="absolute inset-0 bg-green-500/5 dark:bg-green-500/20 blur-xl rounded-[2rem] opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="relative w-full h-16 pl-14 pr-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-green-500/50 focus:text-gray-900 dark:focus:text-white transition-all font-bold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 group-focus-within:shadow-2xl shadow-sm"
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-green-600 transition-all" />
           </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Active Search Result */}
          <AnimatePresence>
            {isLoading || result ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-gray-950 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-[0_20px_40px_rgba(0,0,0,0.03)]"
                  >
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-6">
                      <Spinner />
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">{t('searchingDirectory')}</p>
                    </div>
                  ) : result && (
                    <AuditResultDisplay result={result} />
                  )}
               </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Directory Quick Search */}
          {!result && !isLoading && (
            <div className="space-y-6">
               <div className="flex items-center justify-between px-4">
                  <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('suggestedTopics')}</h3>
                  <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1 ml-6" />
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {suggestedTerms.map((item) => (
                    <button
                      key={item.term}
                      onClick={() => performSearch(item.term, item.reference)}
                      className="group p-6 bg-white dark:bg-gray-950 rounded-[2rem] border border-gray-100 dark:border-gray-800 text-left hover:border-green-500/50 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all shadow-sm flex items-center justify-between"
                    >
                      <div>
                        <strong className="font-black block text-sm text-gray-900 dark:text-white group-hover:text-green-600 transition-colors uppercase tracking-tight">{item.term}</strong>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">{item.reference}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-green-500 transition-colors" />
                    </button>
                  ))}
               </div>
            </div>
          )}

          {/* Categories & Articles Grid */}
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
               <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Articles & Resources</h3>
               </div>
               <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border flex items-center gap-2 ${
                        activeCategory === cat.id 
                          ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-950 dark:border-white shadow-lg' 
                          : 'bg-white dark:bg-gray-950 text-gray-500 border-gray-100 dark:border-gray-800 hover:border-green-500/50'
                      }`}
                    >
                      <cat.icon className="w-3 h-3" />
                      {cat.name}
                    </button>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <AnimatePresence mode="popLayout">
                 {filteredArticles.map((article) => (
                   <motion.div
                     key={article.id}
                     layout
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="group bg-white dark:bg-gray-950 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:shadow-xl hover:shadow-black/5 transition-all flex flex-col"
                   >
                     <div className="relative h-40 md:h-48 overflow-hidden">
                        <img 
                          src={article.image} 
                          alt={article.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                           <span className="px-3 py-1 rounded-full bg-green-500 text-white text-[9px] font-black uppercase tracking-widest border border-white/20">
                             {article.tag}
                           </span>
                        </div>
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl transform scale-0 group-hover:scale-100 transition-transform duration-500">
                              <PlayCircle className="w-6 h-6 text-green-600" />
                           </div>
                        </div>
                     </div>
                     <div className="p-6 md:p-8 space-y-3 flex-1 flex flex-col">
                        <h4 className="text-base md:text-lg font-black text-gray-900 dark:text-white leading-tight transition-colors group-hover:text-green-600">{article.title}</h4>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium line-clamp-3 leading-relaxed flex-1">
                           {article.description}
                        </p>
                        <div className="pt-4 flex items-center justify-between border-t border-gray-50 dark:border-gray-900">
                           <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{article.category}</span>
                           <button 
                             onClick={() => setSelectedArticle(article)}
                             className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-widest hover:gap-2 transition-all"
                           >
                              Read More <ArrowRight className="w-3 h-3" />
                           </button>
                        </div>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar Space */}
        <div className="lg:col-span-4 space-y-10">
           {/* Info Highlight Card */}
           <div className="bg-gray-900 dark:bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] text-white dark:text-gray-900 shadow-2xl shadow-black/20 group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Lightbulb className="w-16 md:w-20 h-16 md:h-20" />
             </div>
             <h3 className="text-xl md:text-2xl font-black mb-4 md:mb-6 uppercase tracking-tight flex items-center gap-2">
                <Lightbulb className="w-5 md:w-6 h-5 md:h-6 text-yellow-400" />
                {t('didYouKnow')}
             </h3>
             <p className="text-gray-400 dark:text-gray-500 text-xs md:text-sm leading-relaxed mb-6 md:mb-10 font-medium italic">
                "{t('didYouKnowText')}"
             </p>
             <button className="w-full bg-white/10 dark:bg-gray-100 text-white dark:text-gray-900 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-white/20 dark:hover:bg-gray-200 transition-all active:scale-95 border border-white/10 dark:border-gray-200">
               {t('readMoreArticles')}
             </button>
           </div>

           {/* FAQs Card */}
           <div className="bg-white dark:bg-gray-950 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-[0_20px_40px_rgba(0,0,0,0.03)] space-y-6 md:space-y-8">
             <div className="flex items-center justify-between">
                <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('faqs')}</h3>
                <div className="w-8 h-8 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center font-black text-[10px] text-gray-400">?</div>
             </div>
             <div className="space-y-6">
                {faqs.map((faq, i) => (
                  <div key={i} className="space-y-2 group cursor-pointer">
                    <h4 className="font-black text-xs text-gray-900 dark:text-white group-hover:text-green-600 transition-colors flex items-start gap-2">
                       <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1 shrink-0" />
                       {faq.question}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium pl-3.5">
                       {faq.answer}
                    </p>
                  </div>
                ))}
             </div>
           </div>

           {/* Regulations Mini Cards */}
           <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">{t('keyRegulations')}</h3>
              {[
                { title: 'HAS 23000', org: 'MUI, Indonesia' },
                { title: 'MS 1500:2019', org: 'JAKIM, Malaysia' },
                { title: 'OIC/SMIIC', org: 'Global' }
              ].map((reg, i) => (
                <div key={i} className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between group cursor-pointer hover:border-green-500/50 transition-all">
                   <div>
                      <h4 className="font-black text-sm text-gray-900 dark:text-white">{reg.title}</h4>
                      <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">{reg.org}</p>
                   </div>
                   <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-green-500 transition-colors" />
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedArticle(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-3xl bg-white dark:bg-gray-950 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              >
                 <div className="relative h-48 md:h-64 shrink-0">
                    <img 
                      src={selectedArticle.image} 
                      alt={selectedArticle.title} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
                       <div className="space-y-2">
                          <span className="px-3 py-1 rounded-full bg-green-500 text-white text-[9px] font-black uppercase tracking-widest">{selectedArticle.tag}</span>
                          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">{selectedArticle.title}</h3>
                       </div>
                    </div>
                    <button 
                      onClick={() => setSelectedArticle(null)}
                      className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all shadow-xl"
                    >
                       <X className="w-5 h-5" />
                    </button>
                 </div>
                 <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar space-y-6">
                    <p className="text-lg text-gray-900 dark:text-white font-black leading-tight border-l-4 border-green-500 pl-4">
                       {selectedArticle.description}
                    </p>
                    <div className="h-px bg-gray-100 dark:bg-gray-800" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed text-base">
                       {selectedArticle.content}
                    </p>
                    <div className="pt-6">
                       <button 
                         onClick={() => setSelectedArticle(null)}
                         className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                       >
                          Close Article
                       </button>
                    </div>
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EducationScreen;
