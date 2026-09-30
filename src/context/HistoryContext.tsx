import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HistoryItem, CalculatorMode } from '../types/calculator';

interface HistoryContextType {
  history: HistoryItem[];
  addHistory: (expression: string, result: string, mode: CalculatorMode) => void;
  removeHistoryItem: (id: string) => void;
  clearHistory: () => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  recallTarget: { text: string; id: number } | null;
  recallToCurrent: (text: string) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('omni_calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [recallTarget, setRecallTarget] = useState<{ text: string; id: number } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('omni_calc_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  }, [history]);

  const addHistory = useCallback((expression: string, result: string, mode: CalculatorMode) => {
    if (!expression || !result) return;
    const newItem: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      expression,
      result,
      mode,
      timestamp: Date.now(),
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 199)]); // Store up to 200 items
  }, []);

  const removeHistoryItem = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const recallToCurrent = useCallback((text: string) => {
    setRecallTarget({ text, id: Date.now() });
    setIsDrawerOpen(false);
  }, []);

  return (
    <HistoryContext.Provider
      value={{
        history,
        addHistory,
        removeHistoryItem,
        clearHistory,
        isDrawerOpen,
        setIsDrawerOpen,
        toggleDrawer,
        recallTarget,
        recallToCurrent,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) throw new Error('useHistory must be used within a HistoryProvider');
  return context;
};

