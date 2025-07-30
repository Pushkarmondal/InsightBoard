"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from 'sonner';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-transparent">
        <div className="w-5 h-5" />
      </button>
    );
  }

  const toggleTheme = () => {
    if (theme === 'dark') {
      toast.info('Dark mode is better for your eyes and reduces eye strain!', {
        duration: 10000,
        position: 'top-center',
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        },
        icon: '👁️',
      });
    } else {
      setTheme('dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors border border-gray-300 dark:border-gray-600"
      aria-label={theme === 'dark' ? 'Switch to light mode (not recommended)' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Dark mode is better for your eyes' : 'Switch to dark mode'}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}