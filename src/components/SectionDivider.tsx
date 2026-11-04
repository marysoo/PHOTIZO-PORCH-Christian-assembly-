import { motion } from 'motion/react';
import { Sparkles, Sun, Star, Flame, Crown, Shield } from 'lucide-react';

interface SectionDividerProps {
  variant?: 'line-glow' | 'beams' | 'sacred-emblem' | 'wave-glow';
  icon?: 'sparkles' | 'sun' | 'star' | 'flame' | 'crown' | 'shield';
  label?: string;
  className?: string;
}

export default function SectionDivider({
  variant = 'line-glow',
  icon = 'sparkles',
  label,
  className = ''
}: SectionDividerProps) {
  const renderIcon = () => {
    switch (icon) {
      case 'sun':
        return <Sun className="w-5 h-5 text-gold animate-[spin_12s_linear_infinite]" />;
      case 'star':
        return <Star className="w-4 h-4 text-gold fill-gold/30 animate-pulse" />;
      case 'flame':
        return <Flame className="w-5 h-5 text-gold animate-pulse" />;
      case 'crown':
        return <Crown className="w-4 h-4 text-gold" />;
      case 'shield':
        return <Shield className="w-4 h-4 text-gold" />;
      case 'sparkles':
      default:
        return <Sparkles className="w-5 h-5 text-gold animate-pulse" />;
    }
  };

  if (variant === 'wave-glow') {
    return (
      <div className={`relative w-full overflow-hidden py-4 ${className}`}>
        {/* Soft Background Radial Glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-24 bg-gold/15 blur-3xl rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="w-full flex items-center gap-4"
          >
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gold/30 to-gold/80" />
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-950/90 border border-gold/30 shadow-[0_0_20px_var(--theme-glow-soft,rgba(212,175,55,0.15))] text-xs font-semibold text-gold tracking-widest uppercase">
              {renderIcon()}
              {label && <span>{label}</span>}
            </div>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-gold/30 to-gold/80" />
          </motion.div>
        </div>
      </div>
    );
  }

  if (variant === 'beams') {
    return (
      <div className={`relative w-full py-12 flex flex-col items-center justify-center overflow-hidden ${className}`}>
        {/* Ambient background light beam */}
        <motion.div
          initial={{ opacity: 0, width: '20%' }}
          whileInView={{ opacity: 0.25, width: '70%' }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="h-2 bg-gradient-to-r from-transparent via-gold to-transparent blur-md rounded-full pointer-events-none"
        />

        <div className="relative z-10 flex items-center justify-center gap-6 w-full max-w-5xl px-6">
          {/* Left Animated Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-gold/70 origin-right"
          />

          {/* Central Glowing Shield / Emblem */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
            whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="relative flex items-center justify-center p-3 rounded-2xl bg-zinc-950 border border-gold/40 shadow-[0_0_25px_var(--theme-glow-soft,rgba(212,175,55,0.2))] group"
          >
            <div className="absolute inset-0 rounded-2xl bg-gold/10 blur-sm group-hover:bg-gold/20 transition-all" />
            <div className="relative z-10 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-ping" />
              {renderIcon()}
              {label && (
                <span className="text-xs font-serif font-bold text-gold tracking-wider uppercase px-1">
                  {label}
                </span>
              )}
              <span className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-ping" />
            </div>
          </motion.div>

          {/* Right Animated Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-zinc-800 to-gold/70 origin-left"
          />
        </div>
      </div>
    );
  }

  if (variant === 'sacred-emblem') {
    return (
      <div className={`relative w-full py-10 flex flex-col items-center justify-center overflow-hidden ${className}`}>
        {/* Central glow aura */}
        <div className="absolute w-72 h-72 bg-gradient-to-b from-gold/15 via-gold/5 to-transparent blur-3xl rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-4 w-72 sm:w-96">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gold/20 to-gold/60" />
            
            {/* Diamond Motif */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900/90 border border-gold/30 rounded-full shadow-lg">
              <div className="w-1 h-1 rotate-45 bg-gold" />
              {renderIcon()}
              {label && (
                <span className="text-[11px] font-mono tracking-widest text-gold uppercase font-semibold px-1">
                  {label}
                </span>
              )}
              <div className="w-1 h-1 rotate-45 bg-gold" />
            </div>

            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-gold/20 to-gold/60" />
          </div>

          {/* Subtle floating gold light dot row */}
          <div className="flex items-center gap-2 text-gold/40 text-[10px]">
            <span>✦</span>
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            <span>✦</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Default: 'line-glow'
  return (
    <div className={`relative w-full py-8 flex items-center justify-center overflow-hidden ${className}`}>
      <motion.div
        initial={{ opacity: 0, scaleX: 0.6 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="w-full max-w-6xl mx-auto px-6 flex items-center gap-4"
      >
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-zinc-800 via-gold/40 to-gold" />

        <div className="relative group">
          <div className="absolute -inset-2 bg-gold/20 rounded-full blur-md group-hover:bg-gold/30 transition-all" />
          <div className="relative px-3.5 py-1.5 rounded-full bg-zinc-950 border border-gold/40 shadow-xl flex items-center gap-2 text-gold text-xs font-serif font-bold tracking-widest uppercase">
            {renderIcon()}
            {label && <span>{label}</span>}
          </div>
        </div>

        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-zinc-800 via-gold/40 to-gold" />
      </motion.div>
    </div>
  );
}
