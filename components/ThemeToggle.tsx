import React from 'react';
import type { Theme } from '../types';
import { SunIcon, MoonIcon } from './Icons';

interface ThemeToggleProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-paper dark:bg-accent-dark border-2 border-ink/20 dark:border-ink-dark/20 text-ink dark:text-ink-dark hover:text-primary dark:hover:text-primary-dark hover:border-primary dark:hover:border-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary"
      aria-label={`Geçerli tema: ${theme === 'light' ? 'Aydınlık' : 'Karanlık'}. Temayı değiştir.`}
    >
      {theme === 'light' ? (
        <MoonIcon className="w-6 h-6" />
      ) : (
        <SunIcon className="w-6 h-6" />
      )}
    </button>
  );
};
