import React, { useState } from 'react';
import { Palette, Volume2, VolumeX, History, Keyboard, Sparkles, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSound } from '../../context/SoundContext';
import { useHistory } from '../../context/HistoryContext';
import { ThemeType } from '../../types/calculator';

interface HeaderProps {
  onOpenShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenShortcuts }) => {
  const { theme, setTheme, availableThemes } = useTheme();
  const { soundEnabled, toggleSound } = useSound();
  const { history, toggleDrawer } = useHistory();
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  return (
    <header className="w-full flex items-center justify-between py-3 px-4 md:px-8 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
      {/* Brand & Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              OmniCalc <span className="text-indigo-400 font-black">Pro</span>
            </h1>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
              v2.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Scientific • Programmer • Converter • Financial • 2D Graphing
          </p>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Keyboard Shortcuts Trigger */}
        <button
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts (Press ? or Shift+/)"
          className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 transition-colors"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Mute Keypad Audio' : 'Enable Keypad Audio'}
          className={`p-2 rounded-xl border transition-colors ${
            soundEnabled
              ? 'bg-slate-800/60 text-indigo-400 border-indigo-500/30 hover:bg-slate-700/80'
              : 'bg-slate-800/30 text-slate-500 border-slate-700/30 hover:bg-slate-800/60 hover:text-slate-400'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Theme Picker Dropdown */}
        <div className="relative">
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            title="Customize Theme"
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 transition-colors flex items-center gap-1.5"
          >
            <Palette className="w-4 h-4 text-indigo-400" />
          </button>

          {themeDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setThemeDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-1.5 z-40 space-y-1">
                <div className="px-2.5 py-1.5 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                  Select Theme
                </div>
                {availableThemes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      theme === t.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: t.previewColor }}
                      />
                      <span>{t.label}</span>
                    </div>
                    {theme === t.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* History Drawer Toggle Button */}
        <button
          onClick={toggleDrawer}
          title="Toggle Calculation History"
          className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 transition-colors font-medium text-xs"
        >
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">History</span>
          {history.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
              {history.length > 99 ? '99+' : history.length}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
