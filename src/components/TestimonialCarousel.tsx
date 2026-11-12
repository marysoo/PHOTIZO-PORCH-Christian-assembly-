import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Quote, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Play, 
  Pause, 
  MapPin, 
  Calendar, 
  HeartHandshake, 
  X, 
  Send,
  SlidersHorizontal,
  Flame,
  Award
} from 'lucide-react';
import { firebaseService, Testimonial, INITIAL_TESTIMONIALS } from '../lib/firebaseService';

interface TestimonialCarouselProps {
  isAdmin: boolean;
}

const CATEGORIES = [
  'Healing & Restoration',
  'Financial Breakthrough',
  'Supernatural Favor',
  'Divine Fruitfulness',
  'Spiritual Deliverance',
  'Academic & Career Elevation',
  'Family & Marriage Restoration',
  'Praise Report'
];

export default function TestimonialCarousel({ isAdmin }: TestimonialCarouselProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isModerationOpen, setIsModerationOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // Member share form state
  const [shareForm, setShareForm] = useState({
    name: '',
    title: '',
    category: CATEGORIES[0],
    location: '',
    date: new Date().toISOString().split('T')[0],
    story: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Admin moderation filter
  const [moderationTab, setModerationTab] = useState<'pending' | 'approved' | 'all'>('pending');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const SLIDE_DURATION = 7000; // 7 seconds per slide

  // Load and seed testimonials from Firestore
  useEffect(() => {
    // Seed initial entries if Firestore is empty
    firebaseService.seedInitialTestimonials();

    const unsub = firebaseService.subscribeTestimonials((data) => {
      if (data && data.length > 0) {
        setTestimonials(data);
      } else {
        // Fallback to initial seed if network or firestore is populating
        setTestimonials(INITIAL_TESTIMONIALS.map((t, idx) => ({ ...t, id: `seed_${idx}` })));
      }
    });

    return () => unsub();
  }, []);

  // Filter list for the public carousel: Admins can view all, visitors only see approved
  const displayItems = testimonials.filter(t => isAdmin ? true : t.status === 'approved');
  const pendingCount = testimonials.filter(t => t.status === 'pending').length;

  // Safe current index clamp
  const activeIndex = displayItems.length > 0 ? (((currentIndex % displayItems.length) + displayItems.length) % displayItems.length) : 0;
  const currentTestimonial = displayItems[activeIndex];

  const handleNext = useCallback(() => {
    if (displayItems.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % displayItems.length);
    setProgress(0);
  }, [displayItems.length]);

  const handlePrev = useCallback(() => {
    if (displayItems.length <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + displayItems.length) % displayItems.length);
    setProgress(0);
  }, [displayItems.length]);

  // Autoplay timer with progress bar
  useEffect(() => {
    if (!isPlaying || isHovered || displayItems.length <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    setProgress(0);
    const stepTime = 50;
    const increment = (stepTime / SLIDE_DURATION) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + increment;
      });
    }, stepTime);

    timerRef.current = setInterval(() => {
      handleNext();
    }, SLIDE_DURATION);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, isHovered, displayItems.length, handleNext, currentIndex]);

  // Submit new testimony from church member
  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareForm.name.trim() || !shareForm.title.trim() || !shareForm.story.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await firebaseService.submitTestimonial({
        name: shareForm.name.trim(),
        title: shareForm.title.trim(),
        category: shareForm.category,
        location: shareForm.location.trim() || 'Assembly Member',
        date: shareForm.date || new Date().toISOString().split('T')[0],
        story: shareForm.story.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsShareModalOpen(false);
        setShareForm({
          name: '',
          title: '',
          category: CATEGORIES[0],
          location: '',
          date: new Date().toISOString().split('T')[0],
          story: ''
        });
      }, 2500);
    } catch (err) {
      console.error('Error submitting testimony:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin updates
  const handleUpdateStatus = async (id: string, status: 'approved' | 'pending' | 'rejected') => {
    await firebaseService.updateTestimonialStatus(id, status);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this testimony?')) {
      await firebaseService.deleteTestimonial(id);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    await firebaseService.upsertTestimonial(editingItem);
    setEditingItem(null);
  };

  const handleCreateAdminTestimony = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareForm.name || !shareForm.title || !shareForm.story) return;

    await firebaseService.submitTestimonial({
      name: shareForm.name.trim(),
      title: shareForm.title.trim(),
      category: shareForm.category,
      location: shareForm.location.trim() || 'Assembly Family',
      date: shareForm.date || new Date().toISOString().split('T')[0],
      story: shareForm.story.trim(),
      status: 'approved',
      createdAt: new Date().toISOString()
    });

    setIsCreatingAdmin(false);
    setShareForm({
      name: '',
      title: '',
      category: CATEGORIES[0],
      location: '',
      date: new Date().toISOString().split('T')[0],
      story: ''
    });
  };

  // Slide animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 260, damping: 26 },
        opacity: { duration: 0.35 },
        scale: { duration: 0.35 }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring' as const, stiffness: 260, damping: 26 },
        opacity: { duration: 0.25 }
      }
    })
  };

  return (
    <section 
      id="testimonies" 
      className="py-24 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900/60 to-zinc-950"
    >
      {/* Radiant ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gold/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-bold uppercase tracking-widest mb-3">
              <Sparkles size={14} className="animate-spin text-amber-400" />
              <span>Living Testimonies of Grace</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-white glow-text tracking-tight">
              What God Has Done
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-xl font-light">
              "And they overcame him by the blood of the Lamb and by the word of their testimony." Revelations 12:11
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-gold hover:opacity-90 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_var(--theme-glow,rgba(212,175,55,0.3))] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <HeartHandshake size={16} />
              <span>Share Your Story</span>
            </button>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsModerationOpen(true)}
                  className="relative flex items-center gap-2 px-4 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-gold/40 text-gold font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  title="Admin Testimonial Moderation"
                >
                  <ShieldCheck size={16} />
                  <span>Moderation Desk</span>
                  {pendingCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-zinc-950 font-extrabold animate-pulse">
                      {pendingCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setIsCreatingAdmin(true)}
                  className="p-3 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-gold transition-colors cursor-pointer"
                  title="Directly add approved testimony"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Carousel Container */}
        {displayItems.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-zinc-900/40 border border-zinc-800/80">
            <Award size={48} className="mx-auto text-gold/60 mb-4" />
            <h3 className="text-xl font-serif text-zinc-200 mb-2">No Approved Testimonies Yet</h3>
            <p className="text-zinc-500 text-sm mb-6 max-w-md mx-auto">
              Be the first to testify of God's miraculous goodness and supernatural power at Photizo Porch.
            </p>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-6 py-2.5 bg-gold text-zinc-950 rounded-full font-bold text-xs uppercase tracking-wider"
            >
              Share Testimony
            </button>
          </div>
        ) : (
          <div 
            className="relative rounded-3xl bg-zinc-900/70 border border-zinc-800/90 shadow-2xl backdrop-blur-xl overflow-hidden group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Auto-Slide Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-950/80 z-20">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Admin Banner & Inline Controls for Current Slide */}
            {isAdmin && currentTestimonial && (
              <div className="px-6 py-3 bg-zinc-950/90 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs z-20 relative">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 uppercase tracking-widest font-mono text-[10px]">Current Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 ${
                    currentTestimonial.status === 'approved' 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                      : currentTestimonial.status === 'pending'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                      : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}>
                    {currentTestimonial.status === 'approved' && <CheckCircle2 size={11} />}
                    {currentTestimonial.status === 'pending' && <Clock size={11} />}
                    {currentTestimonial.status === 'rejected' && <XCircle size={11} />}
                    {currentTestimonial.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {currentTestimonial.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(currentTestimonial.id!, 'approved')}
                      className="px-3 py-1 rounded-md bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white font-semibold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 size={12} /> Approve
                    </button>
                  )}
                  {currentTestimonial.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(currentTestimonial.id!, 'rejected')}
                      className="px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => setEditingItem(currentTestimonial)}
                    className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-gold transition-all cursor-pointer"
                    title="Edit Testimony Content"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(currentTestimonial.id!)}
                    className="p-1.5 rounded-md bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white transition-all cursor-pointer"
                    title="Delete Testimony"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Slide Body */}
            <div className="relative min-h-[380px] sm:min-h-[340px] p-8 sm:p-12 md:p-16 flex flex-col justify-between overflow-hidden">
              {/* Giant background quotation mark */}
              <Quote className="absolute right-6 -bottom-6 w-48 h-48 text-gold/5 pointer-events-none select-none" />

              <AnimatePresence custom={direction} mode="wait">
                {currentTestimonial && (
                  <motion.div
                    key={currentTestimonial.id || activeIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full flex flex-col justify-between"
                  >
                    <div>
                      {/* Category & Date Row */}
                      <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-gold/10 text-gold border border-gold/30">
                          {currentTestimonial.category || 'Miracle Report'}
                        </span>
                        {currentTestimonial.date && (
                          <span className="flex items-center gap-1 text-xs text-zinc-500 font-mono">
                            <Calendar size={13} />
                            {currentTestimonial.date}
                          </span>
                        )}
                      </div>

                      {/* Headline */}
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white leading-snug mb-6 glow-text">
                        "{currentTestimonial.title}"
                      </h3>

                      {/* Story quote */}
                      <p className="text-zinc-300 text-base sm:text-lg leading-relaxed font-light mb-8 max-w-3xl">
                        {currentTestimonial.story}
                      </p>
                    </div>

                    {/* Member Details */}
                    <div className="pt-6 border-t border-zinc-800/80 flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 p-[2px] shadow-lg">
                          <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-gold font-serif font-bold text-lg">
                            {currentTestimonial.name.replace(/^(Sister|Brother|Pastor|Minister|Dr\.|Rev\.)\s+/i, '').charAt(0) || 'P'}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-white tracking-wide">
                              {currentTestimonial.name}
                            </h4>
                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <CheckCircle2 size={10} className="mr-1" /> Verified Testimony
                            </span>
                          </div>

                          {currentTestimonial.location && (
                            <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={12} className="text-gold" />
                              <span>{currentTestimonial.location}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Slide Indicator counter */}
                      <div className="text-xs font-mono text-zinc-500">
                        <span className="text-gold font-bold">{activeIndex + 1}</span> of {displayItems.length}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Controls Bar */}
            <div className="px-6 py-4 bg-zinc-950/60 border-t border-zinc-800/80 flex items-center justify-between gap-4 z-10">
              {/* Play/Pause Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-gold transition-colors cursor-pointer"
                title={isPlaying ? 'Pause Auto-slide' : 'Resume Auto-slide'}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span className="hidden sm:inline">{isPlaying ? 'Auto-playing' : 'Paused'}</span>
              </button>

              {/* Dot Indicators */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {displayItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDirection(idx > activeIndex ? 1 : -1);
                      setCurrentIndex(idx);
                      setProgress(0);
                    }}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === activeIndex 
                        ? 'w-8 bg-gold shadow-[0_0_10px_var(--theme-glow,rgba(212,175,55,0.8))]' 
                        : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                    }`}
                    aria-label={`Jump to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Prev/Next arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-gold/50 text-zinc-300 hover:text-gold transition-all cursor-pointer shadow-md"
                  aria-label="Previous Testimonial"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-gold/50 text-zinc-300 hover:text-gold transition-all cursor-pointer shadow-md"
                  aria-label="Next Testimonial"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Member "Share Your Testimony" */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-xl bg-zinc-900 border border-gold/30 rounded-3xl p-6 sm:p-8 shadow-2xl my-8"
            >
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {submitSuccess ? (
                <div className="py-12 text-center">
                  <div className="w-20 h-20 bg-gold/20 border border-gold/40 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-gold animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-serif text-white mb-2">Praise the Lord!</h3>
                  <p className="text-zinc-400 text-sm max-w-md mx-auto">
                    Your testimony has been submitted for pastoral review. It will be featured on the assembly carousel to encourage believers worldwide.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleMemberSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-gold" />
                    <h3 className="text-2xl font-serif text-white">Share Your Testimony</h3>
                  </div>
                  <p className="text-xs text-zinc-400 mb-4">
                    Declare the marvelous acts of God in your life and sow faith in the hearts of others.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={shareForm.name}
                        onChange={(e) => setShareForm({ ...shareForm, name: e.target.value })}
                        placeholder="e.g. Sister Deborah O."
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                        Category *
                      </label>
                      <select
                        value={shareForm.category}
                        onChange={(e) => setShareForm({ ...shareForm, category: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none transition-colors"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} className="bg-zinc-900 text-zinc-200">
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                      Testimony Headline *
                    </label>
                    <input
                      type="text"
                      required
                      value={shareForm.title}
                      onChange={(e) => setShareForm({ ...shareForm, title: e.target.value })}
                      placeholder="e.g. Instant Healing from 4-Year Chronic Spine Affliction"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none transition-colors"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                        City / Location (Optional)
                      </label>
                      <input
                        type="text"
                        value={shareForm.location}
                        onChange={(e) => setShareForm({ ...shareForm, location: e.target.value })}
                        placeholder="e.g. Abuja, Nigeria / London, UK"
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                        Date of Miracle
                      </label>
                      <input
                        type="date"
                        value={shareForm.date}
                        onChange={(e) => setShareForm({ ...shareForm, date: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                      Your Full Story *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={shareForm.story}
                      onChange={(e) => setShareForm({ ...shareForm, story: e.target.value })}
                      placeholder="Detail what the Lord did, how you connected to the prophetic ministration, and the transformation that took place..."
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold rounded-xl p-4 text-sm text-zinc-200 outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gold hover:bg-amber-400 text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    <Send size={16} />
                    <span>{isSubmitting ? 'Submitting Testimony...' : 'Send for Altar Publication'}</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Admin Moderation Desk */}
      <AnimatePresence>
        {isModerationOpen && isAdmin && (
          <div className="fixed inset-0 z-[200] bg-zinc-950/95 backdrop-blur-xl flex flex-col">
            <div className="p-6 border-b border-zinc-900 bg-zinc-950/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-gold" size={20} />
                  <h3 className="text-2xl font-serif text-white">Testimonial Moderation Desk</h3>
                </div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-mono">
                  Pastoral Oversight & Altar Approvals ({testimonials.length} Total Entries)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsModerationOpen(false);
                    setIsCreatingAdmin(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold/15 text-gold border border-gold/40 text-xs font-bold hover:bg-gold hover:text-zinc-950 transition-all cursor-pointer"
                >
                  <Plus size={14} /> Add Direct
                </button>
                <button
                  onClick={() => setIsModerationOpen(false)}
                  className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-6 py-3 border-b border-zinc-900 flex gap-2">
              <button
                onClick={() => setModerationTab('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider cursor-pointer transition-all ${
                  moderationTab === 'pending'
                    ? 'bg-amber-500 text-zinc-950 font-extrabold shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                Pending Review ({testimonials.filter(t => t.status === 'pending').length})
              </button>
              <button
                onClick={() => setModerationTab('approved')}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider cursor-pointer transition-all ${
                  moderationTab === 'approved'
                    ? 'bg-emerald-500 text-zinc-950 font-extrabold shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                Approved & Live ({testimonials.filter(t => t.status === 'approved').length})
              </button>
              <button
                onClick={() => setModerationTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider cursor-pointer transition-all ${
                  moderationTab === 'all'
                    ? 'bg-zinc-200 text-zinc-950 font-extrabold shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                All Entries ({testimonials.length})
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
              <div className="max-w-5xl mx-auto space-y-6">
                {testimonials
                  .filter((t) => moderationTab === 'all' || t.status === moderationTab)
                  .map((t) => (
                    <div
                      key={t.id}
                      className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-gold/30 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white text-base">{t.name}</span>
                            {t.location && (
                              <span className="text-xs text-zinc-400 flex items-center gap-1">
                                <MapPin size={11} /> {t.location}
                              </span>
                            )}
                            <span className="text-xs text-zinc-500 font-mono">
                              • {t.date}
                            </span>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            t.status === 'approved'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : t.status === 'pending'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}>
                            {t.status}
                          </span>
                        </div>

                        <div className="mb-3">
                          <span className="text-xs text-gold font-semibold uppercase tracking-wider block mb-1">
                            {t.category}
                          </span>
                          <h4 className="text-lg font-serif text-zinc-100 font-bold">"{t.title}"</h4>
                        </div>

                        <p className="text-zinc-300 text-sm leading-relaxed mb-6 font-light">
                          {t.story}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {t.status !== 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(t.id!, 'approved')}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow"
                            >
                              <CheckCircle2 size={13} /> Approve to Carousel
                            </button>
                          )}
                          {t.status !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(t.id!, 'rejected')}
                              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingItem(t)}
                            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gold text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(t.id!)}
                            className="p-2 rounded-xl bg-zinc-800 hover:bg-red-900/60 text-zinc-400 hover:text-red-300 transition-all cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {testimonials.filter((t) => moderationTab === 'all' || t.status === moderationTab).length === 0 && (
                  <div className="py-20 text-center border border-dashed border-zinc-800 rounded-3xl">
                    <CheckCircle2 className="mx-auto text-zinc-600 mb-3" size={36} />
                    <p className="text-zinc-400 text-sm font-medium">No testimonies under this tab.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Edit Testimony (Admin) */}
      <AnimatePresence>
        {editingItem && isAdmin && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-xl bg-zinc-900 border border-gold/40 rounded-3xl p-6 sm:p-8 shadow-2xl my-8"
            >
              <button
                onClick={() => setEditingItem(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>

              <h3 className="text-2xl font-serif text-white mb-6 flex items-center gap-2">
                <Edit3 size={20} className="text-gold" />
                <span>Edit Testimony</span>
              </h3>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                      Member Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                      Status
                    </label>
                    <select
                      value={editingItem.status}
                      onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none"
                    >
                      <option value="approved">Approved (Live)</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                    Headline / Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                      Category
                    </label>
                    <select
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editingItem.location || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                    Story / Praise Report
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={editingItem.story}
                    onChange={(e) => setEditingItem({ ...editingItem, story: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold rounded-xl p-4 text-sm text-zinc-200 outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gold hover:bg-amber-400 text-zinc-950 font-bold rounded-xl transition-all cursor-pointer shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: Admin Direct Creation */}
      <AnimatePresence>
        {isCreatingAdmin && isAdmin && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-xl bg-zinc-900 border border-gold/40 rounded-3xl p-6 sm:p-8 shadow-2xl my-8"
            >
              <button
                onClick={() => setIsCreatingAdmin(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>

              <h3 className="text-2xl font-serif text-white mb-2 flex items-center gap-2">
                <Plus size={20} className="text-gold" />
                <span>Add Approved Testimony</span>
              </h3>
              <p className="text-xs text-zinc-400 mb-6">
                Directly publishes an approved member story onto the carousel.
              </p>

              <form onSubmit={handleCreateAdminTestimony} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                      Member Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={shareForm.name}
                      onChange={(e) => setShareForm({ ...shareForm, name: e.target.value })}
                      placeholder="e.g. Deaconess Ruth A."
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                      Category *
                    </label>
                    <select
                      value={shareForm.category}
                      onChange={(e) => setShareForm({ ...shareForm, category: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                    Headline / Miracle Summary *
                  </label>
                  <input
                    type="text"
                    required
                    value={shareForm.title}
                    onChange={(e) => setShareForm({ ...shareForm, title: e.target.value })}
                    placeholder="e.g. Delivered from 10-Year Diabetes and Organ Complications"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={shareForm.location}
                      onChange={(e) => setShareForm({ ...shareForm, location: e.target.value })}
                      placeholder="e.g. Dallas, TX"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={shareForm.date}
                      onChange={(e) => setShareForm({ ...shareForm, date: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                    Full Testimony Story *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={shareForm.story}
                    onChange={(e) => setShareForm({ ...shareForm, story: e.target.value })}
                    placeholder="Enter the complete testimony..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-gold rounded-xl p-4 text-sm text-zinc-200 outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingAdmin(false)}
                    className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gold hover:bg-amber-400 text-zinc-950 font-bold rounded-xl transition-all cursor-pointer shadow-lg"
                  >
                    Publish to Carousel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
