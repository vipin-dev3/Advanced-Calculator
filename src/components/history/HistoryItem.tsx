import React from 'react';
import { HistoryItem as HistoryItemType } from '../../types/calculator';
import { formatTimestamp } from '../../utils/formatters';
import { Copy, CornerDownLeft, Trash2 } from 'lucide-react';
import { copyTextToClipboard } from '../../utils/exportHelper';
import { useToast } from '../../context/ToastContext';

interface HistoryItemProps {
  item: HistoryItemType;
  onRecall: (text: string) => void;
  onDelete: (id: string) => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ item, onRecall, onDelete }) => {
  const { showToast } = useToast();

  const handleCopy = async (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyTextToClipboard(text);
    if (success) {
      showToast('Copied to clipboard!', 'success');
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'scientific':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'programmer':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'converter':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'financial':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'graphing':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="group relative p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/40 transition-all duration-150">
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
        <span className={`px-1.5 py-0.5 rounded uppercase font-semibold text-[10px] border ${getModeColor(item.mode)}`}>
          {item.mode}
        </span>
        <div className="flex items-center gap-1.5">
          <span>{formatTimestamp(item.timestamp)}</span>
          <button
            onClick={() => onDelete(item.id)}
            title="Delete this item"
            className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 transition-opacity"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expression (Click to recall) */}
      <button
        onClick={() => onRecall(item.expression)}
        title="Click to recall expression"
        className="w-full text-left font-mono text-xs text-slate-400 hover:text-indigo-300 truncate transition-colors py-0.5"
      >
        {item.expression}
      </button>

      {/* Result (Click to recall result) */}
      <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-700/20">
        <button
          onClick={() => onRecall(item.result)}
          title="Click to recall result into calculator"
          className="font-mono text-sm md:text-base font-bold text-white hover:text-indigo-400 transition-colors text-left flex items-center gap-1.5"
        >
          <span>= {item.result}</span>
          <CornerDownLeft className="w-3 h-3 opacity-0 group-hover:opacity-60 text-indigo-400" />
        </button>

        <button
          onClick={(e) => handleCopy(item.result, e)}
          title="Copy result"
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
