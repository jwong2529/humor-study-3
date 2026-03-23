'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes'
import { useState, useEffect } from 'react'
import { Sun, Moon, Laptop } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="p-2 w-10 h-10 border border-slate-700/50 rounded-xl bg-slate-800/50 animate-pulse"></div>

  return (
    <div className="flex bg-foreground/5 p-1 rounded-2xl border border-border shadow-inner backdrop-blur-md">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-xl transition-all ${theme === 'light' ? 'bg-card shadow-lg text-blue-600' : 'text-foreground/40 hover:text-foreground/60'}`}
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-blue-600 shadow-lg text-white' : 'text-foreground/40 hover:text-foreground/60'}`}
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-xl transition-all ${theme === 'system' ? 'bg-foreground/10 shadow-lg text-foreground' : 'text-foreground/40 hover:text-foreground/60'}`}
      >
        <Laptop className="w-4 h-4" />
      </button>
    </div>
  )
}
