import { motion, AnimatePresence } from 'motion/react';
import { Mail, MessageCircle, Phone, Menu, X, ArrowRight, Sparkles, LogIn, LogOut, Facebook, Youtube, Trash2, Camera, Upload, Info, Image as ImageIcon, Calendar, Headphones, BookOpen, HeartHandshake, Radio, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MINISTRY_NAME, LEADERS, CONTACT_INFO } from './constants';
import GivingHub from './components/GivingHub';
import PrayerSystem from './components/PrayerSystem';
import EventsCalendar from './components/EventsCalendar';
import AudioSermons from './components/AudioSermons';
import LiveStreamHero from './components/LiveStreamHero';
import { useAuth } from './lib/AuthContext';
import { login, logout } from './lib/firebase';
import { PageSection, firebaseService, DEFAULT_SECTIONS } from './lib/firebaseService';
import EditableSection from './components/EditableSection';
import ExcerptGallery from './components/ExcerptGallery';
import Blog from './components/Blog';
import SectionDivider from './components/SectionDivider';
import TestimonialCarousel from './components/TestimonialCarousel';
import Markdown from 'react-markdown';
import ThemeSwitcher from './components/ThemeSwitcher';
import StaffPortalModal from './components/StaffPortalModal';

const renderHeroTitle = (title: string) => {
  let displayTitle = title;
  if (!displayTitle || displayTitle.toLowerCase().includes("illuminating the soul")) {
    displayTitle = "Redefining the destinies of men through His Glorious Light";
  }

  return displayTitle.split(' ').map((word, i) => {
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
    if (cleanWord === 'destinies') {
      return (
        <span 
          key={i} 
          className="inline-block text-transparent bg-clip-text font-extrabold italic"
          style={{
            backgroundImage: 'linear-gradient(to right, var(--color-gold, #B45309), var(--theme-secondary, #16A34A), var(--color-gold, #B45309))',
            filter: 'drop-shadow(0 0 16px var(--theme-glow, rgba(212,175,55,0.4)))'
          }}
        >
          {word}{' '}
        </span>
      );
    }
    if (cleanWord === 'glorious') {
      return (
        <span 
          key={i} 
          className="inline-block text-transparent bg-clip-text font-semibold tracking-wide"
          style={{
            backgroundImage: 'linear-gradient(to right, var(--theme-primary, #15803D), var(--color-gold, #B45309), var(--theme-secondary, #16A34A))',
            filter: 'drop-shadow(0 0 12px var(--theme-glow, rgba(212,175,55,0.4)))'
          }}
        >
          {word}{' '}
        </span>
      );
    }
    if (cleanWord === 'light') {
      return (
        <span 
          key={i} 
          className="inline-block text-transparent bg-clip-text font-extrabold tracking-tight"
          style={{
            backgroundImage: 'linear-gradient(to right, var(--color-gold, #B45309), var(--theme-secondary, #16A34A), var(--color-gold, #B45309))',
            filter: 'drop-shadow(0 0 16px var(--theme-glow, rgba(212,175,55,0.4)))'
          }}
        >
          {word}{' '}
        </span>
      );
    }
    if (cleanWord === 'redefining') {
      return (
        <span 
          key={i} 
          className="inline-block font-bold"
          style={{ color: 'var(--color-gold, #B45309)' }}
        >
          {word}{' '}
        </span>
      );
    }
    if (cleanWord === 'soul') {
      return (
        <span 
          key={i} 
          className="italic glow-text font-serif"
          style={{ color: 'var(--color-gold, #B45309)' }}
        >
          {word}{' '}
        </span>
      );
    }
    return <span key={i} className="theme-heading-word">{word} </span>;
  });
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin: actualIsAdmin } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [aboutLightboxUrl, setAboutLightboxUrl] = useState<string | null>(null);
  const [isStreamLive, setIsStreamLive] = useState(false);
  const [isTogglingLive, setIsTogglingLive] = useState(false);
  const [adminToast, setAdminToast] = useState<string | null>(null);

  const handleToggleLiveDirect = async () => {
    setIsTogglingLive(true);
    const nextStatus = !isStreamLive;
    try {
      await firebaseService.setLiveStatus(nextStatus);
      setAdminToast(nextStatus ? 'Live broadcast is now ON AIR! Live indicator is active.' : 'Live broadcast switched to OFF-AIR.');
      setTimeout(() => setAdminToast(null), 3500);
    } catch (e) {
      console.error('Failed to toggle live status:', e);
      alert('Failed to update live status.');
    } finally {
      setIsTogglingLive(false);
    }
  };

  const handleAboutImageUpload = (file: File, section: PageSection) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        try {
          const rawDataUrl = event.target.result as string;
          await firebaseService.upsertSection({
            ...section,
            imageUrl: rawDataUrl
          });
        } catch (e) {
          alert('Failed to save image.');
        }
      }
    };
    reader.onerror = () => {
      alert('Error reading image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleAboutImageDelete = async (section: PageSection) => {
    if (window.confirm('Are you sure you want to delete the image from the About section?')) {
      await firebaseService.upsertSection({
        ...section,
        imageUrl: ''
      });
    }
  };
  
  // Interactive Edit Mode - strictly restricted to authenticated actualIsAdmin users
  const [isEditMode, setIsEditMode] = useState(() => {
    const saved = localStorage.getItem('is_edit_mode');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    if (actualIsAdmin) {
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
  }, [actualIsAdmin]);

  const toggleEditMode = () => {
    if (!actualIsAdmin) return;
    const nextVal = !isEditMode;
    setIsEditMode(nextVal);
    localStorage.setItem('is_edit_mode', String(nextVal));
  };

  // effectiveIsAdmin is true ONLY if user is authenticated admin AND edit mode is enabled
  const effectiveIsAdmin = actualIsAdmin && isEditMode;

  const [sections, setSections] = useState<PageSection[]>(DEFAULT_SECTIONS);
  const [isStaffPortalOpen, setIsStaffPortalOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('portal') === 'true' || params.get('admin') === 'true') {
      setIsStaffPortalOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('portal');
      url.searchParams.delete('admin');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  useEffect(() => {
    const unsub = firebaseService.subscribeSections((data) => {
      const correctedData = data.map(section => {
        let changed = false;
        let title = section.title;
        let subtitle = section.subtitle || '';
        let content = section.content || '';

        if (title.includes('Porche')) {
          title = title.replace(/Porche/g, 'Porch');
          changed = true;
        }
        if (title.includes('PORCHE')) {
          title = title.replace(/PORCHE/g, 'PORCH');
          changed = true;
        }
        if (subtitle.includes('Porche')) {
          subtitle = subtitle.replace(/Porche/g, 'Porch');
          changed = true;
        }
        if (subtitle.includes('PORCHE')) {
          subtitle = subtitle.replace(/PORCHE/g, 'PORCH');
          changed = true;
        }
        if (content.includes('Porche')) {
          content = content.replace(/Porche/g, 'Porch');
          changed = true;
        }
        if (content.includes('PORCHE')) {
          content = content.replace(/PORCHE/g, 'PORCH');
          changed = true;
        }

        if (changed && effectiveIsAdmin) {
          firebaseService.upsertSection({ ...section, title, subtitle, content });
        }

        return { ...section, title, subtitle, content };
      });

      if (correctedData.length === 0 && effectiveIsAdmin) {
        const initial: PageSection[] = [
          { 
            sectionId: 'hero', 
            title: "Redefining the destinies of men through His Glorious Light", 
            subtitle: `An oasis of revelation led by ${LEADERS.prophet} and ${LEADERS.pastor}.`,
            content: "Through your giving, we are able to reach the world with the message of illumination and excellence. Your seed is a testimony of your faith.",
            order: 0,
            imageUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=75&w=1280&auto=format&fit=crop"
          },
          {
            sectionId: 'about',
            title: 'Our Divine Mandate',
            subtitle: 'Enlightening hearts with the knowledge of God\'s glory.',
            content: "Photizo Porch Christian Assembly is more than a church; it is a portal of divine illumination. Our name, derived from the Greek 'Photizo,' signifies our sacred mandate to enlighten hearts and manifest kingdom excellence.\n\nUnder the leadership of Prophet Japeth Tsukwas, we are building a global community dedicated to supernatural manifestations and purposeful living.",
            order: 1,
            imageUrl: ""
          }
        ];
        initial.forEach(s => firebaseService.upsertSection(s));
      }

      if (effectiveIsAdmin && correctedData.length > 0) {
        const heroSec = correctedData.find(s => s.sectionId === 'hero');
        if (heroSec && (heroSec.title.toLowerCase().includes('illuminating') || heroSec.title === 'New Section')) {
          heroSec.title = "Redefining the destinies of men through His Glorious Light";
          firebaseService.upsertSection(heroSec);
        }

        const aboutSec = correctedData.find(s => s.sectionId === 'about');
        if (aboutSec && aboutSec.imageUrl && (aboutSec.imageUrl.includes('prophet_japhet') || aboutSec.imageUrl.includes('humanitarian'))) {
          aboutSec.imageUrl = "";
          firebaseService.upsertSection(aboutSec);
        }
      }

      const targetData = correctedData.length > 0 ? correctedData : DEFAULT_SECTIONS;
      setSections(targetData.filter(s => ['hero', 'about'].includes(s.sectionId)).sort((a, b) => (a.order || 0) - (b.order || 0)));
    });

    const unsubStream = firebaseService.subscribeStream((stream) => {
      setIsStreamLive(Boolean(stream?.isLive));
    });

    return () => {
      unsub();
      unsubStream();
    };
  }, [effectiveIsAdmin]);

  return (
    <div className="min-h-screen">
      {/* Admin Floating Control Dashboard Bar */}
      {actualIsAdmin && (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-wrap items-center gap-2.5 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 p-2 rounded-full shadow-2xl">
          {/* Direct Manual 'isLive' Toggle Switch */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 shadow-inner">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isStreamLive ? 'bg-red-500 animate-ping' : 'bg-zinc-600'}`} />
              <Radio size={13} className={isStreamLive ? 'text-red-500' : 'text-zinc-500'} />
              <span className="text-[11px] font-bold text-zinc-300 tracking-wider uppercase hidden sm:inline">Broadcast</span>
            </div>
            
            <button
              type="button"
              onClick={handleToggleLiveDirect}
              disabled={isTogglingLive}
              className={`relative w-12 h-6 rounded-full p-0.5 transition-all cursor-pointer ${
                isStreamLive 
                  ? 'bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.6)]' 
                  : 'bg-zinc-800 hover:bg-zinc-700'
              }`}
              title={isStreamLive ? "Broadcast is ON AIR. Click to switch to OFF AIR." : "Broadcast is OFF AIR. Click to switch to LIVE ON AIR."}
              aria-label="Toggle live broadcast on or off"
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform flex items-center justify-center ${isStreamLive ? 'translate-x-6' : ''}`}>
                {isStreamLive && <span className="w-1.5 h-1.5 rounded-full bg-red-600" />}
              </div>
            </button>
            <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isStreamLive ? 'text-red-400 animate-pulse' : 'text-zinc-500'}`}>
              {isStreamLive ? 'LIVE' : 'OFF'}
            </span>
          </div>

          {/* Edit Mode Toggle */}
          <button
            onClick={toggleEditMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
              isEditMode 
                ? 'bg-gold text-zinc-950 font-bold shadow-[0_0_15px_var(--theme-glow,rgba(212,175,55,0.3))]' 
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isEditMode ? 'animate-pulse text-zinc-950' : 'text-gold'}`} />
            <span className="hidden sm:inline">{isEditMode ? 'Edit Mode: Active' : 'Edit Mode: Inactive'}</span>
            <span className="sm:hidden">{isEditMode ? 'Edit: On' : 'Edit: Off'}</span>
          </button>

          {/* Staff Portal Hub */}
          <button
            onClick={() => setIsStaffPortalOpen(true)}
            className="p-2 bg-zinc-900 border border-zinc-800 text-gold hover:text-white rounded-full transition-colors cursor-pointer"
            title="Open Staff & Admin Portal"
          >
            <ShieldCheck size={15} />
          </button>

          {/* Admin Logout */}
          <button 
            onClick={logout}
            className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-500 rounded-full transition-colors cursor-pointer"
            title="Logout Admin"
          >
            <LogOut size={15} />
          </button>
        </div>
      )}

      {/* Admin Action Feedback Toast */}
      <AnimatePresence>
        {adminToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-[110] max-w-sm px-4 py-3 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-gold/40 shadow-2xl flex items-center gap-3 text-xs text-white"
          >
            <div className={`w-2.5 h-2.5 rounded-full ${isStreamLive ? 'bg-red-500 animate-ping' : 'bg-gold'}`} />
            <span className="flex-1 font-medium">{adminToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#" className="flex flex-col group">
            <span className="text-lg font-bold tracking-tighter text-white glow-text group-hover:text-gold transition-colors">{MINISTRY_NAME}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Excellence & Revelation</span>
          </a>
          
          {/* Navigation Menu Links */}
          <div className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium">
            <a href="#about" className="hover:text-gold transition-colors">About Us</a>
            <a href="#gallery" className="hover:text-gold transition-colors">Gallery</a>
            <a href="#calendar" className="hover:text-gold transition-colors">Calendar</a>
            <a href="#sermons" className="hover:text-gold transition-colors">Sermons</a>
            <a href="#blog" className="hover:text-gold transition-colors">Gazette</a>
            <a href="#testimonies" className="hover:text-gold transition-colors">Testimonies</a>
            <a href="#giving" className="hover:text-gold transition-colors">Giving</a>
            <a href="#contact" className="hover:text-gold transition-colors">Contact</a>
          </div>

          {/* Standalone Action Controls - Distinctly Separated from Menu */}
          <div className="hidden md:flex items-center gap-3 pl-4 border-l border-zinc-800/80">
            <ThemeSwitcher variant="standalone" />

            <a 
              href="#live" 
              className={`px-5 py-2.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isStreamLive 
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse' 
                  : 'bg-zinc-100 text-zinc-950 hover:bg-gold hover:text-white'
              }`}
            >
              {isStreamLive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>● LIVE NOW</span>
                </>
              ) : (
                <>
                  <Radio size={14} />
                  <span>Live Service</span>
                </>
              )}
            </a>
          </div>

          {/* Mobile Right Controls: Standalone Theme Switcher + Distinct Hamburger Menu Button */}
          <div className="md:hidden flex items-center gap-2.5">
            <ThemeSwitcher variant="standalone" />
            <button 
              className="flex items-center justify-center p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-all cursor-pointer" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X size={22} className="text-gold" /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Dropdown Menu - Scrollable */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden border-t border-zinc-900 bg-zinc-950/98 backdrop-blur-2xl shadow-2xl max-h-[calc(100vh-5rem)] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-zinc-800"
            >
              <div className="p-6 flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-medium">
                  <a 
                    href="#about" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-gold/50 hover:bg-zinc-900 text-zinc-200 hover:text-gold transition-all"
                  >
                    <Info size={18} className="text-gold shrink-0" />
                    <span>About Us</span>
                  </a>
                  <a 
                    href="#gallery" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-gold/50 hover:bg-zinc-900 text-zinc-200 hover:text-gold transition-all"
                  >
                    <ImageIcon size={18} className="text-gold shrink-0" />
                    <span>Gallery</span>
                  </a>
                  <a 
                    href="#calendar" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-gold/50 hover:bg-zinc-900 text-zinc-200 hover:text-gold transition-all"
                  >
                    <Calendar size={18} className="text-gold shrink-0" />
                    <span>Calendar</span>
                  </a>
                  <a 
                    href="#sermons" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-gold/50 hover:bg-zinc-900 text-zinc-200 hover:text-gold transition-all"
                  >
                    <Headphones size={18} className="text-gold shrink-0" />
                    <span>Audio Sermons</span>
                  </a>
                  <a 
                    href="#blog" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-gold/50 hover:bg-zinc-900 text-zinc-200 hover:text-gold transition-all"
                  >
                    <BookOpen size={18} className="text-gold shrink-0" />
                    <span>Gazette & Articles</span>
                  </a>
                  <a 
                    href="#testimonies" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-gold/50 hover:bg-zinc-900 text-zinc-200 hover:text-gold transition-all"
                  >
                    <Sparkles size={18} className="text-gold shrink-0" />
                    <span>Testimonies</span>
                  </a>
                  <a 
                    href="#giving" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-gold/50 hover:bg-zinc-900 text-zinc-200 hover:text-gold transition-all"
                  >
                    <HeartHandshake size={18} className="text-gold shrink-0" />
                    <span>Giving Hub</span>
                  </a>
                  <a 
                    href="#contact" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-gold/50 hover:bg-zinc-900 text-zinc-200 hover:text-gold transition-all"
                  >
                    <Mail size={18} className="text-gold shrink-0" />
                    <span>Contact Us</span>
                  </a>
                </div>

                <div className="pt-2 border-t border-zinc-900/80 flex flex-col gap-2">
                  <a 
                    href="#live" 
                    onClick={() => setIsMenuOpen(false)}
                    className={`w-full flex items-center justify-center gap-2 py-3 font-bold rounded-xl shadow-lg transition-all text-center text-sm ${
                      isStreamLive
                        ? 'bg-red-600 text-white shadow-red-600/30 animate-pulse'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 hover:brightness-110'
                    }`}
                  >
                    <Radio size={16} className={isStreamLive ? 'animate-pulse' : ''} />
                    <span>{isStreamLive ? '● WATCH LIVE BROADCAST NOW' : 'Live Service Broadcast'}</span>
                  </a>

                  {actualIsAdmin ? (
                    <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-zinc-900 border border-gold/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gold font-bold">
                          <ShieldCheck size={16} /> Admin Authenticated
                        </div>
                        <button 
                          onClick={() => { logout(); setIsMenuOpen(false); }}
                          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                        >
                          <LogOut size={14} /> Logout
                        </button>
                      </div>

                      {/* Direct Mobile Live Toggle Switch */}
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                        <div className="flex items-center gap-1.5">
                          <Radio size={14} className={isStreamLive ? 'text-red-500 animate-pulse' : 'text-zinc-500'} />
                          <span className="text-xs font-semibold text-zinc-300">Live Status:</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleToggleLiveDirect}
                            disabled={isTogglingLive}
                            className={`relative w-12 h-6 rounded-full p-0.5 transition-all cursor-pointer ${
                              isStreamLive 
                                ? 'bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.5)]' 
                                : 'bg-zinc-800'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform flex items-center justify-center ${isStreamLive ? 'translate-x-6' : ''}`}>
                              {isStreamLive && <span className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                            </div>
                          </button>
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isStreamLive ? 'text-red-400 animate-pulse' : 'text-zinc-500'}`}>
                            {isStreamLive ? 'ON AIR' : 'OFF'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setIsStaffPortalOpen(true); setIsMenuOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-gold border border-zinc-800 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
                    >
                      <ShieldCheck size={16} className="text-gold" />
                      <span>Staff & Admin Portal Sign In</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Backdrop Overlay for Mobile Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 top-20 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Dynamic Sections */}
      <main>
        <LiveStreamHero isAdmin={effectiveIsAdmin} />
        {sections.map((section) => (
          <EditableSection key={section.sectionId} section={section} isAdmin={effectiveIsAdmin}>
            {section.sectionId === 'hero' ? (
              <header className="relative pt-48 pb-24 px-6 min-h-[90vh] flex flex-col items-center justify-center text-center overflow-hidden">
                <div className="absolute inset-0 glow-bg -z-10" />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-full -z-20 opacity-20"
                >
                  <div className="w-[800px] h-[800px] bg-gold/20 blur-[120px] rounded-full mx-auto" />
                </motion.div>

                <div className="max-w-4xl">
                  <h1 className="text-6xl md:text-8xl font-serif leading-[1.1] mb-8">
                    {renderHeroTitle(section.title)}
                  </h1>
                  <p className="text-xl md:text-2xl text-zinc-400 mb-10 max-w-2xl mx-auto font-light">
                    {section.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a href="#about" className="group flex items-center gap-2 bg-gold text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_30px_var(--theme-glow,rgba(212,175,55,0.4))] transition-all">
                      Our Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a href="#giving" className="px-8 py-4 rounded-full border border-zinc-800 hover:bg-zinc-900 transition-all text-lg font-medium text-zinc-300">
                      Seed of Faith
                    </a>
                  </div>
                </div>
              </header>
            ) : section.sectionId === 'about' ? (
              <section id="about" className="py-24 px-6 border-y border-zinc-900 bg-zinc-950/50">
                <div className={`max-w-6xl mx-auto ${section.imageUrl || effectiveIsAdmin ? 'grid md:grid-cols-2 gap-16 items-center' : 'max-w-3xl text-center'}`}>
                  {(section.imageUrl || effectiveIsAdmin) && (
                    <div 
                      className={`relative aspect-[4/5] rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 ${
                        dragActive 
                          ? 'border-gold shadow-[0_0_25px_var(--theme-glow-soft,rgba(212,175,55,0.25))]' 
                          : 'hover:border-zinc-700'
                      } group/img transition-all`}
                      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                        if (e.dataTransfer.files?.[0]) {
                          handleAboutImageUpload(e.dataTransfer.files[0], section);
                        }
                      }}
                    >
                      {section.imageUrl ? (
                        <>
                          <img 
                            src={section.imageUrl || "/user_uploads/upload_6_Engrossed_in_worship.webp"} 
                            alt="Ministry" 
                            decoding="async"
                            onClick={() => setAboutLightboxUrl(section.imageUrl || "/user_uploads/upload_6_Engrossed_in_worship.webp")}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105 cursor-pointer"
                            title="Click to view original photo full screen"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const src = e.currentTarget.src;
                              if (src.endsWith('.webp')) {
                                e.currentTarget.src = src.replace(/\.webp$/, '.jpeg');
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent pointer-events-none" />
                          
                          {/* Admin Overlay Controls directly on image */}
                          {effectiveIsAdmin && (
                            <div className="absolute inset-0 flex flex-col justify-between p-6 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity z-10">
                              <div className="flex justify-between items-start">
                                <span className="bg-zinc-950/90 text-gold text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-zinc-800">
                                  About Image
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAboutLightboxUrl(section.imageUrl!);
                                    }}
                                    className="p-2.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-gold rounded-full transition-all cursor-pointer shadow-lg hover:scale-105"
                                    title="View Original Photo"
                                  >
                                    <ImageIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAboutImageDelete(section);
                                    }}
                                    className="p-2.5 bg-red-950/90 hover:bg-red-600 border border-red-500/30 text-red-200 hover:text-white rounded-full transition-all cursor-pointer shadow-lg hover:scale-105"
                                    title="Delete Image"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex justify-center">
                                <label className="flex items-center gap-2 px-5 py-3 bg-gold hover:bg-amber-500 text-zinc-950 font-bold text-xs rounded-full cursor-pointer shadow-xl hover:scale-105 active:scale-95 transition-all">
                                  <Camera className="w-4 h-4" />
                                  Change Image
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) {
                                        handleAboutImageUpload(e.target.files[0], section);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        /* Empty/Deleted State (Only visible to admin to upload) */
                        effectiveIsAdmin && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-zinc-800 hover:border-gold/50 rounded-3xl transition-all animate-pulse">
                            <div className="w-16 h-16 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-500">
                              <Upload className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-bold text-zinc-300 mb-1">Add About Image</h4>
                            <p className="text-xs text-zinc-500 mb-6 max-w-xs">Drag and drop an image file here, or click the button below to browse</p>
                            <label className="flex items-center gap-2 px-5 py-3 bg-zinc-900 hover:bg-zinc-850 text-gold border border-gold/30 hover:border-gold/60 font-bold text-xs rounded-full cursor-pointer shadow-xl transition-all">
                              <Camera className="w-4 h-4" />
                              Browse Image
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleAboutImageUpload(e.target.files[0], section);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        )
                      )}
                    </div>
                  )}
                  <div className={section.imageUrl || effectiveIsAdmin ? '' : 'max-w-3xl mx-auto'}>
                    <h2 className="text-4xl md:text-5xl font-serif mb-8 glow-text">{section.title}</h2>
                    <div className="prose prose-invert max-w-none text-zinc-400 text-lg leading-relaxed space-y-6">
                      <Markdown>{section.content}</Markdown>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <section className="py-24 px-6 border-b border-zinc-900">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-4xl font-serif mb-8 glow-text">{section.title}</h2>
                  {section.imageUrl && (
                    <img 
                      src={section.imageUrl} 
                      className="w-full h-64 object-cover rounded-3xl mb-8" 
                      alt={section.title} 
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer" 
                    />
                  )}
                  <div className="prose prose-invert text-zinc-400 text-lg">
                    <Markdown>{section.content}</Markdown>
                  </div>
                </div>
              </section>
            )}
          </EditableSection>
        ))}
      </main>

      <SectionDivider variant="beams" icon="sun" label="Photizo Light & Excerpts" />

      <ExcerptGallery isAdmin={effectiveIsAdmin} />

      <SectionDivider variant="sacred-emblem" icon="star" label="Assembly Gatherings & Events" />

      <EventsCalendar isAdmin={effectiveIsAdmin} />

      <SectionDivider variant="line-glow" icon="flame" label="Voice of Prophetic Revelation" />

      <AudioSermons isAdmin={effectiveIsAdmin} />

      <SectionDivider variant="wave-glow" icon="sparkles" label="Articles & Divine Wisdom" />

      <Blog isAdmin={effectiveIsAdmin} />

      <SectionDivider variant="beams" icon="shield" label="Covenant Prayer Altar" />

      <PrayerSystem isAdmin={effectiveIsAdmin} />

      <SectionDivider variant="sacred-emblem" icon="sparkles" label="Living Testimonies of Grace" />

      <TestimonialCarousel isAdmin={effectiveIsAdmin} />

      <SectionDivider variant="beams" icon="crown" label="Seed of Faith & Kingdom Giving" />

      <GivingHub />

      <SectionDivider variant="line-glow" icon="sparkles" label="Connect & Fellowship" />

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-serif mb-16 glow-text">Connect with Us</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <a href={`https://wa.me/${CONTACT_INFO.whatsapp.replace(/\s/g, '')}`} target="_blank" rel="noreferrer" className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-green-500/50 transition-all group">
              <MessageCircle className="w-8 h-8 text-green-500 mb-4 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-bold mb-2">WhatsApp</h3>
              <p className="text-zinc-500 text-sm">{CONTACT_INFO.whatsapp}</p>
            </a>
            <a href={CONTACT_INFO.facebook} target="_blank" rel="noreferrer" className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 transition-all group">
              <Facebook className="w-8 h-8 text-blue-500 mb-4 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-bold mb-2">Facebook</h3>
              <p className="text-zinc-500 text-sm">Follow our Page</p>
            </a>
            <a href={CONTACT_INFO.youtube} target="_blank" rel="noreferrer" className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-red-500/50 transition-all group">
              <Youtube className="w-8 h-8 text-red-500 mb-4 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-bold mb-2">YouTube</h3>
              <p className="text-zinc-500 text-sm">Subscribe to Channel</p>
            </a>
            <a href={`mailto:${CONTACT_INFO.email}`} className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-gold/50 transition-all group">
              <Mail className="w-8 h-8 text-gold mb-4 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="font-bold mb-2">Email Us</h3>
              <p className="text-zinc-500 text-sm">{CONTACT_INFO.email}</p>
            </a>
            <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-center">
              <Phone className="w-8 h-8 text-zinc-400 mb-4 mx-auto" />
              <h3 className="font-bold mb-2">Counseling</h3>
              <p className="text-zinc-500 text-sm">Mon - Fri: 10am - 4pm</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-xl font-bold glow-text tracking-tighter mb-1">{MINISTRY_NAME}</span>
            <p className="text-zinc-600 text-sm">
              &copy; <span>{new Date().getFullYear()}</span> Photizo Porch. All Rights Reserved.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-xs text-zinc-500 uppercase tracking-widest font-medium">
            <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
            <a href={CONTACT_INFO.facebook} target="_blank" rel="noreferrer" className="hover:text-gold transition-colors flex items-center gap-1">
              <Facebook size={12} /> Facebook
            </a>
            <a href={CONTACT_INFO.youtube} target="_blank" rel="noreferrer" className="hover:text-gold transition-colors flex items-center gap-1">
              <Youtube size={12} /> YouTube
            </a>
            {!actualIsAdmin ? (
              <button 
                onClick={() => setIsStaffPortalOpen(true)}
                className="hover:text-gold transition-colors cursor-pointer flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity font-semibold"
                title="Open Staff & Admin Portal"
              >
                <ShieldCheck size={14} className="text-gold" />
                <span>Staff Portal</span>
              </button>
            ) : (
              <button
                onClick={() => setIsStaffPortalOpen(true)}
                className="text-gold flex items-center gap-1.5 cursor-pointer hover:underline font-semibold"
                title="Manage Sanctuary Controls & Staff Portal"
              >
                <Sparkles size={14} className="animate-pulse" />
                <span>Admin Active ({user?.email})</span>
              </button>
            )}
          </div>
        </div>
      </footer>
      {/* Lightbox Modal for About Section Photo */}
      <AnimatePresence>
        {aboutLightboxUrl && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-between"
            >
              <div className="w-full flex justify-between items-center p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl mb-4">
                <span className="text-xs font-mono text-gold uppercase tracking-wider">About Section Original Photo</span>
                <button
                  onClick={() => setAboutLightboxUrl(null)}
                  className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-full transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden p-2">
                <img
                  src={aboutLightboxUrl}
                  alt="Original About Photo"
                  loading="lazy"
                  decoding="async"
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-zinc-800"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Persistent Floating Theme Switcher Widget */}
      <ThemeSwitcher variant="floating" />

      {/* Staff & Admin Portal Modal */}
      <StaffPortalModal
        isOpen={isStaffPortalOpen}
        onClose={() => setIsStaffPortalOpen(false)}
        isStreamLive={isStreamLive}
        onToggleLive={handleToggleLiveDirect}
        isEditMode={isEditMode}
        onToggleEditMode={toggleEditMode}
      />
    </div>
  );
}
