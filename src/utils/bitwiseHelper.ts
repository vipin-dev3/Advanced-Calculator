import { WordSize, BaseSystem } from '../types/calculator';

export const WORD_SIZE_BITS: Record<WordSize, number> = {
  qword: 64,
  dword: 32,
  word: 16,
  byte: 8,
};

export const WORD_SIZE_MASKS: Record<WordSize, bigint> = {
  qword: 0xffffffffffffffffn,
  dword: 0xffffffffn,
  word: 0xffffn,
  byte: 0xffn,
};

/**
 * Truncate BigInt to the active word size
 */
export function clampToWordSize(val: bigint, size: WordSize): bigint {
  const mask = WORD_SIZE_MASKS[size];
  return (val & mask);
}

/**
 * Format BigInt into unsigned HEX, DEC, OCT, BIN strings
 */
export function formatBases(val: bigint, size: WordSize, isSigned: boolean) {
  const bits = WORD_SIZE_BITS[size];
  const unsigned = clampToWordSize(val, size);

  // HEX
  const hex = unsigned.toString(16).toUpperCase();

  // DEC (signed or unsigned)
  let dec: string;
  if (isSigned) {
    const signBit = 1n << BigInt(bits - 1);
    if ((unsigned & signBit) !== 0n) {
      const signedVal = unsigned - (1n << BigInt(bits));
      dec = signedVal.toString(10);
    } else {
      dec = unsigned.toString(10);
    }
  } else {
    dec = unsigned.toString(10);
  }

  // OCT
  const oct = unsigned.toString(8);

  // BIN
  const binRaw = unsigned.toString(2);
  const bin = binRaw.padStart(bits, '0');

  return {
    hex: hex || '0',
    dec: dec || '0',
    oct: oct || '0',
    bin: bin || '0',
  };
}

/**
 * Parses user input string from a specified base
 */
export function parseFromBase(input: string, base: BaseSystem, size: WordSize): bigint {
  if (!input || !input.trim()) return 0n;
  const clean = input.trim().replace(/\s+/g, '');
  try {
    let val = 0n;
    if (base === 'HEX') {
      val = BigInt('0x' + clean);
    } else if (base === 'DEC') {
      val = BigInt(clean);
    } else if (base === 'OCT') {
      val = BigInt('0o' + clean);
    } else if (base === 'BIN') {
      val = BigInt('0b' + clean);
    }
    return clampToWordSize(val, size);
  } catch {
    return 0n;
  }
}

/**
 * Toggle a specific bit index (0 to 63)
 */
export function toggleBit(current: bigint, bitIndex: number, size: WordSize): bigint {
  const mask = 1n << BigInt(bitIndex);
  const toggled = current ^ mask;
  return clampToWordSize(toggled, size);
}

/**
 * Check if a specific bit is set
 */
export function isBitSet(val: bigint, bitIndex: number): boolean {
  const mask = 1n << BigInt(bitIndex);
  return (val & mask) !== 0n;
}

/**
 * Perform bitwise operations with word size clamping
 */
export function performBitwiseOp(
  op: 'AND' | 'OR' | 'XOR' | 'NOT' | 'NAND' | 'NOR' | 'SHL' | 'SHR' | 'ROL' | 'ROR',
  a: bigint,
  b: bigint,
  size: WordSize
): bigint {
  const bits = BigInt(WORD_SIZE_BITS[size]);
  const mask = WORD_SIZE_MASKS[size];
  const clampedA = a & mask;
  const clampedB = b & mask;

  let result = 0n;
  switch (op) {
    case 'AND':
      result = clampedA & clampedB;
      break;
    case 'OR':
      result = clampedA | clampedB;
      break;
    case 'XOR':
      result = clampedA ^ clampedB;
      break;
    case 'NOT':
      result = ~clampedA & mask;
      break;
    case 'NAND':
      result = ~(clampedA & clampedB) & mask;
      break;
    case 'NOR':
      result = ~(clampedA | clampedB) & mask;
      break;
    case 'SHL': {
      const shift = Number(clampedB % bits);
      result = (clampedA << BigInt(shift)) & mask;
      break;
    }
    case 'SHR': {
      const shift = Number(clampedB % bits);
      result = (clampedA >> BigInt(shift)) & mask;
      break;
    }
    case 'ROL': {
      const shift = Number(clampedB % bits);
      result = ((clampedA << BigInt(shift)) | (clampedA >> (bits - BigInt(shift)))) & mask;
      break;
    }
    case 'ROR': {
      const shift = Number(clampedB % bits);
      result = ((clampedA >> BigInt(shift)) | (clampedA << (bits - BigInt(shift)))) & mask;
      break;
    }
  }

  return clampToWordSize(result, size);
}
