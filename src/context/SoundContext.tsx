import React, { createContext, useContext, useState, useEffect } from 'react';
import { soundManager } from '../utils/sound';

interface SoundContextType {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  playClick: () => void;
  playSuccess: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('omni_calc_sound');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('omni_calc_sound', String(soundEnabled));
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
  };

  const toggleSound = () => {
    setSoundEnabledState((prev) => !prev);
  };

  const playClick = () => {
    soundManager.playClick();
  };

  const playSuccess = () => {
    soundManager.playSuccess();
  };

  return (
    <SoundContext.Provider value={{ soundEnabled, setSoundEnabled, toggleSound, playClick, playSuccess }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useSound must be used within a SoundProvider');
  return context;
};
