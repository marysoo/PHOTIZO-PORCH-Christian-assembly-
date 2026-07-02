import { motion, AnimatePresence } from 'motion/react';
import { Mail, MessageCircle, Phone, Menu, X, ArrowRight, Sparkles, LogIn, LogOut, Facebook, Youtube } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MINISTRY_NAME, LEADERS, CONTACT_INFO } from './constants';
import GivingHub from './components/GivingHub';
import PrayerSystem from './components/PrayerSystem';
import EventsCalendar from './components/EventsCalendar';
import AudioSermons from './components/AudioSermons';
import LiveStreamHero from './components/LiveStreamHero';
import { useAuth } from './lib/AuthContext';
import { login, logout } from './lib/firebase';
import { PageSection, firebaseService } from './lib/firebaseService';
import EditableSection from './components/EditableSection';
import Markdown from 'react-markdown';

const renderHeroTitle = (title: string) => {
  let displayTitle = title;
  if (!displayTitle || displayTitle.toLowerCase().includes("illuminating the soul")) {
    displayTitle = "Redefining the destinies of men through His Glorious Light";
  }

  return displayTitle.split(' ').map((word, i) => {
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
    if (cleanWord === 'destinies') {
      return (
        <span key={i} className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 font-extrabold italic drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">
          {word}{' '}
        </span>
      );
    }
    if (cleanWord === 'glorious') {
      return (
        <span key={i} className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-amber-200 font-semibold tracking-wide drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">
          {word}{' '}
        </span>
      );
    }
    if (cleanWord === 'light') {
      return (
        <span key={i} className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-amber-100 font-extrabold tracking-tight glow-text drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]">
          {word}{' '}
        </span>
      );
    }
    if (cleanWord === 'redefining') {
      return (
        <span key={i} className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 font-bold">
          {word}{' '}
        </span>
      );
    }
    if (cleanWord === 'soul') {
      return (
        <span key={i} className="text-gold italic glow-text font-serif">
          {word}{' '}
        </span>
      );
    }
    return <span key={i} className="text-zinc-100">{word} </span>;
  });
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const [sections, setSections] = useState<PageSection[]>([]);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [showPortal, setShowPortal] = useState(() => {
    return localStorage.getItem('show_portal') === 'true';
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('portal') === 'true' || params.get('admin') === 'true') {
      localStorage.setItem('show_portal', 'true');
      setShowPortal(true);
      // Clean up URL parameters to keep the browser address bar clean
      const url = new URL(window.location.href);
      url.searchParams.delete('portal');
      url.searchParams.delete('admin');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  useEffect(() => {
    const unsub = firebaseService.subscribeSections((data) => {
      // Automatically correct "Porche" to "Porch" in title, subtitle, or content
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

        if (changed && isAdmin) {
          firebaseService.upsertSection({ ...section, title, subtitle, content });
        }

        return { ...section, title, subtitle, content };
      });

      if (correctedData.length === 0 && isAdmin) {
        // Initial bootstrap if empty
        const initial: PageSection[] = [
          { 
            sectionId: 'hero', 
            title: "Redefining the destinies of men through His Glorious Light", 
            subtitle: `An oasis of revelation led by ${LEADERS.prophet} and ${LEADERS.pastor}.`,
            content: "Through your giving, we are able to reach the world with the message of illumination and excellence. Your seed is a testimony of your faith.",
            order: 0,
            imageUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2061&auto=format&fit=crop"
          },
          {
            sectionId: 'about',
            title: 'Our Divine Mandate',
            subtitle: 'Enlightening hearts with the knowledge of God\'s glory.',
            content: "Photizo Porch Christian Assembly is more than a church; it is a portal of divine illumination. Our name, derived from the Greek 'Photizo,' signifies our sacred mandate to enlighten hearts and manifest kingdom excellence.\n\nUnder the leadership of Prophet Japeth Tsukwas, we are building a global community dedicated to supernatural manifestations and purposeful living.",
            order: 1,
            imageUrl: "https://images.unsplash.com/photo-1444464666168-49d633b86747?q=80&w=2069&auto=format&fit=crop"
          }
        ];
        initial.forEach(s => firebaseService.upsertSection(s));
      }

      // Auto-migrate hero title if it contains the old phrase for admin
      if (isAdmin && correctedData.length > 0) {
        const heroSec = correctedData.find(s => s.sectionId === 'hero');
        if (heroSec && (heroSec.title.toLowerCase().includes('illuminating') || heroSec.title === 'New Section')) {
          heroSec.title = "Redefining the destinies of men through His Glorious Light";
          firebaseService.upsertSection(heroSec);
        }
      }

      // Filter to only allow core sections
      setSections(correctedData.filter(s => ['hero', 'about'].includes(s.sectionId)).sort((a, b) => (a.order || 0) - (b.order || 0)));
    });
    return () => unsub();
  }, [isAdmin]);

  return (
    <div className="min-h-screen">
      {/* Admin Bar */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
          <button 
            onClick={logout}
            className="p-4 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full shadow-2xl hover:text-red-500 transition-colors"
            title="Logout Admin"
          >
            <LogOut size={24} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tighter text-white glow-text">{MINISTRY_NAME}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Excellence & Revelation</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#about" className="hover:text-gold transition-colors">About Us</a>
            <a href="#calendar" className="hover:text-gold transition-colors">Calendar</a>
            <a href="#sermons" className="hover:text-gold transition-colors">Sermons</a>
            <a href="#giving" className="hover:text-gold transition-colors">Giving</a>
            <a href="#contact" className="hover:text-gold transition-colors">Contact</a>
            <button className="bg-zinc-100 text-zinc-950 px-5 py-2.5 rounded-full font-bold hover:bg-gold hover:text-white transition-all cursor-pointer">
              Live Service
            </button>
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Sidebar Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 z-[60] bg-zinc-950 p-8 flex flex-col gap-8 md:hidden"
          >
            <button onClick={() => setIsMenuOpen(false)} className="self-end"><X size={32} /></button>
            <div className="flex flex-col gap-6 text-2xl font-serif">
              <a href="#about" onClick={() => setIsMenuOpen(false)}>About Us</a>
              <a href="#calendar" onClick={() => setIsMenuOpen(false)}>Calendar</a>
              <a href="#sermons" onClick={() => setIsMenuOpen(false)}>Sermons</a>
              <a href="#giving" onClick={() => setIsMenuOpen(false)}>Giving</a>
              <a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a>
            </div>
            {!user && (
              <button 
                onClick={() => { login(); setIsMenuOpen(false); }}
                className="mt-auto flex items-center gap-2 text-zinc-500 border-t border-zinc-900 pt-6"
              >
                <LogIn size={20} /> Admin Access
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Sections */}
      <main>
        <LiveStreamHero isAdmin={isAdmin} />
        {sections.map((section) => (
          <EditableSection key={section.sectionId} section={section} isAdmin={isAdmin}>
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
                    <a href="#about" className="group flex items-center gap-2 bg-gold text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all">
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
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden group">
                    <img 
                      src={section.imageUrl || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2069&auto=format&fit=crop"} 
                      alt="Ministry" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                  </div>
                  <div>
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
                    <img src={section.imageUrl} className="w-full h-64 object-cover rounded-3xl mb-8" alt={section.title} referrerPolicy="no-referrer" />
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

      <EventsCalendar isAdmin={isAdmin} />

      <AudioSermons isAdmin={isAdmin} />

      <PrayerSystem isAdmin={isAdmin} />

      <GivingHub />

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
            {showPortal && (
              !user ? (
                <button 
                  onClick={login}
                  className="hover:text-gold transition-colors cursor-pointer flex items-center gap-1 opacity-40 hover:opacity-100 transition-opacity"
                >
                  <LogIn size={12} /> Staff Portal
                </button>
              ) : (
                <span className="text-gold flex items-center gap-1 animate-pulse">
                  <Sparkles size={14} /> Admin Active
                </span>
              )
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
