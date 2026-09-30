import React, { useState, useEffect, useCallback } from 'react';
import { KeypadButton } from '../common/KeypadButton';
import { WordSize, BaseSystem } from '../../types/calculator';
import {
  WORD_SIZE_BITS,
  clampToWordSize,
  formatBases,
  parseFromBase,
  toggleBit,
  isBitSet,
  performBitwiseOp,
} from '../../utils/bitwiseHelper';
import { useHistory } from '../../context/HistoryContext';
import { useToast } from '../../context/ToastContext';
import { Copy, Delete, RotateCcw } from 'lucide-react';
import { copyTextToClipboard } from '../../utils/exportHelper';

type PendingOp = 'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR' | 'SHL' | 'SHR' | 'ROL' | 'ROR' | null;

export const ProgrammerMode: React.FC = () => {
  const { addHistory, recallTarget } = useHistory();
  const { showToast } = useToast();

  const [currentVal, setCurrentVal] = useState<bigint>(0n);
  const [wordSize, setWordSize] = useState<WordSize>('dword'); // Default 32-bit DWORD
  const [isSigned, setIsSigned] = useState<boolean>(false);
  const [activeBase, setActiveBase] = useState<BaseSystem>('DEC');

  // Input buffer string in current active base
  const [inputBuffer, setInputBuffer] = useState<string>('0');
  const [storedVal, setStoredVal] = useState<bigint | null>(null);
  const [pendingOp, setPendingOp] = useState<PendingOp>(null);

  // Formatted representations
  const formatted = formatBases(currentVal, wordSize, isSigned);

  // Sync input buffer when currentVal changes externally
  const updateCurrentValue = useCallback(
    (newVal: bigint) => {
      const clamped = clampToWordSize(newVal, wordSize);
      setCurrentVal(clamped);
      const f = formatBases(clamped, wordSize, isSigned);
      if (activeBase === 'HEX') setInputBuffer(f.hex);
      else if (activeBase === 'DEC') setInputBuffer(f.dec);
      else if (activeBase === 'OCT') setInputBuffer(f.oct);
      else if (activeBase === 'BIN') setInputBuffer(f.bin);
    },
    [wordSize, isSigned, activeBase]
  );

  // Handle word size change
  const handleWordSizeChange = (newSize: WordSize) => {
    setWordSize(newSize);
    updateCurrentValue(currentVal);
  };

  // Handle active base switch
  const handleBaseSelect = (base: BaseSystem) => {
    setActiveBase(base);
    const f = formatBases(currentVal, wordSize, isSigned);
    if (base === 'HEX') setInputBuffer(f.hex);
    else if (base === 'DEC') setInputBuffer(f.dec);
    else if (base === 'OCT') setInputBuffer(f.oct);
    else if (base === 'BIN') setInputBuffer(f.bin);
  };

  // Handle digit / char entry
  const handleInputChar = (char: string) => {
    let nextStr = inputBuffer === '0' ? char : inputBuffer + char;
    // Validate character matches active base
    const parsed = parseFromBase(nextStr, activeBase, wordSize);
    setCurrentVal(parsed);
    setInputBuffer(nextStr);
  };

  const handleBackspace = () => {
    if (inputBuffer.length <= 1) {
      setInputBuffer('0');
      setCurrentVal(0n);
    } else {
      const nextStr = inputBuffer.slice(0, -1);
      setInputBuffer(nextStr);
      const parsed = parseFromBase(nextStr, activeBase, wordSize);
      setCurrentVal(parsed);
    }
  };

  const handleClear = () => {
    setInputBuffer('0');
    setCurrentVal(0n);
    setStoredVal(null);
    setPendingOp(null);
  };

  // Set bitwise operation
  const handleOp = (op: PendingOp) => {
    if (op === null) return;
    setStoredVal(currentVal);
    setPendingOp(op);
    setInputBuffer('0');
  };

  // Calculate bitwise result
  const handleEquals = () => {
    if (storedVal !== null && pendingOp) {
      const res = performBitwiseOp(pendingOp, storedVal, currentVal, wordSize);
      addHistory(
        `${storedVal.toString(16).toUpperCase()} ${pendingOp} ${currentVal.toString(16).toUpperCase()}`,
        res.toString(16).toUpperCase(),
        'programmer'
      );
      updateCurrentValue(res);
      setStoredVal(null);
      setPendingOp(null);
    }
  };

  // Unary NOT
  const handleNot = () => {
    const res = performBitwiseOp('NOT', currentVal, 0n, wordSize);
    updateCurrentValue(res);
  };

  // Bit toggle from interactive visualizer
  const handleBitToggle = (bitIndex: number) => {
    const toggled = toggleBit(currentVal, bitIndex, wordSize);
    updateCurrentValue(toggled);
  };

  // Copy specific base value
  const handleCopy = async (val: string, label: string) => {
    const success = await copyTextToClipboard(val);
    if (success) {
      showToast(`Copied ${label}: ${val}`, 'success');
    }
  };

  // Check digit eligibility for active base
  const isDigitEnabled = (char: string) => {
    const hexChars = '0123456789ABCDEF';
    const decChars = '0123456789';
    const octChars = '01234567';
    const binChars = '01';

    if (activeBase === 'BIN') return binChars.includes(char);
    if (activeBase === 'OCT') return octChars.includes(char);
    if (activeBase === 'DEC') return decChars.includes(char);
    if (activeBase === 'HEX') return hexChars.includes(char);
    return false;
  };

  const totalBits = WORD_SIZE_BITS[wordSize];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 flex flex-col gap-4">
      {/* Top Multi-Base Conversion Readout */}
      <div className="p-4 md:p-5 rounded-2xl glass-panel shadow-2xl space-y-2">
        {/* Word size and Sign switcher */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/40 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            {(['qword', 'dword', 'word', 'byte'] as WordSize[]).map((size) => (
              <button
                key={size}
                onClick={() => handleWordSizeChange(size)}
                className={`px-2.5 py-1 rounded-lg uppercase font-semibold transition-colors ${
                  wordSize === size
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {size} ({WORD_SIZE_BITS[size]})
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsSigned(!isSigned)}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              isSigned
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isSigned ? 'SIGNED' : 'UNSIGNED'}
          </button>
        </div>

        {/* Real-time Simultaneous Base Converters */}
        <div className="space-y-1.5 pt-1">
          {(
            [
              { id: 'HEX', label: 'HEX', val: formatted.hex },
              { id: 'DEC', label: 'DEC', val: formatted.dec },
              { id: 'OCT', label: 'OCT', val: formatted.oct },
              { id: 'BIN', label: 'BIN', val: formatted.bin },
            ] as const
          ).map((item) => (
            <div
              key={item.id}
              onClick={() => handleBaseSelect(item.id)}
              className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                activeBase === item.id
                  ? 'bg-indigo-950/40 border-indigo-500/50 shadow-inner'
                  : 'bg-slate-800/30 border-transparent hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`font-mono text-xs font-bold w-9 px-1.5 py-0.5 rounded text-center ${
                    activeBase === item.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
                <span className="font-mono text-base md:text-lg text-white font-medium tracking-wider break-all">
                  {item.id === 'BIN'
                    ? item.val.match(/.{1,4}/g)?.join(' ') || item.val
                    : item.val}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(item.val, item.label);
                }}
                title={`Copy ${item.label}`}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/60"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bit-Level Display Visualizer (Interactive Toggles) */}
      <div className="p-4 rounded-2xl glass-panel space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="font-semibold text-indigo-400 uppercase tracking-wider">
            Interactive Bit Toggles ({totalBits}-Bit Grid)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateCurrentValue(0n)}
              className="hover:text-white hover:underline"
            >
              Clr
            </button>
            <span>•</span>
            <button
              onClick={() => handleNot()}
              className="hover:text-white hover:underline"
            >
              Inv
            </button>
            <span>•</span>
            <button
              onClick={() => updateCurrentValue(0xffffffffffffffffn)}
              className="hover:text-white hover:underline"
            >
              Set All
            </button>
          </div>
        </div>

        {/* 64 / 32 / 16 / 8 Bit Interactive Grid */}
        <div className="flex flex-col gap-2 pt-1 font-mono text-xs">
          {/* Groups of 16 or 8 bits with labels */}
          {Array.from({ length: Math.ceil(totalBits / 16) }).map((_, groupIdx) => {
            const highBit = totalBits - 1 - groupIdx * 16;
            const lowBit = Math.max(0, highBit - 15);

            return (
              <div key={groupIdx} className="flex flex-col gap-1 bg-slate-900/40 p-2 rounded-xl">
                <div className="flex justify-between text-[10px] text-slate-500 px-1">
                  <span>Bit {highBit}</span>
                  <span>Bit {lowBit}</span>
                </div>
                <div className="flex items-center justify-between gap-1 overflow-x-auto">
                  {Array.from({ length: highBit - lowBit + 1 }).map((_, i) => {
                    const bitIdx = highBit - i;
                    const isSet = isBitSet(currentVal, bitIdx);

                    return (
                      <button
                        key={bitIdx}
                        onClick={() => handleBitToggle(bitIdx)}
                        title={`Bit ${bitIdx}: ${isSet ? '1' : '0'} (Click to toggle)`}
                        className={`w-6 h-7 rounded flex flex-col items-center justify-center text-xs font-bold transition-all ${
                          isSet
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/50'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        } ${bitIdx % 4 === 0 && bitIdx !== lowBit ? 'mr-1 border-r border-slate-700' : ''}`}
                      >
                        {isSet ? '1' : '0'}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Programmer Keypad */}
      <div className="grid grid-cols-6 gap-2">
        {/* Bitwise Ops Row */}
        <KeypadButton label="AND" variant="function" onClick={() => handleOp('AND')} />
        <KeypadButton label="OR" variant="function" onClick={() => handleOp('OR')} />
        <KeypadButton label="XOR" variant="function" onClick={() => handleOp('XOR')} />
        <KeypadButton label="NOT" variant="function" onClick={handleNot} />
        <KeypadButton label="NAND" variant="function" onClick={() => handleOp('NAND')} />
        <KeypadButton label="NOR" variant="function" onClick={() => handleOp('NOR')} />

        {/* Shifts & Hex A-B */}
        <KeypadButton label="<<" variant="function" subLabel="SHL" onClick={() => handleOp('SHL')} />
        <KeypadButton label=">>" variant="function" subLabel="SHR" onClick={() => handleOp('SHR')} />
        <KeypadButton label="ROL" variant="function" onClick={() => handleOp('ROL')} />
        <KeypadButton label="ROR" variant="function" onClick={() => handleOp('ROR')} />
        <KeypadButton
          label="A"
          variant="function"
          disabled={!isDigitEnabled('A')}
          onClick={() => handleInputChar('A')}
        />
        <KeypadButton
          label="B"
          variant="function"
          disabled={!isDigitEnabled('B')}
          onClick={() => handleInputChar('B')}
        />

        {/* Row 3 */}
        <KeypadButton
          label="C"
          variant="function"
          disabled={!isDigitEnabled('C')}
          onClick={() => handleInputChar('C')}
        />
        <KeypadButton
          label="D"
          variant="function"
          disabled={!isDigitEnabled('D')}
          onClick={() => handleInputChar('D')}
        />
        <KeypadButton
          label="7"
          variant="default"
          disabled={!isDigitEnabled('7')}
          onClick={() => handleInputChar('7')}
        />
        <KeypadButton
          label="8"
          variant="default"
          disabled={!isDigitEnabled('8')}
          onClick={() => handleInputChar('8')}
        />
        <KeypadButton
          label="9"
          variant="default"
          disabled={!isDigitEnabled('9')}
          onClick={() => handleInputChar('9')}
        />
        <KeypadButton label="AC" variant="danger" onClick={handleClear} />

        {/* Row 4 */}
        <KeypadButton
          label="E"
          variant="function"
          disabled={!isDigitEnabled('E')}
          onClick={() => handleInputChar('E')}
        />
        <KeypadButton
          label="F"
          variant="function"
          disabled={!isDigitEnabled('F')}
          onClick={() => handleInputChar('F')}
        />
        <KeypadButton
          label="4"
          variant="default"
          disabled={!isDigitEnabled('4')}
          onClick={() => handleInputChar('4')}
        />
        <KeypadButton
          label="5"
          variant="default"
          disabled={!isDigitEnabled('5')}
          onClick={() => handleInputChar('5')}
        />
        <KeypadButton
          label="6"
          variant="default"
          disabled={!isDigitEnabled('6')}
          onClick={() => handleInputChar('6')}
        />
        <KeypadButton
          label={<Delete className="w-5 h-5" />}
          variant="function"
          onClick={handleBackspace}
        />

        {/* Row 5 */}
        <KeypadButton
          label="0"
          variant="default"
          disabled={!isDigitEnabled('0')}
          className="col-span-2"
          onClick={() => handleInputChar('0')}
        />
        <KeypadButton
          label="1"
          variant="default"
          disabled={!isDigitEnabled('1')}
          onClick={() => handleInputChar('1')}
        />
        <KeypadButton
          label="2"
          variant="default"
          disabled={!isDigitEnabled('2')}
          onClick={() => handleInputChar('2')}
        />
        <KeypadButton
          label="3"
          variant="default"
          disabled={!isDigitEnabled('3')}
          onClick={() => handleInputChar('3')}
        />
        <KeypadButton
          label="="
          variant="action"
          className="font-bold text-xl"
          onClick={handleEquals}
        />
      </div>
    </div>
  );
};

