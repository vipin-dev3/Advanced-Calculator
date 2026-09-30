import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Download, Search, FileSpreadsheet, FileCode, History as HistoryIcon } from 'lucide-react';
import { useHistory } from '../../context/HistoryContext';
import { HistoryItem } from './HistoryItem';
import { exportHistoryAsCSV, exportHistoryAsJSON } from '../../utils/exportHelper';
import { useToast } from '../../context/ToastContext';
import { CalculatorMode } from '../../types/calculator';

export const HistoryDrawer: React.FC = () => {
  const { history, isDrawerOpen, setIsDrawerOpen, clearHistory, removeHistoryItem, recallToCurrent } = useHistory();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | CalculatorMode>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.expression.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.result.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || item.mode === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleExportCSV = () => {
    if (!history.length) {
      showToast('No history to export', 'info');
      return;
    }
    exportHistoryAsCSV(filteredHistory.length ? filteredHistory : history);
    showToast('Exported history as CSV', 'success');
  };

  const handleExportJSON = () => {
    if (!history.length) {
      showToast('No history to export', 'info');
      return;
    }
    exportHistoryAsJSON(filteredHistory.length ? filteredHistory : history);
    showToast('Exported history as JSON', 'success');
  };

  const handleClear = () => {
    clearHistory();
    setShowClearConfirm(false);
    showToast('Calculation history cleared', 'info');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Sidebar */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-slate-900/95 border-l border-slate-700/60 shadow-2xl flex flex-col backdrop-blur-xl"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-700/50">
              <div className="flex items-center gap-2 text-white font-semibold text-lg">
                <HistoryIcon className="w-5 h-5 text-indigo-400" />
                <span>Calculation History</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {history.length}
                </span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Mode Filters */}
            <div className="p-4 space-y-3 border-b border-slate-800/80 bg-slate-900/40">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search calculations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 text-xs">
                {(['all', 'scientific', 'programmer', 'financial', 'converter', 'graphing'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedFilter(mode)}
                    className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition-colors ${
                      selectedFilter === mode
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <HistoryItem
                    key={item.id}
                    item={item}
                    onRecall={recallToCurrent}
                    onDelete={removeHistoryItem}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 space-y-2">
                  <HistoryIcon className="w-10 h-10 stroke-1 opacity-40 text-slate-500" />
                  <p className="text-sm font-medium">No calculations recorded yet</p>
                  <p className="text-xs text-slate-500">
                    Equations you calculate will appear here for instant recall
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  disabled={!history.length}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 disabled:opacity-40 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  disabled={!history.length}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 disabled:opacity-40 transition-colors"
                >
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  <span>Export JSON</span>
                </button>
              </div>

              {showClearConfirm ? (
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">
                  <span>Clear all history?</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={handleClear}
                      className="px-2.5 py-1 rounded bg-rose-600 text-white font-medium hover:bg-rose-700"
                    >
                      Yes, Clear
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-2.5 py-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  disabled={!history.length}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 disabled:opacity-30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All History</span>
                </button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
