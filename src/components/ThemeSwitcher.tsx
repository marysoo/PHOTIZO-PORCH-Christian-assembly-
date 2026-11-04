import { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

interface ThemeSwitcherProps {
  variant?: 'navbar' | 'floating' | 'mobile-inline';
  className?: string;
}

export default function ThemeSwitcher({ variant = 'navbar', className = '' }: ThemeSwitcherProps) {
  const { currentTheme, setThemeById, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Variant: Mobile inline picker for the mobile menu drawer
  if (variant === 'mobile-inline') {
    return (
      <div className={`p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-sm ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-gold" />
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Choose Theme</span>
          </div>
          <span className="text-[11px] font-semibold text-gold truncate max-w-[150px]">{currentTheme.name}</span>
        </div>

        {/* 3 Color Combination Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {themes.map((theme) => {
            const isSelected = theme.id === currentTheme.id;
            return (
              <button
                key={theme.id}
                onClick={() => setThemeById(theme.id)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all cursor-pointer text-left border ${
                  isSelected 
                    ? 'bg-zinc-800/90 border-gold ring-1 ring-gold shadow-md' 
                    : 'bg-zinc-950/60 hover:bg-zinc-800/60 border-zinc-800'
                }`}
              >
                <div 
                  className="w-7 h-7 rounded-full shrink-0 shadow-md flex items-center justify-center border border-white/20"
                  style={{ background: theme.swatchGradient }}
                >
                  {isSelected && (
                    <Check 
                      size={13} 
                      className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" 
                      style={{ color: theme.accentTextColor }} 
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-100 truncate">{theme.name}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{theme.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="italic truncate max-w-[280px]">"{currentTheme.biblicalMeaning}"</span>
        </div>
      </div>
    );
  }

  // Variant: Floating quick-toggle widget (Bottom-Left)
  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 left-6 z-[95] ${className}`} ref={dropdownRef}>
        <div className="relative flex items-center">
          {/* Main Floating Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 hover:border-gold/60 text-zinc-200 hover:text-white shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group"
            style={{
              boxShadow: `0 0 20px ${currentTheme.glowSoft}`
            }}
            aria-label="Change site color theme"
          >
            <div 
              className="w-5 h-5 rounded-full shadow-inner flex items-center justify-center transition-transform group-hover:rotate-45 border border-white/20"
              style={{ background: currentTheme.swatchGradient }}
            >
              <Palette size={11} style={{ color: themeIconColor(currentTheme.id) }} />
            </div>
            <span className="text-xs font-semibold tracking-wide hidden sm:inline-block">
              {currentTheme.name}
            </span>
            <div 
              className="w-2 h-2 rounded-full animate-ping opacity-75"
              style={{ backgroundColor: currentTheme.primary }}
            />
          </button>

          {/* Quick Swatch Popup Tray */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-14 left-0 mb-2 w-80 p-4 bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800 rounded-2xl shadow-2xl shadow-black/80 z-50"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/80 mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Site Color Options</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">3 Choices</span>
                </div>

                <div className="space-y-2">
                  {themes.map((theme) => {
                    const isSelected = theme.id === currentTheme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setThemeById(theme.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left cursor-pointer border ${
                          isSelected
                            ? 'bg-zinc-800/95 text-white border-gold/60 shadow-md ring-1 ring-gold/40'
                            : 'hover:bg-zinc-900/80 text-zinc-300 hover:text-white border-zinc-800/70'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-full shrink-0 shadow-md flex items-center justify-center border border-white/20"
                          style={{ background: theme.swatchGradient }}
                        >
                          {isSelected && (
                            <Check
                              size={13}
                              className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                              style={{ color: theme.accentTextColor }}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold leading-tight">{theme.name}</p>
                          <p className="text-[10px] text-zinc-400 truncate mt-0.5">{theme.subtitle}</p>
                        </div>
                        {isSelected && (
                          <span 
                            className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0"
                            style={{ 
                              backgroundColor: `${theme.primary}25`,
                              color: theme.id === 'white-green-gold' ? '#16A34A' : theme.primary,
                              border: `1px solid ${theme.primary}50`
                            }}
                          >
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Variant: Standard Navbar Dropdown (Desktop)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-gold/50 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer shadow-sm group"
        aria-label="Toggle site color theme"
      >
        <div
          className="w-3.5 h-3.5 rounded-full shadow-sm ring-1 ring-white/20 transition-transform group-hover:scale-110"
          style={{ background: currentTheme.swatchGradient }}
        />
        <span className="hidden lg:inline">{currentTheme.name}</span>
        <span className="lg:hidden">Theme</span>
        <ChevronDown size={13} className={`text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-gold' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 mt-2.5 w-84 p-3.5 bg-zinc-950/98 backdrop-blur-2xl border border-zinc-800 rounded-2xl shadow-2xl shadow-black/80 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-zinc-850">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-gold" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Select Color Theme</h4>
                  <p className="text-[10px] text-zinc-400">Choose your preferred visual atmosphere</p>
                </div>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">3 Options</span>
            </div>

            {/* 3 Themes List */}
            <div className="space-y-2">
              {themes.map((theme) => {
                const isSelected = theme.id === currentTheme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setThemeById(theme.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left cursor-pointer group border ${
                      isSelected
                        ? 'bg-zinc-850/90 text-white border-gold/60 shadow-md ring-1 ring-gold/40'
                        : 'hover:bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800/80'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-full shrink-0 shadow-md flex items-center justify-center transition-transform group-hover:scale-105 border border-white/20"
                      style={{ 
                        background: theme.swatchGradient,
                        boxShadow: isSelected ? `0 0 12px ${theme.glow}` : undefined
                      }}
                    >
                      {isSelected && (
                        <Check
                          size={13}
                          className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                          style={{ color: theme.accentTextColor }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold leading-tight truncate">{theme.name}</span>
                        {isSelected && (
                          <span 
                            className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                            style={{ 
                              backgroundColor: `${theme.primary}20`,
                              color: theme.id === 'white-green-gold' ? '#16A34A' : theme.primary,
                              border: `1px solid ${theme.primary}40`
                            }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">{theme.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-3 pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500">
              <span>Your selection is saved across visits</span>
              <Sparkles size={11} className="text-gold opacity-60" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function themeIconColor(id: string): string {
  if (id === 'white-green-gold') return '#15803D';
  if (id === 'black-white') return '#09090B';
  return '#FAF5FF';
}
