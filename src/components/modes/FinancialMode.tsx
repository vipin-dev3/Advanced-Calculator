import React, { useState, useMemo } from 'react';
import { FinanceTab, CompoundingFrequency } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Landmark, TrendingUp, Users, DollarSign, Percent, Calendar, PieChart as PieIcon } from 'lucide-react';
import { useHistory } from '../../context/HistoryContext';

export const FinancialMode: React.FC = () => {
  const { addHistory } = useHistory();
  const [activeTab, setActiveTab] = useState<FinanceTab>('loan');

  // ================= Loan / Mortgage State =================
  const [loanPrincipal, setLoanPrincipal] = useState<number>(300000);
  const [loanRate, setLoanRate] = useState<number>(6.5);
  const [loanYears, setLoanYears] = useState<number>(30);

  // EMI Calculation
  const loanResults = useMemo(() => {
    const p = Math.max(0, loanPrincipal);
    const r = Math.max(0, loanRate) / 100 / 12; // monthly rate
    const n = Math.max(1, loanYears * 12); // total months

    let emi = 0;
    if (r === 0) {
      emi = p / n;
    } else {
      emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = emi * n;
    const totalInterest = Math.max(0, totalPayment - p);

    // Yearly amortization summary (up to 30 years)
    const yearlySchedule = [];
    let balance = p;
    for (let year = 1; year <= loanYears; year++) {
      let interestThisYear = 0;
      let principalThisYear = 0;
      for (let m = 0; m < 12; m++) {
        if (balance <= 0) break;
        const interestMonth = balance * r;
        const principalMonth = Math.min(balance, emi - interestMonth);
        interestThisYear += interestMonth;
        principalThisYear += principalMonth;
        balance -= principalMonth;
      }
      yearlySchedule.push({
        year,
        principalPaid: Math.round(principalThisYear),
        interestPaid: Math.round(interestThisYear),
        balance: Math.max(0, Math.round(balance)),
      });
    }

    return {
      monthlyEMI: emi,
      totalPayment,
      totalInterest,
      yearlySchedule,
    };
  }, [loanPrincipal, loanRate, loanYears]);

  // ================= Compound Interest State =================
  const [initDeposit, setInitDeposit] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [investmentRate, setInvestmentRate] = useState<number>(8);
  const [investmentYears, setInvestmentYears] = useState<number>(20);
  const [compoundFreq, setCompoundFreq] = useState<CompoundingFrequency>('monthly');

  const investmentResults = useMemo(() => {
    const freqMap: Record<CompoundingFrequency, number> = {
      annually: 1,
      'semi-annually': 2,
      quarterly: 4,
      monthly: 12,
    };
    const n = freqMap[compoundFreq];
    const r = investmentRate / 100;
    const t = investmentYears;

    const yearlyData = [];
    let currentBalance = initDeposit;
    let totalDeposited = initDeposit;

    yearlyData.push({
      year: 'Year 0',
      balance: Math.round(currentBalance),
      contributions: Math.round(totalDeposited),
      interest: 0,
    });

    for (let yr = 1; yr <= t; yr++) {
      for (let m = 0; m < 12; m++) {
        currentBalance += monthlyContribution;
        totalDeposited += monthlyContribution;
        // Apply monthly compound share
        currentBalance += (currentBalance * r) / 12;
      }

      yearlyData.push({
        year: `Yr ${yr}`,
        balance: Math.round(currentBalance),
        contributions: Math.round(totalDeposited),
        interest: Math.round(Math.max(0, currentBalance - totalDeposited)),
      });
    }

    return {
      futureValue: currentBalance,
      totalDeposited,
      totalInterest: Math.max(0, currentBalance - totalDeposited),
      yearlyData,
    };
  }, [initDeposit, monthlyContribution, investmentRate, investmentYears, compoundFreq]);

  // ================= Tip Splitter State =================
  const [billAmount, setBillAmount] = useState<number>(120);
  const [tipPercent, setTipPercent] = useState<number>(18);
  const [peopleCount, setPeopleCount] = useState<number>(4);
  const [taxPercent, setTaxPercent] = useState<number>(8.5);

  const tipResults = useMemo(() => {
    const bill = Math.max(0, billAmount);
    const tax = bill * (Math.max(0, taxPercent) / 100);
    const tip = bill * (Math.max(0, tipPercent) / 100);
    const total = bill + tax + tip;
    const num = Math.max(1, peopleCount);

    return {
      tipAmount: tip,
      taxAmount: tax,
      total,
      perPersonBill: (bill + tax) / num,
      perPersonTip: tip / num,
      perPersonTotal: total / num,
    };
  }, [billAmount, tipPercent, peopleCount, taxPercent]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 flex flex-col gap-4">
      {/* Sub Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <button
          onClick={() => setActiveTab('loan')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs md:text-sm font-semibold transition-colors ${
            activeTab === 'loan'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Loan & Mortgage (EMI)</span>
        </button>

        <button
          onClick={() => setActiveTab('investment')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs md:text-sm font-semibold transition-colors ${
            activeTab === 'investment'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Compound Growth</span>
        </button>

        <button
          onClick={() => setActiveTab('tip')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs md:text-sm font-semibold transition-colors ${
            activeTab === 'tip'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Tip & Bill Splitter</span>
        </button>
      </div>

      {/* ================= TAB 1: LOAN & MORTGAGE ================= */}
      {activeTab === 'loan' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Controls */}
            <div className="p-5 rounded-2xl glass-panel space-y-4">
              <h3 className="font-bold text-base text-white border-b border-slate-800 pb-2">
                Loan Parameters
              </h3>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Loan Amount (Principal)</span>
                  <span className="font-mono text-indigo-400 font-bold">
                    {formatCurrency(loanPrincipal)}
                  </span>
                </div>
                <input
                  type="number"
                  step="5000"
                  value={loanPrincipal}
                  onChange={(e) => setLoanPrincipal(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Annual Interest Rate (%)</span>
                  <span className="font-mono text-indigo-400 font-bold">{loanRate}%</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={loanRate}
                  onChange={(e) => setLoanRate(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Loan Term (Years)</span>
                  <span className="font-mono text-indigo-400 font-bold">{loanYears} Years</span>
                </div>
                <div className="flex gap-2">
                  {[10, 15, 20, 25, 30].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setLoanYears(yr)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                        loanYears === yr
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {yr}y
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results & Pie Chart */}
            <div className="p-5 rounded-2xl glass-panel flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-base text-white border-b border-slate-800 pb-2">
                  Monthly Payment (EMI)
                </h3>
                <div className="mt-3 text-3xl md:text-4xl font-extrabold text-indigo-400 font-mono">
                  {formatCurrency(loanResults.monthlyEMI)}
                  <span className="text-xs text-slate-400 font-normal ml-2">/ month</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-2 border-y border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">Total Principal:</span>
                  <div className="text-sm font-mono font-bold text-white">
                    {formatCurrency(loanPrincipal)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Total Interest:</span>
                  <div className="text-sm font-mono font-bold text-amber-400">
                    {formatCurrency(loanResults.totalInterest)}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Total Payment:</span>
                  <div className="text-base font-mono font-bold text-indigo-300">
                    {formatCurrency(loanResults.totalPayment)}
                  </div>
                </div>
              </div>

              {/* Principal vs Interest Donut Chart */}
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Principal', value: loanPrincipal },
                        { name: 'Interest', value: Math.round(loanResults.totalInterest) },
                      ]}
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      <Cell fill="#6366f1" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => formatCurrency(val)}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: INVESTMENT & COMPOUND INTEREST ================= */}
      {activeTab === 'investment' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Input Controls */}
            <div className="p-5 rounded-2xl glass-panel space-y-4">
              <h3 className="font-bold text-base text-white border-b border-slate-800 pb-2">
                Investment Inputs
              </h3>

              <div className="space-y-1">
                <span className="text-xs text-slate-400">Initial Principal ($)</span>
                <input
                  type="number"
                  step="1000"
                  value={initDeposit}
                  onChange={(e) => setInitDeposit(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm"
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400">Monthly Contribution ($)</span>
                <input
                  type="number"
                  step="50"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm"
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400">Annual Return Rate (%)</span>
                <input
                  type="number"
                  step="0.5"
                  value={investmentRate}
                  onChange={(e) => setInvestmentRate(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm"
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400">Investment Horizon (Years)</span>
                <input
                  type="number"
                  value={investmentYears}
                  onChange={(e) => setInvestmentYears(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm"
                />
              </div>
            </div>

            {/* Growth Curve Area Chart */}
            <div className="md:col-span-2 p-5 rounded-2xl glass-panel space-y-4 flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div>
                  <span className="text-xs text-slate-400">Future Balance</span>
                  <div className="text-2xl md:text-3xl font-extrabold text-emerald-400 font-mono">
                    {formatCurrency(investmentResults.futureValue)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Total Interest Earned</span>
                  <div className="text-lg font-bold text-indigo-400 font-mono">
                    +{formatCurrency(investmentResults.totalInterest)}
                  </div>
                </div>
              </div>

              {/* Recharts AreaChart */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={investmentResults.yearlyData}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(val: number) => formatCurrency(val)}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      name="Total Wealth"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorBalance)"
                    />
                    <Area
                      type="monotone"
                      dataKey="contributions"
                      name="Total Contributed"
                      stroke="#6366f1"
                      fillOpacity={1}
                      fill="url(#colorContrib)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: TIP & BILL SPLITTER ================= */}
      {activeTab === 'tip' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Inputs */}
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <h3 className="font-bold text-base text-white border-b border-slate-800 pb-2">
              Bill & Tip Details
            </h3>

            <div className="space-y-1">
              <span className="text-xs text-slate-400">Total Bill Amount ($)</span>
              <input
                type="number"
                step="5"
                value={billAmount}
                onChange={(e) => setBillAmount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-lg font-bold"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Tip Percentage (%)</span>
                <span className="font-mono text-indigo-400 font-bold">{tipPercent}%</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[10, 15, 18, 20, 25].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setTipPercent(pct)}
                    className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                      tipPercent === pct
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Split with (Number of People)</span>
                <span className="font-mono text-indigo-400 font-bold">{peopleCount} People</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={peopleCount}
                onChange={(e) => setPeopleCount(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400">Sales Tax % (Optional)</span>
              <input
                type="number"
                step="0.5"
                value={taxPercent}
                onChange={(e) => setTaxPercent(Number(e.target.value))}
                className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm"
              />
            </div>
          </div>

          {/* Breakdown Per Person */}
          <div className="p-5 rounded-2xl glass-panel space-y-5 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-white border-b border-slate-800 pb-2">
                Per-Person Split
              </h3>
              <div className="mt-4 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-center">
                <span className="text-xs text-indigo-300 uppercase tracking-wider font-semibold">
                  Each Person Pays
                </span>
                <div className="text-3xl md:text-4xl font-extrabold text-white font-mono mt-1">
                  {formatCurrency(tipResults.perPersonTotal)}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm border-t border-slate-800 pt-3">
              <div className="flex justify-between text-slate-400">
                <span>Tip Amount:</span>
                <span className="font-mono text-white">{formatCurrency(tipResults.tipAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax Amount:</span>
                <span className="font-mono text-white">{formatCurrency(tipResults.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total with Tip & Tax:</span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(tipResults.total)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-2 font-medium">
                <span>Tip Per Person:</span>
                <span className="font-mono text-indigo-400">
                  {formatCurrency(tipResults.perPersonTip)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

