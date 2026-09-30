import React from 'react';
import { motion } from 'framer-motion';
import { useSound } from '../../context/SoundContext';

export type ButtonVariant = 'default' | 'operator' | 'function' | 'action' | 'danger' | 'ghost';

interface KeypadButtonProps {
  label: React.ReactNode;
  subLabel?: string;
  badge?: string;
  hotkey?: string;
  variant?: ButtonVariant;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  isActive?: boolean;
}

export const KeypadButton: React.FC<KeypadButtonProps> = ({
  label,
  subLabel,
  badge,
  hotkey,
  variant = 'default',
  onClick,
  disabled = false,
  className = '',
  isActive = false,
}) => {
  const { playClick, playSuccess } = useSound();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (variant === 'action') {
      playSuccess();
    } else {
      playClick();
    }
    onClick();
  };

  const getVariantStyles = () => {
    if (isActive) {
      return 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border-indigo-400';
    }

    switch (variant) {
      case 'action':
        return 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/25 border-indigo-400/40';
      case 'operator':
        return 'bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 dark:text-indigo-300 font-medium border-indigo-500/20';
      case 'function':
        return 'bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 dark:text-slate-300 font-medium border-slate-700/40';
      case 'danger':
        return 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 dark:text-rose-400 font-medium border-rose-500/30';
      case 'ghost':
        return 'bg-transparent hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 border-transparent';
      case 'default':
      default:
        return 'bg-slate-800/40 hover:bg-slate-700/60 text-slate-100 dark:text-slate-100 font-normal border-slate-700/30';
    }
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      transition={{ duration: 0.1 }}
      onClick={handleClick}
      disabled={disabled}
      type="button"
      className={`relative group flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-150 select-none text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
        disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:shadow-inner'
      } ${getVariantStyles()} ${className}`}
    >
      {badge && (
        <span className="absolute top-1 right-1.5 text-[9px] font-mono tracking-tighter uppercase px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {badge}
        </span>
      )}
      <div className="flex items-center justify-center gap-1">
        <span>{label}</span>
        {subLabel && (
          <span className="text-[10px] opacity-70 font-normal ml-0.5">
            {subLabel}
          </span>
        )}
      </div>
      {hotkey && (
        <span className="absolute bottom-1 right-1.5 text-[9px] font-mono opacity-0 group-hover:opacity-75 transition-opacity text-slate-400">
          {hotkey}
        </span>
      )}
    </motion.button>
  );
};
