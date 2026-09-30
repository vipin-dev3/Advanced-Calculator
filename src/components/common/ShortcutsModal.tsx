import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'General & Navigation',
      items: [
        { keys: ['Alt', '1 - 5'], desc: 'Switch Calculator Mode' },
        { keys: ['Alt', 'H'], desc: 'Toggle Calculation History' },
        { keys: ['Alt', 'R'], desc: 'Toggle Angle Unit (DEG / RAD)' },
        { keys: ['?'], desc: 'Show this Help Modal' },
      ],
    },
    {
      title: 'Calculator Operations',
      items: [
        { keys: ['0 - 9', '.'], desc: 'Number & Decimal Input' },
        { keys: ['+', '-', '*', '/'], desc: 'Basic Arithmetic Operators' },
        { keys: ['^'], desc: 'Power / Exponentiation ($x^y$)' },
        { keys: ['(', ')'], desc: 'Parentheses' },
        { keys: ['Enter', '='], desc: 'Calculate / Evaluate Expression' },
        { keys: ['Backspace'], desc: 'Delete Character Before Cursor' },
        { keys: ['Escape'], desc: 'Clear All (AC)' },
        { keys: ['←', '→'], desc: 'Move Input Cursor Left / Right' },
      ],
    },
    {
      title: 'Programmer Mode',
      items: [
        { keys: ['A - F'], desc: 'Hexadecimal Digits (in HEX base)' },
        { keys: ['&', '|'], desc: 'Bitwise AND / OR' },
        { keys: ['<', '>'], desc: 'Bit Shift Left / Right' },
      ],
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl z-10 text-white max-h-[85vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-lg">Keyboard Shortcuts</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 mt-4">
            {shortcutGroups.map((group, idx) => (
              <div key={idx} className="space-y-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg bg-slate-800/40 border border-slate-700/30"
                    >
                      <span className="text-slate-300">{item.desc}</span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((k, ki) => (
                          <kbd
                            key={ki}
                            className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-xs text-slate-200 font-semibold shadow-sm"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-medium text-sm transition-colors"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
