export type CalculatorMode = 
  | 'scientific' 
  | 'programmer' 
  | 'converter' 
  | 'financial' 
  | 'graphing';

export type ThemeType = 'modern-dark' | 'clean-light' | 'cyberpunk-neon' | 'oled-black';

export type AngleUnit = 'deg' | 'rad';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  mode: CalculatorMode;
  timestamp: number;
}

export type WordSize = 'qword' | 'dword' | 'word' | 'byte'; // 64, 32, 16, 8 bits

export type BaseSystem = 'HEX' | 'DEC' | 'OCT' | 'BIN';

export interface BitwiseState {
  value: bigint;
  wordSize: WordSize;
  isSigned: boolean;
}

