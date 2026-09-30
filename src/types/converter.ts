export type UnitCategory = 
  | 'length' 
  | 'mass' 
  | 'temperature' 
  | 'speed' 
  | 'data' 
  | 'energy' 
  | 'area' 
  | 'volume'
  | 'currency';

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  toBase: (val: number) => number;
  fromBase: (val: number) => number;
}

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  ratePerUSD: number; // base rate against 1 USD
}

