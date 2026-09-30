import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, Cpu, ArrowLeftRight, Landmark, LineChart } from 'lucide-react';
import { CalculatorMode } from '../../types/calculator';

interface ModeNavigationProps {
  currentMode: CalculatorMode;
  onModeChange: (mode: CalculatorMode) => void;
}

interface ModeItem {
  id: CalculatorMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hotkey: string;
}

const MODES: ModeItem[] = [
  { id: 'scientific', label: 'Scientific', icon: Calculator, hotkey: 'Alt+1' },
  { id: 'programmer', label: 'Programmer', icon: Cpu, hotkey: 'Alt+2' },
  { id: 'converter', label: 'Unit & Currency', icon: ArrowLeftRight, hotkey: 'Alt+3' },
  { id: 'financial', label: 'Financial & Loan', icon: Landmark, hotkey: 'Alt+4' },
  { id: 'graphing', label: '2D Graphing', icon: LineChart, hotkey: 'Alt+5' },
];

export const ModeNavigation: React.FC<ModeNavigationProps> = ({ currentMode, onModeChange }) => {
  return (
    <nav className="w-full max-w-4xl mx-auto px-4 my-4">
      <div className="flex items-center justify-start sm:justify-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg backdrop-blur-md overflow-x-auto scrollbar-none">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-colors duration-200 whitespace-nowrap focus:outline-none ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeModePill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-md shadow-indigo-500/20"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon className="w-4 h-4" />
                <span>{mode.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
