import React, { useState, useMemo } from 'react';
import { UnitCategory, UnitDefinition, CurrencyRate } from '../../types/converter';
import { ArrowLeftRight, Copy, Edit3, RotateCcw, Check } from 'lucide-react';
import { copyTextToClipboard } from '../../utils/exportHelper';
import { useToast } from '../../context/ToastContext';
import { useHistory } from '../../context/HistoryContext';

// Standard unit definitions
const UNIT_DEFINITIONS: Record<Exclude<UnitCategory, 'currency'>, UnitDefinition[]> = {
  length: [
    { id: 'm', name: 'Meters', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
    { id: 'km', name: 'Kilometers', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { id: 'cm', name: 'Centimeters', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    { id: 'mm', name: 'Millimeters', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { id: 'mi', name: 'Miles', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    { id: 'yd', name: 'Yards', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
    { id: 'ft', name: 'Feet', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { id: 'in', name: 'Inches', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    { id: 'nm', name: 'Nautical Miles', symbol: 'NM', toBase: (v) => v * 1852, fromBase: (v) => v / 1852 },
  ],
  mass: [
    { id: 'kg', name: 'Kilograms', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
    { id: 'g', name: 'Grams', symbol: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { id: 'mg', name: 'Milligrams', symbol: 'mg', toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
    { id: 't', name: 'Metric Tons', symbol: 't', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { id: 'lb', name: 'Pounds', symbol: 'lb', toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
    { id: 'oz', name: 'Ounces', symbol: 'oz', toBase: (v) => v * 0.028349523, fromBase: (v) => v / 0.028349523 },
    { id: 'st', name: 'Stones', symbol: 'st', toBase: (v) => v * 6.350293, fromBase: (v) => v / 6.350293 },
  ],
  temperature: [
    { id: 'c', name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
    { id: 'f', name: 'Fahrenheit', symbol: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
    { id: 'k', name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    { id: 'r', name: 'Rankine', symbol: '°R', toBase: (v) => ((v - 491.67) * 5) / 9, fromBase: (v) => ((v + 273.15) * 9) / 5 },
  ],
  speed: [
    { id: 'mps', name: 'Meters/second', symbol: 'm/s', toBase: (v) => v, fromBase: (v) => v },
    { id: 'kph', name: 'Kilometers/hour', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
    { id: 'mph', name: 'Miles/hour', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
    { id: 'knot', name: 'Knots', symbol: 'kn', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    { id: 'fps', name: 'Feet/second', symbol: 'ft/s', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
  ],
  data: [
    { id: 'b', name: 'Bytes', symbol: 'B', toBase: (v) => v, fromBase: (v) => v },
    { id: 'kb', name: 'Kilobytes', symbol: 'KB', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
    { id: 'mb', name: 'Megabytes', symbol: 'MB', toBase: (v) => v * 1024 ** 2, fromBase: (v) => v / 1024 ** 2 },
    { id: 'gb', name: 'Gigabytes', symbol: 'GB', toBase: (v) => v * 1024 ** 3, fromBase: (v) => v / 1024 ** 3 },
    { id: 'tb', name: 'Terabytes', symbol: 'TB', toBase: (v) => v * 1024 ** 4, fromBase: (v) => v / 1024 ** 4 },
    { id: 'pb', name: 'Petabytes', symbol: 'PB', toBase: (v) => v * 1024 ** 5, fromBase: (v) => v / 1024 ** 5 },
    { id: 'bit', name: 'Bits', symbol: 'b', toBase: (v) => v / 8, fromBase: (v) => v * 8 },
  ],
  energy: [
    { id: 'j', name: 'Joules', symbol: 'J', toBase: (v) => v, fromBase: (v) => v },
    { id: 'kj', name: 'Kilojoules', symbol: 'kJ', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { id: 'cal', name: 'Calories', symbol: 'cal', toBase: (v) => v * 4.184, fromBase: (v) => v / 4.184 },
    { id: 'kcal', name: 'Kilocalories', symbol: 'kcal', toBase: (v) => v * 4184, fromBase: (v) => v / 4184 },
    { id: 'wh', name: 'Watt-hours', symbol: 'Wh', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
    { id: 'kwh', name: 'Kilowatt-hours', symbol: 'kWh', toBase: (v) => v * 3.6e6, fromBase: (v) => v / 3.6e6 },
    { id: 'btu', name: 'BTU', symbol: 'BTU', toBase: (v) => v * 1055.06, fromBase: (v) => v / 1055.06 },
  ],
  area: [
    { id: 'sqm', name: 'Square Meters', symbol: 'm²', toBase: (v) => v, fromBase: (v) => v },
    { id: 'sqkm', name: 'Square Kilometers', symbol: 'km²', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
    { id: 'sqft', name: 'Square Feet', symbol: 'ft²', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
    { id: 'sqmi', name: 'Square Miles', symbol: 'mi²', toBase: (v) => v * 2.59e6, fromBase: (v) => v / 2.59e6 },
    { id: 'acre', name: 'Acres', symbol: 'ac', toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
    { id: 'ha', name: 'Hectares', symbol: 'ha', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
  ],
  volume: [
    { id: 'l', name: 'Liters', symbol: 'L', toBase: (v) => v, fromBase: (v) => v },
    { id: 'ml', name: 'Milliliters', symbol: 'mL', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { id: 'cu_m', name: 'Cubic Meters', symbol: 'm³', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { id: 'gal', name: 'Gallons (US)', symbol: 'gal', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
    { id: 'qt', name: 'Quarts', symbol: 'qt', toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
    { id: 'pt', name: 'Pints', symbol: 'pt', toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176 },
    { id: 'cup', name: 'Cups', symbol: 'cup', toBase: (v) => v * 0.24, fromBase: (v) => v / 0.24 },
    { id: 'floz', name: 'Fluid Ounces', symbol: 'fl oz', toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
  ],
};

const DEFAULT_CURRENCY_RATES: CurrencyRate[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', ratePerUSD: 1.0 },
  { code: 'EUR', name: 'Euro', symbol: '€', ratePerUSD: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', ratePerUSD: 0.79 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', ratePerUSD: 83.25 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', ratePerUSD: 154.5 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', ratePerUSD: 1.36 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', ratePerUSD: 1.52 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', ratePerUSD: 0.89 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', ratePerUSD: 7.23 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', ratePerUSD: 1.35 },
];

export const ConverterMode: React.FC = () => {
  const { showToast } = useToast();
  const { addHistory } = useHistory();

  const [category, setCategory] = useState<UnitCategory>('length');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnitId, setFromUnitId] = useState<string>('m');
  const [toUnitId, setToUnitId] = useState<string>('ft');

  // Currencies state
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>(() => {
    const saved = localStorage.getItem('omni_calc_currencies');
    return saved ? JSON.parse(saved) : DEFAULT_CURRENCY_RATES;
  });
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('INR');
  const [isEditRatesOpen, setIsEditRatesOpen] = useState(false);
  const [tempRates, setTempRates] = useState<CurrencyRate[]>(currencyRates);

  // Update default units when category changes
  const handleCategoryChange = (cat: UnitCategory) => {
    setCategory(cat);
    if (cat !== 'currency') {
      const units = UNIT_DEFINITIONS[cat];
      setFromUnitId(units[0].id);
      setToUnitId(units[1] ? units[1].id : units[0].id);
    }
  };

  // Unit conversion logic
  const convertedValue = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return '0';

    if (category === 'currency') {
      const fromRate = currencyRates.find((c) => c.code === fromCurrency)?.ratePerUSD || 1;
      const toRate = currencyRates.find((c) => c.code === toCurrency)?.ratePerUSD || 1;
      // Convert to USD base first, then to target
      const inUSD = val / fromRate;
      const result = inUSD * toRate;
      return result >= 1000 ? result.toFixed(2) : result.toFixed(4);
    } else {
      const units = UNIT_DEFINITIONS[category];
      const fromDef = units.find((u) => u.id === fromUnitId);
      const toDef = units.find((u) => u.id === toUnitId);
      if (!fromDef || !toDef) return '0';

      const baseVal = fromDef.toBase(val);
      const res = toDef.fromBase(baseVal);
      return Number(res.toPrecision(8)).toString();
    }
  }, [category, inputValue, fromUnitId, toUnitId, fromCurrency, toCurrency, currencyRates]);

  // Swap units
  const handleSwap = () => {
    if (category === 'currency') {
      const temp = fromCurrency;
      setFromCurrency(toCurrency);
      setToCurrency(temp);
    } else {
      const temp = fromUnitId;
      setFromUnitId(toUnitId);
      setToUnitId(temp);
    }
  };

  const handleCopy = async () => {
    const success = await copyTextToClipboard(convertedValue);
    if (success) {
      showToast(`Copied ${convertedValue} to clipboard!`, 'success');
      addHistory(
        `${inputValue} ${category === 'currency' ? fromCurrency : fromUnitId} to ${category === 'currency' ? toCurrency : toUnitId}`,
        convertedValue,
        'converter'
      );
    }
  };

  // Save edited currency rates
  const handleSaveRates = () => {
    setCurrencyRates(tempRates);
    localStorage.setItem('omni_calc_currencies', JSON.stringify(tempRates));
    setIsEditRatesOpen(false);
    showToast('Currency rates updated successfully', 'success');
  };

  const handleResetRates = () => {
    setTempRates(DEFAULT_CURRENCY_RATES);
    setCurrencyRates(DEFAULT_CURRENCY_RATES);
    localStorage.setItem('omni_calc_currencies', JSON.stringify(DEFAULT_CURRENCY_RATES));
    showToast('Currency rates reset to defaults', 'info');
  };

  // All other units quick conversion list
  const allConversions = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return [];

    if (category === 'currency') {
      const fromRate = currencyRates.find((c) => c.code === fromCurrency)?.ratePerUSD || 1;
      const inUSD = val / fromRate;
      return currencyRates
        .filter((c) => c.code !== fromCurrency)
        .map((c) => ({
          id: c.code,
          name: c.name,
          symbol: c.symbol,
          value: (inUSD * c.ratePerUSD).toFixed(c.ratePerUSD > 10 ? 2 : 4),
        }));
    } else {
      const units = UNIT_DEFINITIONS[category];
      const fromDef = units.find((u) => u.id === fromUnitId);
      if (!fromDef) return [];
      const baseVal = fromDef.toBase(val);

      return units
        .filter((u) => u.id !== fromUnitId)
        .map((u) => ({
          id: u.id,
          name: u.name,
          symbol: u.symbol,
          value: Number(u.fromBase(baseVal).toPrecision(6)).toString(),
        }));
    }
  }, [category, inputValue, fromUnitId, fromCurrency, currencyRates]);

  const categories: { id: UnitCategory; label: string }[] = [
    { id: 'length', label: 'Length' },
    { id: 'mass', label: 'Weight & Mass' },
    { id: 'temperature', label: 'Temperature' },
    { id: 'speed', label: 'Speed' },
    { id: 'data', label: 'Data Storage' },
    { id: 'energy', label: 'Energy' },
    { id: 'area', label: 'Area' },
    { id: 'volume', label: 'Volume' },
    { id: 'currency', label: 'Currency Rates' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 flex flex-col gap-4">
      {/* Category Pills Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 overflow-x-auto scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-colors ${
              category === cat.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Converter Card */}
      <div className="p-6 rounded-2xl glass-panel shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            {categories.find((c) => c.id === category)?.label} Converter
          </h2>

          {category === 'currency' && (
            <button
              onClick={() => {
                setTempRates(currencyRates);
                setIsEditRatesOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Exchange Rates</span>
            </button>
          )}
        </div>

        {/* Inputs & Units Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* FROM SECTION */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
              From
            </span>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter value"
              className="w-full text-2xl md:text-3xl font-mono font-bold bg-transparent text-white focus:outline-none border-b border-slate-700 pb-1"
            />
            {category === 'currency' ? (
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full mt-2 p-2 rounded-lg bg-slate-800 border border-slate-700 text-sm font-medium text-white focus:ring-2 focus:ring-indigo-500"
              >
                {currencyRates.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={fromUnitId}
                onChange={(e) => setFromUnitId(e.target.value)}
                className="w-full mt-2 p-2 rounded-lg bg-slate-800 border border-slate-700 text-sm font-medium text-white focus:ring-2 focus:ring-indigo-500"
              >
                {UNIT_DEFINITIONS[category].map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* SWAP BUTTON */}
          <div className="flex justify-center my-2 md:my-0">
            <button
              onClick={handleSwap}
              title="Swap Units"
              className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 transition-transform active:scale-95"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* TO SECTION */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
                To (Result)
              </span>
              <button
                onClick={handleCopy}
                title="Copy Result"
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-2xl md:text-3xl font-mono font-bold text-indigo-400 border-b border-slate-700 pb-1 break-all select-all">
              {convertedValue}
            </div>
            {category === 'currency' ? (
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full mt-2 p-2 rounded-lg bg-slate-800 border border-slate-700 text-sm font-medium text-white focus:ring-2 focus:ring-indigo-500"
              >
                {currencyRates.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={toUnitId}
                onChange={(e) => setToUnitId(e.target.value)}
                className="w-full mt-2 p-2 rounded-lg bg-slate-800 border border-slate-700 text-sm font-medium text-white focus:ring-2 focus:ring-indigo-500"
              >
                {UNIT_DEFINITIONS[category].map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Quick Reference Conversion Table */}
      <div className="p-5 rounded-2xl glass-panel space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Equivalent Values Across All Units
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {allConversions.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                if (category === 'currency') setToCurrency(conv.id);
                else setToUnitId(conv.id);
              }}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-colors"
            >
              <div>
                <div className="text-xs text-slate-400">{conv.name}</div>
                <div className="font-mono text-sm md:text-base font-bold text-white truncate max-w-[180px]">
                  {conv.value}
                </div>
              </div>
              <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-indigo-300">
                {conv.symbol}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Editable Rates Modal */}
      {isEditRatesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsEditRatesOpen(false)}
          />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl z-10 text-white max-h-[85vh] flex flex-col">
            <h3 className="text-lg font-bold mb-2">Edit Currency Exchange Rates</h3>
            <p className="text-xs text-slate-400 mb-4">
              Rates are relative to 1 USD base. Tweak values to test custom exchange scenarios.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {tempRates.map((rate, idx) => (
                <div
                  key={rate.code}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-indigo-400 w-12">
                      {rate.code}
                    </span>
                    <span className="text-xs text-slate-400">{rate.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-slate-500">1 USD =</span>
                    <input
                      type="number"
                      step="0.01"
                      value={rate.ratePerUSD}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        const copy = [...tempRates];
                        copy[idx].ratePerUSD = val;
                        setTempRates(copy);
                      }}
                      className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-sm text-right text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
              <button
                onClick={handleResetRates}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditRatesOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRates}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-500/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

