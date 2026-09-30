import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalculatorMode } from './types/calculator';
import { Header } from './components/layout/Header';
import { ModeNavigation } from './components/layout/ModeNavigation';
import { HistoryDrawer } from './components/history/HistoryDrawer';
import { ShortcutsModal } from './components/common/ShortcutsModal';
import { ScientificMode } from './components/modes/ScientificMode';
import { ProgrammerMode } from './components/modes/ProgrammerMode';
import { ConverterMode } from './components/modes/ConverterMode';
import { FinancialMode } from './components/modes/FinancialMode';
import { GraphingMode } from './components/modes/GraphingMode';
import { useHistory } from './context/HistoryContext';
import { Github, Heart, Sparkles } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<CalculatorMode>('scientific');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const { toggleDrawer } = useHistory();

  // Global hotkeys for mode switching and shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.altKey && e.key === '1') {
        e.preventDefault();
        setCurrentMode('scientific');
      } else if (e.altKey && e.key === '2') {
        e.preventDefault();
        setCurrentMode('programmer');
      } else if (e.altKey && e.key === '3') {
        e.preventDefault();
        setCurrentMode('converter');
      } else if (e.altKey && e.key === '4') {
        e.preventDefault();
        setCurrentMode('financial');
      } else if (e.altKey && e.key === '5') {
        e.preventDefault();
        setCurrentMode('graphing');
      } else if (e.altKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        toggleDrawer();
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [toggleDrawer]);

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header onOpenShortcuts={() => setIsShortcutsOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center py-4">
        {/* Mode Navigation Bar */}
        <ModeNavigation currentMode={currentMode} onModeChange={setCurrentMode} />

        {/* Animated Mode Transition Container */}
        <div className="w-full flex-1 flex flex-col justify-center my-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMode}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.99 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full flex justify-center"
            >
              {currentMode === 'scientific' && <ScientificMode />}
              {currentMode === 'programmer' && <ProgrammerMode />}
              {currentMode === 'converter' && <ConverterMode />}
              {currentMode === 'financial' && <FinancialMode />}
              {currentMode === 'graphing' && <GraphingMode />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* History Drawer */}
      <HistoryDrawer />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />

      {/* App Footer */}
      <footer className="w-full py-4 px-6 border-t border-slate-800/80 bg-slate-950/40 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">OmniCalc Pro</span>
          <span>•</span>
          <span>React + Vite + Math.js + Tailwind</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/vipin-dev3/Advanced-Calculator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>
          <span>•</span>
          <span className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> for precision
          </span>
        </div>
      </footer>
    </div>
  );
};

