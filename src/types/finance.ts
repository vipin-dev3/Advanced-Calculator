export type FinanceTab = 'loan' | 'investment' | 'tip';

export interface LoanInput {
  principal: number;
  annualRate: number;
  termYears: number;
  termMonths: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  amortization: {
    year: number;
    principalPaid: number;
    interestPaid: number;
    remainingBalance: number;
  }[];
}

export type CompoundingFrequency = 'annually' | 'semi-annually' | 'quarterly' | 'monthly';

export interface InvestmentInput {
  initialDeposit: number;
  monthlyContribution: number;
  annualInterestRate: number;
  years: number;
  frequency: CompoundingFrequency;
}

export interface InvestmentResult {
  futureValue: number;
  totalPrincipal: number;
  totalInterest: number;
  yearlyBreakdown: {
    year: number;
    principal: number;
    interest: number;
    total: number;
  }[];
}

export interface TipInput {
  billAmount: number;
  tipPercentage: number;
  splitCount: number;
  customTax: number;
}

export interface TipResult {
  tipAmount: number;
  taxAmount: number;
  totalWithTip: number;
  perPersonBill: number;
  perPersonTip: number;
  perPersonTotal: number;
}

