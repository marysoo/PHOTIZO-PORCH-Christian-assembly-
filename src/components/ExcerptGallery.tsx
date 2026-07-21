import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Edit2, 
  Trash2, 
  Quote, 
  Sparkles, 
  X, 
  Image as ImageIcon, 
  Tag, 
  User, 
  Check, 
  FileText,
  UploadCloud,
  Heart,
  Gift
} from 'lucide-react';
import { firebaseService, Excerpt } from '../lib/firebaseService';

interface ExcerptGalleryProps {
  isAdmin: boolean;
}

const DEFAULT_EXCERPTS: Excerpt[] = [
  {
    text: "Redefining the destinies of men through His Glorious Light is not a mere statement, but a heavenly mandate that is currently unfolding in our midst. We are building a people of supernatural excellence.",
    source: "Prophet Japhet Tsukwas",
    category: "Divine Mandate",
    imageUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1200&auto=format&fit=crop"
  },
  {
    text: "Enlightening hearts with the knowledge of God's glory is our assignment. When the Light of Photizo comes, darkness has no option but to flee. Step into your season of absolute illumination.",
    source: "Prophet Japhet Tsukwas",
    category: "Prophetic Revelation",
    imageUrl: "https://images.unsplash.com/photo-1444464666168-49d633b86747?q=80&w=1200&auto=format&fit=crop"
  },
  {
    text: "The supernatural is not an occasional event; it is our native atmosphere. We walk daily in the consciousness of the finished work of Christ and the limitless power of the Holy Ghost.",
    source: "Prophet Japhet Tsukwas",
    category: "Supernatural",
    imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200&auto=format&fit=crop"
  },
  {
    text: "Excellence is the signature of the Spirit of God inside a believer. We do not settle for mediocrity; we manifest kingdom standards, wisdom, and honor in every dimension of life.",
    source: "Mrs. Regina Japheth",
    category: "Kingdom Excellence",
    imageUrl: "https://images.unsplash.com/photo-1510531704581-5b2870972060?q=80&w=1200&auto=format&fit=crop"
  }
];

const DEFAULT_HUMANITARIAN_EXCERPTS: Excerpt[] = [
  {
    text: "Expressing Christ's love through tangible compassion. Our outreach team regularly visits and supports families with groceries, welfare packages, and divine hope.",
    source: "Prophet Japhet Tsukwas",
    category: "Welfare Outreach",
    imageUrl: "/images/humanitarian_family_dist.jpg"
  },
  {
    text: "The smile on their faces is the greatest reward. Kingdom excellence is not just in preaching, but in demonstrating the love of God through giving.",
    source: "Mrs. Regina Japheth",
    category: "Hope & Joy",
    imageUrl: "/images/humanitarian_smiling_woman.jpg"
  },
  {
    text: "Honoring our elders and supporting mothers is a core pillar of our faith. True religion is to visit the fatherless and widows in their affliction.",
    source: "Outreach Team",
    category: "Elderly Care",
    imageUrl: "/images/humanitarian_elderly_care.jpg"
  },
  {
    text: "Joyous laughter and deep-seated relief as families receive essential food supplies during the Photizo Assembly's community-wide distribution service.",
    source: "Mrs. Regina Japheth",
    category: "Welfare Outreach",
    imageUrl: "/images/humanitarian_outreach_grace.jpg"
  },
  {
    text: "Gathered under one roof in mutual honor and grace. Our assembly provides a safe, welcoming haven of physical and spiritual nourishment for all.",
    source: "Outreach Team",
    category: "Community Support",
    imageUrl: "/images/humanitarian_community_hall.jpg"
  },
  {
    text: "Sharing packages of love with hands of honor. We believe in lifting and empowering every member of the Photizo Porch community.",
    source: "Prophet Japhet Tsukwas",
    category: "Welfare Outreach",
    imageUrl: "/images/humanitarian_welfare_team.jpg"
  },
  {
    text: "Hearts overflowing with thanksgiving and hands lifted in praise. Every care package delivered is a seed of hope planted in our community.",
    source: "Mrs. Regina Japheth",
    category: "Thanksgiving Joy",
    imageUrl: "/images/humanitarian_thanksgiving_gold.jpg"
  },
  {
    text: "Spreading warmth, divine comfort, and physical support to our youth and families. We walk together as one family under His glorious light.",
    source: "Prophet Japhet Tsukwas",
    category: "Welfare Outreach",
    imageUrl: "/images/humanitarian_mustard_kaftan_joy.jpg"
  },
  {
    text: "Demonstrating the Gospel through cheerful giving. True spiritual leadership is about serving, uplifting, and feeding the flock of God.",
    source: "Prophet Japhet Tsukwas",
    category: "Love in Action",
    imageUrl: "/images/humanitarian_blue_kaftan_minister.jpg"
  },
  {
    text: "A sanctuary of fellowship and practical love. The Photizo Assembly stands as a beacon of welfare, guidance, and spiritual support.",
    source: "Outreach Team",
    category: "Community Care",
    imageUrl: "/images/humanitarian_hall_community_giving.jpg"
  }
];

const UNSPLASH_PRESETS = [
  { name: "Worship Atmosphere", url: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1200" },
  { name: "Divine Light", url: "https://images.unsplash.com/photo-1444464666168-49d633b86747?q=80&w=1200" },
  { name: "Anointed Service", url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200" },
  { name: "Holy Scriptures", url: "https://images.unsplash.com/photo-1510531704581-5b2870972060?q=80&w=1200" },
  { name: "Prophetic Prayer", url: "https://images.unsplash.com/photo-1445445290250-18a3a31edd42?q=80&w=1200" },
  { name: "Atmospheric Clouds", url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200" }
];

export default function ExcerptGallery({ isAdmin }: ExcerptGalleryProps) {
  const [excerpts, setExcerpts] = useState<Excerpt[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExcerpt, setEditingExcerpt] = useState<Excerpt | null>(null);
  const [autoplay, setAutoplay] = useState(true);
  const [activeTab, setActiveTab] = useState<'prophetic' | 'humanitarian'>('prophetic');
  
  // Form state
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const img = new Image();
        img.src = event.target.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Target max resolution of 1000px for the longer edge to stay visually pristine
          const maxDimension = 1000;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setError('Could not compress image. Browser canvas error.');
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to JPEG with 0.75 quality - this guarantees the file size is typically < 100KB,
          // far below Firestore's 1MB limit, while remaining visually sharp.
          try {
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
            setImageUrl(compressedDataUrl);
          } catch (e) {
            setError('Image security constraints prevented direct compression.');
          }
        };
        img.onerror = () => {
          setError('Failed to load image. File may be corrupted.');
        };
      }
    };
    reader.onerror = () => {
      setError('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsub = firebaseService.subscribeExcerpts((data) => {
      if (data.length === 0) {
        setExcerpts([...DEFAULT_EXCERPTS, ...DEFAULT_HUMANITARIAN_EXCERPTS]);
        // Auto-bootstrap default excerpts to firestore if admin is logged in
        if (isAdmin) {
          [...DEFAULT_EXCERPTS, ...DEFAULT_HUMANITARIAN_EXCERPTS].forEach(async (item) => {
            await firebaseService.upsertExcerpt(item);
          });
        }
      } else {
        // Automatically check for missing default excerpts and bootstrap them
        if (isAdmin) {
          const existingUrls = new Set(data.map(item => item.imageUrl));
          [...DEFAULT_EXCERPTS, ...DEFAULT_HUMANITARIAN_EXCERPTS].forEach(async (item) => {
            if (!existingUrls.has(item.imageUrl)) {
              await firebaseService.upsertExcerpt(item);
            }
          });
        }
        setExcerpts(data);
      }
    });
    return () => unsub();
  }, [isAdmin]);

  const isHumanitarian = (item: Excerpt) => {
    const cat = (item.category || '').toLowerCase();
    return ['welfare outreach', 'hope & joy', 'elderly care', 'humanitarian', 'outreach', 'community care', 'photizo care'].includes(cat);
  };

  const filteredExcerpts = excerpts.filter(item => {
    if (activeTab === 'humanitarian') {
      return isHumanitarian(item);
    } else {
      return !isHumanitarian(item);
    }
  });

  // Reset active index when tab changes
  useEffect(() => {
    setActiveIndex(0);
  }, [activeTab]);

  // Autoplay handler
  useEffect(() => {
    if (autoplay && filteredExcerpts.length > 0) {
      timerRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % filteredExcerpts.length);
      }, 8000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoplay, filteredExcerpts.length]);

  const handleNext = () => {
    setAutoplay(false);
    if (filteredExcerpts.length > 0) {
      setActiveIndex((prev) => (prev + 1) % filteredExcerpts.length);
    }
  };

  const handlePrev = () => {
    setAutoplay(false);
    if (filteredExcerpts.length > 0) {
      setActiveIndex((prev) => (prev - 1 + filteredExcerpts.length) % filteredExcerpts.length);
    }
  };

  const handleSelectSlide = (index: number) => {
    setAutoplay(false);
    setActiveIndex(index);
  };

  const openAddForm = () => {
    setEditingExcerpt(null);
    setText('');
    setSource('Prophet Japhet Tsukwas');
    setCategory(activeTab === 'humanitarian' ? 'Welfare Outreach' : 'Prophetic Word');
    setImageUrl(activeTab === 'humanitarian' ? '/images/humanitarian_family_dist.jpg' : UNSPLASH_PRESETS[0].url);
    setError('');
    setIsFormOpen(true);
  };

  const openEditForm = (excerpt: Excerpt) => {
    setEditingExcerpt(excerpt);
    setText(excerpt.text);
    setSource(excerpt.source);
    setCategory(excerpt.category || '');
    setImageUrl(excerpt.imageUrl);
    setError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!text.trim()) {
      setError('Excerpt text is required');
      return;
    }
    if (!source.trim()) {
      setError('Author or source name is required');
      return;
    }
    if (!imageUrl.trim()) {
      setError('Image URL is required');
      return;
    }

    const payload: Excerpt = {
      text: text.trim(),
      source: source.trim(),
      category: category.trim() || 'Insight',
      imageUrl: imageUrl.trim()
    };

    if (editingExcerpt?.id) {
      payload.id = editingExcerpt.id;
    }

    try {
      await firebaseService.upsertExcerpt(payload);
      setSuccess(true);
      setTimeout(() => {
        setIsFormOpen(false);
        setEditingExcerpt(null);
        setSuccess(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save excerpt.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this excerpt?')) {
      try {
        await firebaseService.deleteExcerpt(id);
        if (activeIndex >= excerpts.length - 1) {
          setActiveIndex(Math.max(0, excerpts.length - 2));
        }
      } catch (err) {
        alert('Failed to delete excerpt.');
      }
    }
  };

  const currentExcerpt = filteredExcerpts[activeIndex];

  return (
    <section id="gallery" className="py-24 px-6 border-b border-zinc-900 bg-zinc-950/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-zinc-900/10 via-transparent to-transparent -z-10" />
      
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-gold font-mono text-sm uppercase tracking-widest mb-3">
              {activeTab === 'prophetic' ? (
                <>
                  <Sparkles className="w-4 h-4 text-gold animate-pulse" />
                  <span>Divine Wisdom & Visuals</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 text-gold animate-pulse" />
                  <span>Compassion & Outreach</span>
                </>
              )}
            </div>
            <h2 className="text-4xl md:text-5xl font-serif glow-text text-white">
              {activeTab === 'prophetic' ? 'Prophetic Gallery' : 'Love in Action'}
            </h2>
            <p className="text-zinc-400 mt-2 max-w-xl font-light">
              {activeTab === 'prophetic'
                ? 'Atmospheric captures paired with declarations and revelations spoken over the house of Photizo.'
                : 'Capturing moments of welfare distribution, support, and community care by the Photizo Assembly.'}
            </p>
          </div>
          
          {isAdmin && (
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 bg-gold hover:bg-amber-500 text-zinc-950 px-6 py-3 rounded-full font-bold transition-all shadow-lg shadow-gold/20 shrink-0 self-start md:self-auto cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Add Excerpt</span>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-zinc-900 pb-6 mb-10 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('prophetic')}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-full font-sans text-sm font-semibold tracking-wide transition-all cursor-pointer border ${
              activeTab === 'prophetic'
                ? 'bg-gold/10 text-gold border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.08)]'
                : 'text-zinc-400 border-zinc-900 hover:text-zinc-200 hover:border-zinc-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Prophetic Declarations</span>
          </button>
          <button
            onClick={() => setActiveTab('humanitarian')}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-full font-sans text-sm font-semibold tracking-wide transition-all cursor-pointer border ${
              activeTab === 'humanitarian'
                ? 'bg-gold/10 text-gold border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.08)]'
                : 'text-zinc-400 border-zinc-900 hover:text-zinc-200 hover:border-zinc-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Love in Action (Outreaches)</span>
          </button>
        </div>

        {/* --- 1. HERO SLIDE COMPONENT --- */}
        {currentExcerpt ? (
          <div 
            className="relative w-full h-[520px] md:h-[620px] rounded-[2rem] overflow-hidden border border-zinc-800 shadow-2xl group/slide bg-zinc-950"
            onMouseEnter={() => setAutoplay(false)}
            onMouseLeave={() => setAutoplay(true)}
          >
            {/* Background image transitions using key */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <img 
                  src={currentExcerpt.imageUrl} 
                  alt={currentExcerpt.category || "Excerpt background"} 
                  className="w-full h-full object-cover filter brightness-[0.7] saturate-[0.8]"
                  referrerPolicy="no-referrer"
                />
                {/* Visual Gradients overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-transparent hidden md:block" />
              </motion.div>
            </AnimatePresence>

            {/* Content Floating inside slider */}
            <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-16 z-20">
              {/* Category tag & Admin Controls */}
              <div className="flex justify-between items-center">
                <span className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-gold text-xs font-mono uppercase tracking-widest px-4 py-2 rounded-full">
                  {currentExcerpt.category || "Word of Wisdom"}
                </span>

                {isAdmin && currentExcerpt.id && (
                  <div className="flex items-center gap-2 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 p-1.5 rounded-full">
                    <button
                      onClick={() => openEditForm(currentExcerpt)}
                      className="p-2 text-zinc-400 hover:text-gold transition-colors rounded-full hover:bg-zinc-900"
                      title="Edit Excerpt"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(currentExcerpt.id!)}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors rounded-full hover:bg-zinc-900"
                      title="Delete Excerpt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Central text quote with staggered animations */}
              <div className="max-w-3xl">
                <Quote className="w-12 h-12 text-gold/30 mb-4 fill-gold/10" />
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <p className="text-2xl md:text-4xl font-serif text-white leading-relaxed tracking-wide font-light drop-shadow-md">
                      "{currentExcerpt.text}"
                    </p>
                    
                    <div className="flex items-center gap-4 mt-8">
                      <div className="w-10 h-0.5 bg-gold rounded-full" />
                      <div>
                        <p className="text-gold font-bold tracking-wider text-base md:text-lg">
                          {currentExcerpt.source}
                        </p>
                        <p className="text-zinc-400 text-xs font-mono uppercase tracking-wider mt-1">
                          Photizo Porch Assembly
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Slider Bottom: controls and dots */}
              <div className="flex items-center justify-between mt-6">
                {/* Left/Right Floating Glassmorphism Arrows */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrev}
                    className="p-3 bg-zinc-950/55 backdrop-blur-md border border-zinc-800 text-white rounded-full hover:bg-gold hover:text-zinc-950 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-3 bg-zinc-950/55 backdrop-blur-md border border-zinc-800 text-white rounded-full hover:bg-gold hover:text-zinc-950 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Micro index dots */}
                <div className="flex items-center gap-2">
                  {filteredExcerpts.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === activeIndex ? 'w-8 bg-gold' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-[400px] flex flex-col items-center justify-center text-zinc-500 border border-zinc-900 rounded-[2rem] bg-zinc-950/50">
            <ImageIcon className="w-12 h-12 text-zinc-700 mb-4 animate-bounce" />
            <p>Loading the Prophetic Gallery...</p>
          </div>
        )}

        {/* --- 2. THE PHOTO GRID GALLERY PANEL --- */}
        {filteredExcerpts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-lg font-mono uppercase text-zinc-500 tracking-widest mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-gold rounded-full animate-ping" />
              Interactive Catalog
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filteredExcerpts.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => handleSelectSlide(idx)}
                  className={`group/card relative aspect-[4/3] rounded-2xl overflow-hidden border cursor-pointer transition-all duration-500 ${
                    idx === activeIndex 
                      ? 'border-gold shadow-lg shadow-gold/10 ring-2 ring-gold/20' 
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.category}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      idx === activeIndex ? 'scale-105 filter brightness-100' : 'scale-100 group-hover/card:scale-110 filter brightness-[0.6] group-hover/card:brightness-[0.9]'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Subtle hover gradient and overlay text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent flex flex-col justify-end p-4">
                    <span className="text-[10px] font-mono text-gold uppercase tracking-wider mb-1">
                      {item.category || "Revelation"}
                    </span>
                    <h4 className="text-white text-xs md:text-sm font-semibold truncate group-hover/card:text-gold transition-colors">
                      {item.text}
                    </h4>
                    <p className="text-zinc-400 text-[10px] truncate mt-0.5">
                      {item.source}
                    </p>
                  </div>

                  {idx === activeIndex && (
                    <div className="absolute top-3 right-3 bg-gold text-zinc-950 p-1 rounded-full shadow-lg">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 3. ADMIN DRAWER/MODAL SYSTEM --- */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-800 bg-zinc-950 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gold/10 text-gold rounded-xl">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {editingExcerpt ? 'Modify Excerpt' : 'Add New Excerpt'}
                      </h3>
                      <p className="text-xs text-zinc-500 uppercase font-mono tracking-widest mt-1">
                        Staff Portal &bull; Gallery Manager
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form fields */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl text-sm flex items-center gap-2">
                      <Check className="w-5 h-5 stroke-[2.5]" />
                      <span>Excerpt successfully updated and synchronized!</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-gold" />
                      <span>Excerpt Text (Wisdom Quote / Scripture)</span>
                    </label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={4}
                      placeholder="Enter the prophetic words, scriptural illumination, or excerpt..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white placeholder-zinc-600 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-base leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gold" />
                        <span>Author / Source</span>
                      </label>
                      <input
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        placeholder="e.g. Prophet Japhet Tsukwas"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-gold text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-gold" />
                        <span>Category / Theme</span>
                      </label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g. Prophetic Revelation"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-gold text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5 text-gold" />
                        <span>Background Image (URL or Upload)</span>
                      </label>
                    </div>

                    {/* Drag and Drop Upload Area */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 text-center flex flex-col items-center justify-center gap-2 bg-zinc-950/40 ${
                        isDragging 
                          ? 'border-gold bg-gold/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                          : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/10'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-gold animate-bounce' : 'text-zinc-500'}`} />
                      <div className="text-xs text-zinc-400 font-sans">
                        <span className="text-gold font-semibold">Click to upload</span> or drag and drop
                      </div>
                      <p className="text-[10px] text-zinc-600">PNG, JPG, WEBP up to 2MB</p>
                    </div>

                    <div className="flex gap-4 items-center">
                      <div className="flex-1">
                        <input
                          type="url"
                          value={imageUrl.startsWith('data:') ? '' : imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="Or paste an image URL here..."
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-gold text-sm"
                        />
                      </div>

                      {imageUrl && (
                        <div className="w-14 h-14 rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950 shrink-0 relative group">
                          <img 
                            src={imageUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-500"
                            title="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Presets Grid */}
                    <div className="pt-2">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-2">
                        Or select a beautiful preset backdrop:
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {UNSPLASH_PRESETS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setImageUrl(p.url)}
                            className={`relative aspect-[3/2] rounded-lg overflow-hidden border transition-all ${
                              imageUrl === p.url ? 'border-gold ring-1 ring-gold/40' : 'border-zinc-800 hover:border-zinc-700'
                            }`}
                            title={p.name}
                          >
                            <img src={p.url} className="w-full h-full object-cover" alt={p.name} referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/40 hover:bg-transparent transition-colors flex items-center justify-center">
                              <span className="text-[9px] text-white/90 font-medium font-sans text-center px-1 leading-none">
                                {p.name.split(' ')[0]}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end gap-4 p-6 border-t border-zinc-800 bg-zinc-950 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-6 py-3 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full text-base transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={success}
                      className="flex items-center gap-2 bg-gold hover:bg-amber-500 text-zinc-950 px-8 py-3.5 rounded-full font-bold transition-all shadow-lg shadow-gold/10 cursor-pointer disabled:opacity-50"
                    >
                      {success ? (
                        <>
                          <Check className="w-5 h-5 stroke-[2.5]" />
                          <span>Saved!</span>
                        </>
                      ) : (
                        <span>{editingExcerpt ? 'Update Excerpt' : 'Publish Excerpt'}</span>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
