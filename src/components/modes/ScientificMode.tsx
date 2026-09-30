import React, { useState, useEffect, useCallback } from 'react';
import { DisplayScreen } from '../common/DisplayScreen';
import { KeypadButton } from '../common/KeypadButton';
import { evaluateExpression, formatNumber } from '../../utils/mathParser';
import { useHistory } from '../../context/HistoryContext';
import { useToast } from '../../context/ToastContext';
import { AngleUnit } from '../../types/calculator';
import { Delete, RotateCcw } from 'lucide-react';

export const ScientificMode: React.FC = () => {
  const { addHistory, recallTarget } = useHistory();
  const { showToast } = useToast();

  const [expression, setExpression] = useState<string>('');
  const [cursorPos, setCursorPos] = useState<number>(0);
  const [finalResult, setFinalResult] = useState<string>('');
  const [previewResult, setPreviewResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [angleUnit, setAngleUnit] = useState<AngleUnit>('deg');
  const [isSecond, setIsSecond] = useState<boolean>(false);
  const [isHyperbolic, setIsHyperbolic] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(0);

  // Live evaluation preview
  useEffect(() => {
    if (!expression.trim()) {
      setPreviewResult('');
      setError(null);
      return;
    }

    const res = evaluateExpression(expression, angleUnit);
    if (res.success && res.value !== expression) {
      setPreviewResult(res.value);
      setError(null);
    } else {
      setPreviewResult('');
    }
  }, [expression, angleUnit]);

  // Handle recall from history drawer
  useEffect(() => {
    if (recallTarget) {
      setExpression(recallTarget.text);
      setCursorPos(recallTarget.text.length);
      setFinalResult('');
      setError(null);
    }
  }, [recallTarget]);

  // Insert string at current cursor position
  const insertText = useCallback((text: string) => {
    setExpression((prev) => {
      const before = prev.slice(0, cursorPos);
      const after = prev.slice(cursorPos);
      return before + text + after;
    });
    setCursorPos((prev) => prev + text.length);
    setFinalResult('');
    setError(null);
  }, [cursorPos]);

  // Delete character before cursor
  const handleBackspace = useCallback(() => {
    if (cursorPos === 0) return;
    setExpression((prev) => {
      const before = prev.slice(0, cursorPos - 1);
      const after = prev.slice(cursorPos);
      return before + after;
    });
    setCursorPos((prev) => Math.max(0, prev - 1));
    setFinalResult('');
    setError(null);
  }, [cursorPos]);

  // Clear all
  const handleClear = useCallback(() => {
    setExpression('');
    setCursorPos(0);
    setFinalResult('');
    setPreviewResult('');
    setError(null);
  }, []);

  // Evaluate calculation
  const handleCalculate = useCallback(() => {
    if (!expression.trim()) return;

    const res = evaluateExpression(expression, angleUnit);
    if (res.success) {
      setFinalResult(res.value);
      setError(null);
      addHistory(expression, res.value, 'scientific');
    } else {
      setError(res.error || 'Syntax error');
      setFinalResult('');
    }
  }, [expression, angleUnit, addHistory]);

  // Memory operations
  const handleMemory = (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
    const currentVal = Number(finalResult || previewResult || expression) || 0;
    switch (action) {
      case 'MC':
        setMemory(0);
        showToast('Memory Cleared (MC)', 'info');
        break;
      case 'MR':
        insertText(formatNumber(memory));
        showToast(`Memory Recalled: ${formatNumber(memory)}`, 'info');
        break;
      case 'MS':
        setMemory(currentVal);
        showToast(`Stored ${formatNumber(currentVal)} to Memory (MS)`, 'info');
        break;
      case 'M+':
        setMemory((prev) => prev + currentVal);
        showToast(`Added to Memory: ${formatNumber(memory + currentVal)}`, 'info');
        break;
      case 'M-':
        setMemory((prev) => prev - currentVal);
        showToast(`Subtracted from Memory: ${formatNumber(memory - currentVal)}`, 'info');
        break;
    }
  };

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key >= '0' && e.key <= '9') {
        insertText(e.key);
      } else if (['+', '-', '*', '/', '(', ')', '^', '%', '.'].includes(e.key)) {
        insertText(e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCursorPos((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCursorPos((prev) => Math.min(expression.length, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [insertText, handleCalculate, handleBackspace, handleClear, expression.length]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 flex flex-col gap-4">
      {/* Display Screen */}
      <DisplayScreen
        expression={expression}
        cursorPosition={cursorPos}
        previewResult={previewResult}
        finalResult={finalResult}
        error={error}
        angleUnit={angleUnit}
        onToggleAngleUnit={() => setAngleUnit((prev) => (prev === 'deg' ? 'rad' : 'deg'))}
        hasMemory={memory !== 0}
        onCursorMove={setCursorPos}
        onClear={handleClear}
        onBackspace={handleBackspace}
      />

      {/* Function and Memory Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsSecond(!isSecond)}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${
              isSecond
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 border-slate-700/50'
            }`}
          >
            2nd
          </button>
          <button
            onClick={() => setIsHyperbolic(!isHyperbolic)}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors ${
              isHyperbolic
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 border-slate-700/50'
            }`}
          >
            hyp
          </button>
          <button
            onClick={() => setAngleUnit((u) => (u === 'deg' ? 'rad' : 'deg'))}
            className="px-3 py-1.5 rounded-lg font-mono font-semibold bg-slate-800/60 text-indigo-300 hover:bg-slate-700/60 border border-slate-700/50 transition-colors"
          >
            {angleUnit.toUpperCase()}
          </button>
        </div>

        {/* Memory Bar */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleMemory('MC')}
            disabled={memory === 0}
            className="px-2.5 py-1 rounded bg-slate-800/40 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 disabled:opacity-30 border border-slate-700/30"
          >
            MC
          </button>
          <button
            onClick={() => handleMemory('MR')}
            disabled={memory === 0}
            className="px-2.5 py-1 rounded bg-slate-800/40 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 disabled:opacity-30 border border-slate-700/30"
          >
            MR
          </button>
          <button
            onClick={() => handleMemory('M+')}
            className="px-2.5 py-1 rounded bg-slate-800/40 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/30"
          >
            M+
          </button>
          <button
            onClick={() => handleMemory('M-')}
            className="px-2.5 py-1 rounded bg-slate-800/40 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/30"
          >
            M-
          </button>
          <button
            onClick={() => handleMemory('MS')}
            className="px-2.5 py-1 rounded bg-slate-800/40 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/30"
          >
            MS
          </button>
        </div>
      </div>

      {/* Main Scientific Keypad Grid */}
      <div className="grid grid-cols-5 md:grid-cols-7 gap-2">
        {/* Advanced Scientific Functions Column 1 & 2 */}
        <KeypadButton
          label={
            isHyperbolic
              ? isSecond
                ? 'asinh'
                : 'sinh'
              : isSecond
              ? 'asin'
              : 'sin'
          }
          variant="function"
          onClick={() =>
            insertText(
              isHyperbolic
                ? isSecond
                  ? 'asinh('
                  : 'sinh('
                : isSecond
                ? 'asin('
                : 'sin('
            )
          }
        />
        <KeypadButton
          label={
            isHyperbolic
              ? isSecond
                ? 'acosh'
                : 'cosh'
              : isSecond
              ? 'acos'
              : 'cos'
          }
          variant="function"
          onClick={() =>
            insertText(
              isHyperbolic
                ? isSecond
                  ? 'acosh('
                  : 'cosh('
                : isSecond
                ? 'acos('
                : 'cos('
            )
          }
        />
        <KeypadButton
          label={
            isHyperbolic
              ? isSecond
                ? 'atanh'
                : 'tanh'
              : isSecond
              ? 'atan'
              : 'tan'
          }
          variant="function"
          onClick={() =>
            insertText(
              isHyperbolic
                ? isSecond
                  ? 'atanh('
                  : 'tanh('
                : isSecond
                ? 'atan('
                : 'tan('
            )
          }
        />
        <KeypadButton
          label={isSecond ? '10^x' : 'log₁₀'}
          variant="function"
          onClick={() => insertText(isSecond ? '10^(' : 'log10(')}
        />
        <KeypadButton
          label={isSecond ? 'e^x' : 'ln'}
          variant="function"
          onClick={() => insertText(isSecond ? 'e^(' : 'ln(')}
        />
        <KeypadButton
          label="AC"
          variant="danger"
          hotkey="Esc"
          onClick={handleClear}
          className="col-span-1"
        />
        <KeypadButton
          label={<Delete className="w-5 h-5" />}
          variant="function"
          hotkey="⌫"
          onClick={handleBackspace}
        />

        {/* Row 2 */}
        <KeypadButton
          label={isSecond ? 'x³' : 'x²'}
          variant="function"
          onClick={() => insertText(isSecond ? '^3' : '^2')}
        />
        <KeypadButton
          label={isSecond ? '³√x' : '√x'}
          variant="function"
          onClick={() => insertText(isSecond ? 'cbrt(' : 'sqrt(')}
        />
        <KeypadButton
          label="xʸ"
          variant="function"
          hotkey="^"
          onClick={() => insertText('^(')}
        />
        <KeypadButton
          label="n!"
          variant="function"
          onClick={() => insertText('!')}
        />
        <KeypadButton
          label="("
          variant="function"
          hotkey="("
          onClick={() => insertText('(')}
        />
        <KeypadButton
          label=")"
          variant="function"
          hotkey=")"
          onClick={() => insertText(')')}
        />
        <KeypadButton
          label="÷"
          variant="operator"
          hotkey="/"
          onClick={() => insertText('÷')}
        />

        {/* Row 3 */}
        <KeypadButton
          label="π"
          variant="function"
          subLabel="3.1415"
          onClick={() => insertText('pi')}
        />
        <KeypadButton
          label="e"
          variant="function"
          subLabel="2.7182"
          onClick={() => insertText('e')}
        />
        <KeypadButton
          label="ϕ"
          variant="function"
          subLabel="1.618"
          onClick={() => insertText('phi')}
        />
        <KeypadButton
          label="7"
          variant="default"
          hotkey="7"
          onClick={() => insertText('7')}
        />
        <KeypadButton
          label="8"
          variant="default"
          hotkey="8"
          onClick={() => insertText('8')}
        />
        <KeypadButton
          label="9"
          variant="default"
          hotkey="9"
          onClick={() => insertText('9')}
        />
        <KeypadButton
          label="×"
          variant="operator"
          hotkey="*"
          onClick={() => insertText('×')}
        />

        {/* Row 4 */}
        <KeypadButton
          label="|x|"
          variant="function"
          onClick={() => insertText('abs(')}
        />
        <KeypadButton
          label="mod"
          variant="function"
          onClick={() => insertText(' mod ')}
        />
        <KeypadButton
          label="1/x"
          variant="function"
          onClick={() => insertText('1/(')}
        />
        <KeypadButton
          label="4"
          variant="default"
          hotkey="4"
          onClick={() => insertText('4')}
        />
        <KeypadButton
          label="5"
          variant="default"
          hotkey="5"
          onClick={() => insertText('5')}
        />
        <KeypadButton
          label="6"
          variant="default"
          hotkey="6"
          onClick={() => insertText('6')}
        />
        <KeypadButton
          label="−"
          variant="operator"
          hotkey="-"
          onClick={() => insertText('−')}
        />

        {/* Row 5 */}
        <KeypadButton
          label="log₂"
          variant="function"
          onClick={() => insertText('log2(')}
        />
        <KeypadButton
          label="%"
          variant="function"
          hotkey="%"
          onClick={() => insertText('%')}
        />
        <KeypadButton
          label="EXP"
          variant="function"
          onClick={() => insertText('e+')}
        />
        <KeypadButton
          label="1"
          variant="default"
          hotkey="1"
          onClick={() => insertText('1')}
        />
        <KeypadButton
          label="2"
          variant="default"
          hotkey="2"
          onClick={() => insertText('2')}
        />
        <KeypadButton
          label="3"
          variant="default"
          hotkey="3"
          onClick={() => insertText('3')}
        />
        <KeypadButton
          label="+"
          variant="operator"
          hotkey="+"
          onClick={() => insertText('+')}
        />

        {/* Row 6 */}
        <KeypadButton
          label="±"
          variant="function"
          onClick={() => {
            if (expression.startsWith('-(') && expression.endsWith(')')) {
              setExpression(expression.slice(2, -1));
            } else {
              setExpression(`-(${expression})`);
            }
          }}
        />
        <KeypadButton
          label="rnd"
          variant="function"
          onClick={() => insertText(Math.random().toFixed(4))}
        />
        <KeypadButton
          label="ANS"
          variant="function"
          onClick={() => {
            if (finalResult) insertText(finalResult);
          }}
        />
        <KeypadButton
          label="0"
          variant="default"
          hotkey="0"
          className="col-span-1"
          onClick={() => insertText('0')}
        />
        <KeypadButton
          label="."
          variant="default"
          hotkey="."
          onClick={() => insertText('.')}
        />
        <KeypadButton
          label="="
          variant="action"
          hotkey="Enter"
          className="col-span-2 text-xl font-bold"
          onClick={handleCalculate}
        />
      </div>
    </div>
  );
};
