import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeSwitcher = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button
      onClick={toggleTheme}
      className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-accent transition"
    >
      {isDarkMode ? (
        <Sun className="h-4 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-4 w-5" />
      )}
    </button>
  );
};

export default ThemeSwitcher;
