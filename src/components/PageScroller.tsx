import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUp, 
  ChevronsDown,
  Navigation,
  Radio,
  Info,
  Image as ImageIcon,
  Calendar,
  Headphones,
  BookOpen,
  Sparkles,
  HeartHandshake,
  Mail,
  X
} from 'lucide-react';

interface PageScrollerProps {
  isAdmin?: boolean;
}

const SECTIONS = [
  { id: 'live', label: 'Live Stream', icon: Radio },
  { id: 'about', label: 'About Us', icon: Info },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'sermons', label: 'Audio Sermons', icon: Headphones },
  { id: 'blog', label: 'Gazette', icon: BookOpen },
  { id: 'testimonies', label: 'Testimonies', icon: Sparkles },
  { id: 'giving', label: 'Giving Hub', icon: HeartHandshake },
  { id: 'contact', label: 'Contact', icon: Mail }
];

export default function PageScroller({ isAdmin = false }: PageScrollerProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          
          if (scrollHeight > 0) {
            const progress = Math.min(100, Math.max(0, Math.round((scrollTop / scrollHeight) * 100)));
            setScrollProgress(progress);
            setCanScrollUp(scrollTop > 80);
            setCanScrollDown(scrollTop < scrollHeight - 80);
            setIsVisible(scrollHeight > 300);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  const scrollStepUp = () => {
    window.scrollBy({
      top: -Math.round(window.innerHeight * 0.75),
      behavior: 'smooth'
    });
  };

  const scrollStepDown = () => {
    window.scrollBy({
      top: Math.round(window.innerHeight * 0.75),
      behavior: 'smooth'
    });
  };

  const jumpToSection = (id: string) => {
    setShowSectionMenu(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isVisible) return null;

  // Stacking offset: if admin bar is present at bottom-6, place scroller higher to prevent collision
  const bottomPositionClass = isAdmin 
    ? 'bottom-28 sm:bottom-32' 
    : 'bottom-8 sm:bottom-10';

  return (
    <>
      {/* Floating Vertical Scroller Pod */}
      <motion.aside
        aria-label="Page scroll navigation"
        initial={{ opacity: 0, scale: 0.85, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.85, x: 20 }}
        transition={{ duration: 0.2 }}
        className={`fixed right-3.5 sm:right-6 ${bottomPositionClass} z-[85] flex flex-col items-center select-none`}
      >
        <div className="flex flex-col items-center bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/90 hover:border-gold/50 rounded-full p-1.5 shadow-2xl shadow-black/80 transition-all duration-300 group/pod">
          {/* Scroll Up Button */}
          <button
            type="button"
            onClick={scrollToTop}
            disabled={!canScrollUp}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
              canScrollUp
                ? 'text-zinc-200 hover:text-white hover:bg-gold/20 hover:scale-110 active:scale-95 text-gold'
                : 'text-zinc-600 cursor-not-allowed opacity-40'
            }`}
            title="Scroll to Top (or double click to jump to the very top)"
            aria-label="Scroll to Top"
          >
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover/pod:-translate-y-0.5" />
          </button>

          {/* Center Progress Ring & Percentage Indicator (Clickable to open Section Jump Menu) */}
          <button
            type="button"
            onClick={() => setShowSectionMenu(!showSectionMenu)}
            className="relative w-9 h-9 sm:w-10 sm:h-10 my-1 rounded-full flex items-center justify-center group/progress cursor-pointer hover:bg-zinc-900 transition-colors"
            title="Click for quick section navigation"
            aria-label={`Scroll progress: ${scrollProgress}%. Click for quick section navigation`}
          >
            {/* SVG Circular Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="14"
                className="stroke-zinc-800"
                strokeWidth="2.5"
                fill="none"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                className="stroke-gold transition-all duration-150 ease-out"
                strokeWidth="2.5"
                strokeDasharray="88"
                strokeDashoffset={88 - (88 * scrollProgress) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <span className="font-mono text-[9px] sm:text-[10px] font-bold text-zinc-300 group-hover/progress:text-gold transition-colors">
              {scrollProgress}%
            </span>
          </button>

          {/* Scroll Down Button */}
          <button
            type="button"
            onClick={scrollToBottom}
            disabled={!canScrollDown}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
              canScrollDown
                ? 'text-zinc-200 hover:text-white hover:bg-gold/20 hover:scale-110 active:scale-95 text-gold'
                : 'text-zinc-600 cursor-not-allowed opacity-40'
            }`}
            title="Scroll to Bottom"
            aria-label="Scroll to Bottom"
          >
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover/pod:translate-y-0.5" />
          </button>
        </div>

        {/* Small floating hint label on mobile/desktop */}
        <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 mt-1.5 opacity-60 pointer-events-none hidden sm:block">
          Scroll
        </span>
      </motion.aside>

      {/* Quick Section Jump Popover Modal */}
      <AnimatePresence>
        {showSectionMenu && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center sm:justify-end sm:items-end p-4 sm:p-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSectionMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xs bg-zinc-950/98 backdrop-blur-2xl border border-zinc-800 rounded-3xl p-5 shadow-2xl z-50 pointer-events-auto sm:mr-16 sm:mb-16"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-900 mb-3">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-gold" />
                  <span className="text-xs font-serif text-white font-bold">Quick Section Jump</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSectionMenu(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                  aria-label="Close section menu"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Quick Stepper actions */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => { scrollToTop(); setShowSectionMenu(false); }}
                  className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-semibold text-zinc-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <ChevronsUp className="w-3.5 h-3.5 text-gold" />
                  <span>Top of Page</span>
                </button>
                <button
                  type="button"
                  onClick={() => { scrollToBottom(); setShowSectionMenu(false); }}
                  className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-semibold text-zinc-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <ChevronsDown className="w-3.5 h-3.5 text-gold" />
                  <span>Bottom of Page</span>
                </button>
              </div>

              {/* Section list */}
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                {SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => jumpToSection(sec.id)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-900/80 text-zinc-300 hover:text-gold transition-colors text-xs font-medium cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-gold transition-colors" />
                        <span>{sec.label}</span>
                      </div>
                      <span className="text-[10px] text-zinc-600 font-mono">#{sec.id}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
