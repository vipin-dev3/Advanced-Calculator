import { create, all, ConfigOptions } from 'mathjs';
import { AngleUnit } from '../types/calculator';

const config: ConfigOptions = {
  number: 'number',
  precision: 64,
};

const math = create(all, config);

// Custom constants
const PHI = 1.618033988749895;

/**
 * Creates an evaluation scope depending on the angle unit (DEG / RAD)
 */
function createTrigScope(angleUnit: AngleUnit) {
  if (angleUnit === 'rad') {
    return {
      phi: PHI,
      ln: (x: number) => Math.log(x),
      log10: (x: number) => Math.log10(x),
      log2: (x: number) => Math.log2(x),
    };
  }

  const degToRad = (deg: number) => (deg * Math.PI) / 180;
  const radToDeg = (rad: number) => (rad * 180) / Math.PI;

  return {
    phi: PHI,
    ln: (x: number) => Math.log(x),
    log10: (x: number) => Math.log10(x),
    log2: (x: number) => Math.log2(x),
    sin: (x: number) => {
      // Normalize angle for exact values like sin(180) = 0
      const rad = degToRad(x);
      const res = Math.sin(rad);
      return Math.abs(res) < 1e-15 ? 0 : res;
    },
    cos: (x: number) => {
      const rad = degToRad(x);
      const res = Math.cos(rad);
      return Math.abs(res) < 1e-15 ? 0 : res;
    },
    tan: (x: number) => {
      const norm = ((x % 360) + 360) % 360;
      if (norm === 90 || norm === 270) {
        throw new Error('Undefined (tan of 90°/270°)');
      }
      const rad = degToRad(x);
      const res = Math.tan(rad);
      return Math.abs(res) < 1e-15 ? 0 : res;
    },
    asin: (x: number) => {
      if (x < -1 || x > 1) throw new Error('Domain error (-1 ≤ x ≤ 1)');
      return radToDeg(Math.asin(x));
    },
    acos: (x: number) => {
      if (x < -1 || x > 1) throw new Error('Domain error (-1 ≤ x ≤ 1)');
      return radToDeg(Math.acos(x));
    },
    atan: (x: number) => radToDeg(Math.atan(x)),
  };
}

/**
 * Pre-processes user input symbols for mathjs compatibility
 */
export function sanitizeExpression(expr: string): string {
  if (!expr || !expr.trim()) return '';

  let sanitized = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi')
    .replace(/ϕ/g, 'phi')
    .replace(/√\(([^)]+)\)/g, 'sqrt($1)')
    .replace(/√(\d+(\.\d+)?)/g, 'sqrt($1)')
    .replace(/%/g, '*(1/100)')
    .replace(/mod/gi, ' mod ');

  // Handle implicit multiplication like 2pi, 3(4), (2)(3)
  sanitized = sanitized
    .replace(/(\d)(\()/g, '$1*(')
    .replace(/(\))(\d)/g, '$1*$2')
    .replace(/(\))(\()/g, '$1*(')
    .replace(/(\d)(pi|phi|e\b)/g, '$1*$2');

  return sanitized;
}

export interface EvaluationResult {
  success: boolean;
  value: string;
  raw?: number | any;
  error?: string;
}

/**
 * Safely evaluates a mathematical expression with angle unit support
 */
export function evaluateExpression(expr: string, angleUnit: AngleUnit = 'deg'): EvaluationResult {
  const sanitized = sanitizeExpression(expr);
  if (!sanitized) {
    return { success: true, value: '0', raw: 0 };
  }

  try {
    const scope = createTrigScope(angleUnit);
    const result = math.evaluate(sanitized, scope);

    if (result === undefined || result === null) {
      return { success: false, value: '', error: 'Invalid expression' };
    }

    // Check for complex numbers or special types
    if (typeof result === 'object' && 'im' in result) {
      const re = Math.abs(result.re) < 1e-12 ? 0 : Number(result.re.toFixed(10));
      const im = Math.abs(result.im) < 1e-12 ? 0 : Number(result.im.toFixed(10));
      if (im === 0) return { success: true, value: `${re}`, raw: re };
      if (re === 0) return { success: true, value: `${im}i`, raw: result };
      return { success: true, value: `${re} + ${im}i`, raw: result };
    }

    const num = Number(result);
    if (isNaN(num)) {
      return { success: false, value: '', error: 'Result is NaN' };
    }

    if (!isFinite(num)) {
      if (num === Infinity || num === -Infinity) {
        return { success: false, value: '', error: 'Division by zero / Infinite' };
      }
      return { success: false, value: '', error: 'Out of range' };
    }

    // Clean up precision
    const formatted = formatNumber(num);
    return { success: true, value: formatted, raw: num };
  } catch (err: any) {
    let msg = 'Syntax error';
    if (err?.message) {
      if (err.message.includes('Undefined') || err.message.includes('Domain error')) {
        msg = err.message;
      } else if (err.message.includes('Unexpected type of argument') || err.message.includes('Parenthesis') || err.message.includes('Unexpected end')) {
        msg = 'Invalid syntax';
      } else if (err.message.includes('division by zero')) {
        msg = 'Division by zero';
      }
    }
    return { success: false, value: '', error: msg };
  }
}

/**
 * Format numbers cleanly (handles integers, decimals, scientific notation)
 */
export function formatNumber(num: number): string {
  if (Math.abs(num) < 1e-14 && num !== 0) {
    return num.toExponential(4);
  }
  if (Math.abs(num) >= 1e15 || (Math.abs(num) < 1e-6 && num !== 0)) {
    return Number(num.toPrecision(10)).toString();
  }
  // Trim redundant zeros
  const rounded = parseFloat(num.toFixed(12));
  return rounded.toString();
}

/**
 * Compile a function for graphing f(x)
 */
export function compileGraphFunction(expr: string) {
  const sanitized = sanitizeExpression(expr);
  try {
    const compiled = math.compile(sanitized);
    return (x: number): number | null => {
      try {
        const val = compiled.evaluate({ x, pi: Math.PI, e: Math.E, phi: PHI });
        if (typeof val === 'number' && isFinite(val) && !isNaN(val)) {
          return val;
        }
        return null;
      } catch {
        return null;
      }
    };
  } catch {
    return null;
  }
}

