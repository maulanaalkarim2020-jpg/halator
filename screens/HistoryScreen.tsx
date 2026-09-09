import React, { useState, useMemo } from 'react';
import { storage } from '../services/storage';
import { ProductIcon, ProcessIcon, TransactionIcon } from '../components/Icons';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import AuditResultDisplay from '../components/AuditResult';
import { useLanguage } from '../hooks/useLanguage';
import { 
  Search, 
  Trash2, 
  History as HistoryIcon, 
  Calendar, 
  Tag, 
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface HistoryScreenProps {
  selectedId?: string | null;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ selectedId }) => {
  const { t } = useLanguage();
  const [history, setHistory] = useState(storage.getHistory());
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  React.useEffect(() => {
    storage.syncHistoryWithBackend().then((synced) => {
      setHistory(synced);
    });
  }, []);

  React.useEffect(() => {
    if (selectedId) {
      const item = history.find(h => h.id === selectedId);
      if (item) {
        setSelectedItem(item);
      }
    }
  }, [selectedId, history]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(id);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      storage.deleteHistory(itemToDelete);
      setHistory(storage.getHistory());
      toast.success(t('auditDeleted'));
      if (selectedItem?.id === itemToDelete) setSelectedItem(null);
      setItemToDelete(null);
    }
  };

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesSearch = item.input.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || item.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [history, searchTerm, filterType]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'product': return <ProductIcon className="w-5 h-5" />;
      case 'process': return <ProcessIcon className="w-5 h-5" />;
      case 'transaction': return <TransactionIcon className="w-5 h-5" />;
      default: return <HistoryIcon className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (output: any) => {
    // Basic logic to determine status from output
    const isSafe = output?.verdict?.toLowerCase().includes('halal') || output?.compliance_status?.toLowerCase().includes('compliant');
    const isWarning = output?.verdict?.toLowerCase().includes('doubtful') || output?.verdict?.toLowerCase().includes('mashbooh') || output?.compliance_status?.toLowerCase().includes('warning');
    
    if (isSafe) return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[9px] font-black uppercase tracking-widest border border-green-500/20">
        <CheckCircle className="w-2.5 h-2.5" />
        {t('statusSafe')}
      </span>
    );
    if (isWarning) return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[9px] font-black uppercase tracking-widest border border-yellow-500/20">
        <AlertTriangle className="w-2.5 h-2.5" />
        {t('statusWarning')}
      </span>
    );
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[9px] font-black uppercase tracking-widest border border-red-500/20">
        <XCircle className="w-2.5 h-2.5" />
        {t('statusDanger')}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
             <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-600/20">
                <HistoryIcon className="w-6 h-6 text-white" />
             </div>
             <div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{t('auditHistory')}</h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-xs md:text-sm mt-1">{t('auditHistorySubtitle')}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-4 md:px-0">
        {/* Sidebar: Filters & List */}
        <div className={`lg:col-span-4 space-y-6 ${selectedItem ? 'hidden lg:block' : 'block'}`}>
          {/* Search & Filters Card */}
          <div className="bg-white dark:bg-gray-950 p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-[0_20px_40px_rgba(0,0,0,0.03)] space-y-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
              <input 
                type="text"
                placeholder={t('searchHistory')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all font-bold text-sm text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['all', 'product', 'process', 'transaction'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                    filterType === type 
                      ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-600/20' 
                      : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-100 dark:border-gray-800 hover:border-green-500/50'
                  }`}
                >
                  {type === 'all' ? t('categoryAll') : t(type === 'product' ? 'productAudit' : type === 'process' ? 'processAudit' : 'transactionAudit')}
                </button>
              ))}
            </div>
          </div>

          {/* List Card */}
          <div className="relative bg-white dark:bg-gray-950 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-[0_20px_40px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-3 space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredHistory.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 px-6"
                  >
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-gray-300 dark:text-gray-700" />
                    </div>
                    <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">{t('noHistory')}</p>
                  </motion.div>
                ) : (
                  filteredHistory.map((item) => (
                    <motion.div
                      key={item.id}
                      layoutId={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setSelectedItem(item)}
                      className={`group relative p-5 rounded-3xl border transition-all duration-300 cursor-pointer ${
                        selectedItem?.id === item.id
                          ? 'bg-green-50 dark:bg-green-900/10 border-green-500 shadow-lg shadow-green-600/10 scale-[1.02]'
                          : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-green-500/30'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div className={`p-2 rounded-xl border ${
                          item.type === 'product' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500/20 text-blue-600' :
                          item.type === 'process' ? 'bg-green-50 dark:bg-green-900/20 border-green-500/20 text-green-600' :
                          'bg-purple-50 dark:bg-purple-900/20 border-purple-500/20 text-purple-600'
                        }`}>
                          {getIcon(item.type)}
                        </div>
                        <button 
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-2 text-gray-300 dark:text-gray-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <h4 className={`font-black text-sm uppercase tracking-tight line-clamp-1 ${
                          selectedItem?.id === item.id ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {item.input}
                        </h4>
                        <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                          <span className="flex items-center gap-1">
                             <Tag className="w-2.5 h-2.5" />
                             {item.type}
                          </span>
                          <span className="flex items-center gap-1">
                             <Calendar className="w-2.5 h-2.5" />
                             {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="absolute right-4 bottom-4">
                         <ChevronRight className={`w-4 h-4 transition-transform ${selectedItem?.id === item.id ? 'translate-x-1 text-green-500' : 'text-gray-200 dark:text-gray-800'}`} />
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Main Content: Viewer */}
        <div className={`lg:col-span-8 ${selectedItem ? 'block' : 'hidden lg:block'}`}>
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div
                key={selectedItem.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Back button for mobile */}
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="lg:hidden flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-green-600 transition-colors mb-2"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  {t('batal')}
                </button>

                {/* Result Header Card */}
                <div className="relative bg-white dark:bg-gray-950 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-[0_20px_40px_rgba(0,0,0,0.03)] overflow-hidden">
                   <div className="absolute top-0 right-0 p-5 md:p-8">
                      {getStatusBadge(selectedItem.output)}
                   </div>
                   
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-[0.2em]">
                         <Calendar className="w-3 h-3" />
                         {new Date(selectedItem.timestamp).toLocaleString()}
                      </div>
                      <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('originalInput')}</h3>
                      <p className="text-lg md:text-2xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                         "{selectedItem.input}"
                      </p>
                   </div>
                </div>

                {/* Audit Result Component */}
                <div className="bg-white dark:bg-gray-950 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-[0_20px_40px_rgba(0,0,0,0.03)] overflow-hidden">
                   <AuditResultDisplay result={selectedItem.output} />
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-20 bg-gray-50 dark:bg-gray-900/30 rounded-[4rem] border-2 border-dashed border-gray-100 dark:border-gray-800 min-h-[60vh]">
                <div className="relative mb-8">
                   <div className="w-24 h-24 bg-white dark:bg-gray-950 rounded-[2.5rem] shadow-2xl flex items-center justify-center border border-gray-100 dark:border-gray-800">
                      <HistoryIcon className="w-10 h-10 text-green-600" />
                   </div>
                   <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <ChevronRight className="w-5 h-5" />
                   </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">{t('selectAudit')}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-center max-w-sm">{t('selectAuditSubtitle')}</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-gray-950 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('deleteHistory')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  {t('deleteAuditConfirm')}
                </p>
                <div className="pt-6 grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setItemToDelete(null)}
                    className="w-full py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
                  >
                    {t('batal')}
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="w-full py-4 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95"
                  >
                    {t('hapus')}
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

export default HistoryScreen;
