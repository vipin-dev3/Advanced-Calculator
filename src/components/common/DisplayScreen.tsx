import React, { useRef, useEffect } from 'react';
import { Copy, ChevronLeft, ChevronRight, RotateCcw, AlertTriangle } from 'lucide-react';
import { copyTextToClipboard } from '../../utils/exportHelper';
import { useToast } from '../../context/ToastContext';
import { AngleUnit } from '../../types/calculator';

interface DisplayScreenProps {
  expression: string;
  cursorPosition: number;
  previewResult?: string;
  finalResult?: string;
  error?: string | null;
  angleUnit?: AngleUnit;
  onToggleAngleUnit?: () => void;
  hasMemory?: boolean;
  onCursorMove: (newPosition: number) => void;
  onClear: () => void;
  onBackspace: () => void;
}

export const DisplayScreen: React.FC<DisplayScreenProps> = ({
  expression,
  cursorPosition,
  previewResult,
  finalResult,
  error,
  angleUnit,
  onToggleAngleUnit,
  hasMemory = false,
  onCursorMove,
  onClear,
  onBackspace,
}) => {
  const { showToast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll expression to cursor position
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [expression, cursorPosition]);

  const handleCopy = async () => {
    const textToCopy = finalResult || previewResult || expression || '0';
    const success = await copyTextToClipboard(textToCopy);
    if (success) {
      showToast(`Copied "${textToCopy}" to clipboard!`, 'success');
    } else {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Basic click to place cursor at the end or character position
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newPos = Math.round(ratio * expression.length);
    onCursorMove(newPos);
  };

  // Render expression with visual cursor
  const renderExpressionWithCursor = () => {
    if (!expression) {
      return (
        <span className="relative inline-block text-slate-400">
          0
          <span className="inline-block w-0.5 h-6 bg-indigo-400 animate-pulse ml-0.5 align-middle" />
        </span>
      );
    }

    const before = expression.slice(0, cursorPosition);
    const after = expression.slice(cursorPosition);

    return (
      <span className="tracking-wide">
        {before}
        <span className="inline-block w-0.5 h-6 bg-indigo-400 animate-pulse align-middle mx-0.5 shadow-sm shadow-indigo-400" />
        {after}
      </span>
    );
  };

  return (
    <div className="relative flex flex-col justify-between w-full p-4 md:p-6 rounded-2xl glass-panel shadow-2xl overflow-hidden min-h-[160px] md:min-h-[190px]">
      {/* Top Status & Controls Bar */}
      <div className="flex items-center justify-between gap-2 text-xs font-mono text-slate-400 pb-2 border-b border-slate-700/30">
        <div className="flex items-center gap-2">
          {angleUnit && onToggleAngleUnit && (
            <button
              type="button"
              onClick={onToggleAngleUnit}
              title="Click to switch DEG / RAD"
              className="px-2 py-0.5 rounded-md font-bold tracking-wider transition-colors duration-150 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30"
            >
              {angleUnit.toUpperCase()}
            </button>
          )}

          {hasMemory && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              M
            </span>
          )}

          {error && (
            <span className="flex items-center gap-1 text-rose-400 font-sans text-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
              {error}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Cursor manual step buttons */}
          <div className="flex items-center bg-slate-800/60 rounded-lg p-0.5 border border-slate-700/40">
            <button
              type="button"
              onClick={() => onCursorMove(Math.max(0, cursorPosition - 1))}
              disabled={cursorPosition <= 0}
              className="p-1 rounded hover:bg-slate-700/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Move cursor left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onCursorMove(Math.min(expression.length, cursorPosition + 1))}
              disabled={cursorPosition >= expression.length}
              className="p-1 rounded hover:bg-slate-700/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Move cursor right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy current result to clipboard"
            className="p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors text-slate-300 hover:text-white"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expression Area (Interactive cursor navigation) */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className="my-3 overflow-x-auto whitespace-nowrap scrollbar-none font-mono text-xl md:text-2xl text-slate-300 cursor-text py-1"
      >
        {renderExpressionWithCursor()}
      </div>

      {/* Result Display & Live Preview */}
      <div className="flex items-baseline justify-end gap-2 text-right">
        {finalResult ? (
          <div className="font-mono text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-md">
            {finalResult}
          </div>
        ) : previewResult && previewResult !== expression && previewResult !== '0' ? (
          <div className="font-mono text-xl md:text-2xl text-slate-400/80 font-medium">
            <span className="text-slate-500 mr-1.5">=</span>
            {previewResult}
          </div>
        ) : (
          <div className="font-mono text-3xl md:text-4xl text-slate-500 font-light">
            0
          </div>
        )}
      </div>
    </div>
  );
};

