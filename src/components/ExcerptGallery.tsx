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
  Maximize2,
  Play,
  Pause,
  SlidersHorizontal,
  Flame,
  Layers,
  FolderPlus,
  CheckCircle2
} from 'lucide-react';
import { firebaseService, Excerpt } from '../lib/firebaseService';
import { optimizeImageFile } from '../lib/imageOptimizer';

interface ExcerptGalleryProps {
  isAdmin: boolean;
}

const DEFAULT_AUTHENTIC_EXCERPTS: Excerpt[] = [
  {
    text: "Hour of Divine Worship",
    source: "Photizo Assembly",
    category: "Worship Atmosphere",
    imageUrl: "/user_uploads/upload_0_Hour_of_worship.webp"
  },
  {
    text: "Deep Fellowship in His Presence",
    source: "Photizo Assembly",
    category: "Worship Atmosphere",
    imageUrl: "/user_uploads/upload_1_Hour_of_worship.webp"
  },
  {
    text: "Prayers of Intercession & Power",
    source: "Prophet Japhet Tsukwas",
    category: "Prophetic Altar",
    imageUrl: "/user_uploads/upload_2_Prayers___.webp"
  },
  {
    text: "Atmosphere of Intense Praise & Honor",
    source: "Photizo Assembly",
    category: "Worship Atmosphere",
    imageUrl: "/user_uploads/upload_3_Worship.webp"
  },
  {
    text: "Engrossed in the Glory of His Presence",
    source: "Prophet Japhet Tsukwas",
    category: "Prophetic Word",
    imageUrl: "/user_uploads/upload_6_Engrossed_in_worship.webp"
  },
  {
    text: "Humanitarian Outreach & Welfare Service",
    source: "Photizo Outreach Team",
    category: "Love in Action",
    imageUrl: "/user_uploads/upload_9_Humanitarian_service.webp"
  },
  {
    text: "Hands of Honor: Serving Our Community",
    source: "Photizo Outreach Team",
    category: "Love in Action",
    imageUrl: "/user_uploads/upload_10_Humanitarian_service.webp"
  },
  {
    text: "Empowering Families with Essential Care",
    source: "Photizo Outreach Team",
    category: "Love in Action",
    imageUrl: "/user_uploads/upload_11_Humanitarian_service.webp"
  },
  {
    text: "Joyful Giving & Practical Kingdom Love",
    source: "Photizo Outreach Team",
    category: "Love in Action",
    imageUrl: "/user_uploads/upload_12_Humanitarian_service.webp"
  }
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.96
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring' as const, stiffness: 260, damping: 28 },
      opacity: { duration: 0.45 },
      scale: { duration: 0.45 }
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.96,
    transition: {
      x: { type: 'spring' as const, stiffness: 260, damping: 28 },
      opacity: { duration: 0.35 }
    }
  })
};

export default function ExcerptGallery({ isAdmin }: ExcerptGalleryProps) {
  const [excerpts, setExcerpts] = useState<Excerpt[]>([]);
  const [page, setPage] = useState<[number, number]>([0, 0]); // [currentIndex, direction]
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'worship' | 'outreach'>('all');
  
  // Modals & Drawers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExcerpt, setEditingExcerpt] = useState<Excerpt | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isAdminManagerOpen, setIsAdminManagerOpen] = useState(false);

  // Form State
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Multi-Image Selector & Batch Upload State
  const [pendingUploads, setPendingUploads] = useState<Array<{
    id: string;
    file: File;
    dataUrl: string;
    title: string;
    category: string;
    source: string;
    sizeFormatted: string;
  }>>([]);
  const [isMultiUploadModalOpen, setIsMultiUploadModalOpen] = useState(false);
  const [sharedMultiCategory, setSharedMultiCategory] = useState('Worship Atmosphere');
  const [sharedMultiSource, setSharedMultiSource] = useState('Photizo Assembly');

  // Batch Uploading
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  // Auto-slide Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const SLIDE_INTERVAL = 6000; // 6 seconds per slide

  // Load excerpts from Firestore
  useEffect(() => {
    const unsub = firebaseService.subscribeExcerpts((data) => {
      // Filter out any leftover AI generated images
      const filtered = data.filter(d => {
        const u = d.imageUrl || '';
        return !u.includes('humanitarian_') && 
               !u.includes('prophet_japhet_') &&
               !u.startsWith('/images/humanitarian') &&
               !u.startsWith('/images/prophet_japhet');
      });

      if (filtered.length === 0) {
        setExcerpts(DEFAULT_AUTHENTIC_EXCERPTS);
      } else {
        setExcerpts(filtered);
      }
    });
    return () => unsub();
  }, []);

  // Filtered excerpts based on category tab
  const displayExcerpts = excerpts.filter(item => {
    if (selectedFilter === 'all') return true;
    const cat = (item.category || '').toLowerCase();
    const txt = (item.text || '').toLowerCase();
    if (selectedFilter === 'worship') {
      return cat.includes('worship') || cat.includes('prophetic') || cat.includes('altar') || txt.includes('worship') || txt.includes('prayer');
    }
    if (selectedFilter === 'outreach') {
      return cat.includes('love') || cat.includes('outreach') || cat.includes('humanitarian') || cat.includes('service') || txt.includes('humanitarian');
    }
    return true;
  });

  const currentIndex = Math.min(page[0], Math.max(0, displayExcerpts.length - 1));
  const direction = page[1];

  const paginate = (newDirection: number) => {
    if (displayExcerpts.length <= 1) return;
    setPage(([curr]) => {
      const nextIndex = (curr + newDirection + displayExcerpts.length) % displayExcerpts.length;
      return [nextIndex, newDirection];
    });
  };

  // Auto-play slideshow timer (sliding one after another)
  useEffect(() => {
    if (!isPlaying || displayExcerpts.length <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      paginate(1);
    }, SLIDE_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, displayExcerpts.length, currentIndex]);

  // Preload adjacent slide images for instant, zero-flicker transitions
  useEffect(() => {
    if (displayExcerpts.length <= 1) return;
    const nextIdx = (currentIndex + 1) % displayExcerpts.length;
    const prevIdx = (currentIndex - 1 + displayExcerpts.length) % displayExcerpts.length;
    const preload = (url?: string) => {
      if (url && typeof window !== 'undefined') {
        const img = new Image();
        img.decoding = 'async';
        img.src = url;
      }
    };
    preload(displayExcerpts[nextIdx]?.imageUrl);
    preload(displayExcerpts[prevIdx]?.imageUrl);
  }, [currentIndex, displayExcerpts]);

  // Handle Drag & Drop Batch Uploads
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const processFiles = async (files: File[]) => {
    const validImages = files.filter(f => f.type.startsWith('image/'));
    if (validImages.length === 0) {
      setError('Please select valid image files (JPG, PNG, WEBP, etc.)');
      return;
    }

    // Single file in form modal while editing an existing slide
    if (editingExcerpt && isFormOpen && validImages.length === 1) {
      try {
        const dataUrl = await optimizeImageFile(validImages[0]);
        setImageUrl(dataUrl);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Error processing image file.');
      }
      return;
    }

    // Process files for Multi-Image Selector modal
    setIsBatchUploading(true);
    setBatchProgress({ current: 0, total: validImages.length });
    setError('');

    try {
      const newItems: Array<{
        id: string;
        file: File;
        dataUrl: string;
        title: string;
        category: string;
        source: string;
        sizeFormatted: string;
      }> = [];

      for (let i = 0; i < validImages.length; i++) {
        const file = validImages[i];
        setBatchProgress({ current: i + 1, total: validImages.length });

        const dataUrl = await optimizeImageFile(file);
        const rawTitle = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, char => char.toUpperCase());

        const isOutreach = rawTitle.toLowerCase().includes('humanitarian') || 
                           rawTitle.toLowerCase().includes('welfare') || 
                           rawTitle.toLowerCase().includes('outreach');

        const sizeInKB = Math.round(file.size / 1024);
        const sizeFormatted = sizeInKB > 1024 
          ? `${(sizeInKB / 1024).toFixed(1)} MB` 
          : `${sizeInKB} KB`;

        newItems.push({
          id: `${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          dataUrl,
          title: rawTitle || `Sanctuary Photo ${i + 1}`,
          category: isOutreach ? 'Love in Action' : sharedMultiCategory,
          source: sharedMultiSource,
          sizeFormatted
        });
      }

      setPendingUploads(prev => [...prev, ...newItems]);
      setIsMultiUploadModalOpen(true);
      if (isFormOpen && !editingExcerpt) {
        setIsFormOpen(false);
      }
    } catch (err: any) {
      setError(err.message || 'Error processing selected photos.');
    } finally {
      setIsBatchUploading(false);
      setBatchProgress(null);
    }
  };

  const updatePendingTitle = (id: string, newTitle: string) => {
    setPendingUploads(prev => prev.map(item => item.id === id ? { ...item, title: newTitle } : item));
  };

  const updatePendingCategory = (id: string, newCategory: string) => {
    setPendingUploads(prev => prev.map(item => item.id === id ? { ...item, category: newCategory } : item));
  };

  const removePendingUpload = (id: string) => {
    setPendingUploads(prev => {
      const filtered = prev.filter(item => item.id !== id);
      if (filtered.length === 0) {
        setIsMultiUploadModalOpen(false);
      }
      return filtered;
    });
  };

  const applySharedCategory = (cat: string) => {
    setSharedMultiCategory(cat);
    setPendingUploads(prev => prev.map(item => ({ ...item, category: cat })));
  };

  const applySharedSource = (src: string) => {
    setSharedMultiSource(src);
    setPendingUploads(prev => prev.map(item => ({ ...item, source: src })));
  };

  const handleBatchUploadAll = async () => {
    if (pendingUploads.length === 0) return;
    setIsBatchUploading(true);
    setBatchProgress({ current: 0, total: pendingUploads.length });
    setError('');

    try {
      for (let i = 0; i < pendingUploads.length; i++) {
        const item = pendingUploads[i];
        setBatchProgress({ current: i + 1, total: pendingUploads.length });

        const newExcerpt: Omit<Excerpt, 'id'> = {
          text: item.title.trim() || 'Divine Encounter',
          source: item.source.trim() || 'Photizo Assembly',
          category: item.category || 'Worship Atmosphere',
          imageUrl: item.dataUrl
        };

        await firebaseService.upsertExcerpt(newExcerpt);
      }

      setSuccess(true);
      setPendingUploads([]);
      setIsMultiUploadModalOpen(false);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err: any) {
      setError(err.message || 'Error uploading photos to gallery.');
    } finally {
      setIsBatchUploading(false);
      setBatchProgress(null);
    }
  };

  // Open Form for Adding a new slide
  const openAddForm = () => {
    setEditingExcerpt(null);
    setText('');
    setSource('Photizo Assembly');
    setCategory('Worship Atmosphere');
    setImageUrl('');
    setError('');
    setIsFormOpen(true);
  };

  // Open Form for Editing current slide
  const openEditForm = (item: Excerpt) => {
    setEditingExcerpt(item);
    setText(item.text);
    setSource(item.source);
    setCategory(item.category || 'Worship Atmosphere');
    setImageUrl(item.imageUrl);
    setError('');
    setIsFormOpen(true);
  };

  // Submit edit or add
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!text.trim()) {
      setError('Title or caption is required');
      return;
    }
    if (!imageUrl.trim()) {
      setError('Photo is required. Please upload an image.');
      return;
    }

    const payload: Excerpt = {
      text: text.trim(),
      source: source.trim() || 'Photizo Assembly',
      category: category.trim() || 'Worship Atmosphere',
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
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Failed to save slide.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this photo from the gallery slide?')) {
      try {
        await firebaseService.deleteExcerpt(id);
      } catch (err) {
        alert('Failed to delete photo.');
      }
    }
  };

  const currentSlide = displayExcerpts[currentIndex];

  return (
    <section id="gallery" className="py-20 px-6 border-b border-zinc-900 bg-zinc-950/40 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gold/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-gold font-mono text-xs uppercase tracking-widest mb-2.5">
              <Sparkles className="w-4 h-4 text-gold animate-pulse" />
              <span>Living Moments & Prophetic Light</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif glow-text text-white">
              Photizo Gallery Slides
            </h2>
            <p className="text-zinc-400 mt-2 max-w-xl text-sm font-light">
              Real ministry moments, divine encounters in worship, and active outreaches sliding continuously in His glorious light.
            </p>
          </div>

          {/* Controls & Admin Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Filter Pills */}
            <div className="flex items-center p-1 bg-zinc-900/90 border border-zinc-800 rounded-full text-xs">
              <button
                onClick={() => { setSelectedFilter('all'); setPage([0, 0]); }}
                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
                  selectedFilter === 'all'
                    ? 'bg-gold text-zinc-950 shadow-md font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All Slides ({excerpts.length})
              </button>
              <button
                onClick={() => { setSelectedFilter('worship'); setPage([0, 0]); }}
                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
                  selectedFilter === 'worship'
                    ? 'bg-gold text-zinc-950 shadow-md font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Worship
              </button>
              <button
                onClick={() => { setSelectedFilter('outreach'); setPage([0, 0]); }}
                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
                  selectedFilter === 'outreach'
                    ? 'bg-gold text-zinc-950 shadow-md font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Love in Action
              </button>
            </div>

            {/* Admin Upload & Management */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-850 text-gold border border-gold/40 hover:border-gold px-4 py-2 rounded-full font-bold transition-all shadow-md cursor-pointer text-xs group">
                  <UploadCloud className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
                  <span>Upload Photos (Multi-Select)</span>
                  <span className="text-[10px] bg-gold/15 text-gold px-1.5 py-0.5 rounded-full border border-gold/30 font-mono hidden sm:inline">Multiple</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setIsAdminManagerOpen(true)}
                  className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 px-3.5 py-2 rounded-full font-semibold transition-all text-xs cursor-pointer"
                  title="View Behind-the-Scenes Photo List"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-gold" />
                  <span className="hidden sm:inline">Manage Photos</span>
                </button>
                <button
                  onClick={openAddForm}
                  className="p-2 bg-gold hover:bg-amber-500 text-zinc-950 rounded-full transition-all cursor-pointer shadow-md"
                  title="Add New Slide"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Batch Upload Progress Banner */}
        {isBatchUploading && batchProgress && (
          <div className="mb-6 p-4 bg-zinc-900/95 border border-gold/40 rounded-2xl flex items-center justify-between gap-4 text-gold shadow-2xl animate-pulse">
            <div className="flex items-center gap-3">
              <UploadCloud className="w-5 h-5 animate-bounce text-gold shrink-0" />
              <div>
                <p className="font-bold text-xs text-white">
                  Loading Photos Behind the Scene ({batchProgress.current} of {batchProgress.total})
                </p>
                <p className="text-[11px] text-zinc-400">
                  Adding to continuous gallery slideshow...
                </p>
              </div>
            </div>
            <div className="w-32 sm:w-48 bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800">
              <div 
                className="bg-gold h-full transition-all duration-300 rounded-full"
                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* --- MAIN CONTINUOUS SLIDESHOW COMPONENT --- */}
        {displayExcerpts.length > 0 && currentSlide ? (
          <div 
            className="relative w-full h-[520px] md:h-[640px] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950 group/slide select-none"
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => setIsPlaying(true)}
          >
            {/* Top Slide Progress Countdown Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-900 z-30 overflow-hidden">
              {isPlaying && (
                <motion.div
                  key={currentIndex}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: SLIDE_INTERVAL / 1000, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-amber-500 to-gold"
                />
              )}
            </div>

            {/* Sliding Container with directional AnimatePresence */}
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full"
              >
                {/* Photo Layer */}
                <img 
                  src={currentSlide.imageUrl} 
                  alt={currentSlide.text || "Ministry Photo"} 
                  className="w-full h-full object-cover"
                  decoding="async"
                  fetchPriority="high"
                  referrerPolicy="no-referrer"
                />

                {/* Ambient vignette and readable gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-zinc-950/20 to-transparent hidden md:block" />
              </motion.div>
            </AnimatePresence>

            {/* Slide Interactive Content Floating Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 md:p-14 z-20 pointer-events-none">
              
              {/* Top Controls Bar */}
              <div className="flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-950/85 backdrop-blur-md border border-zinc-800 text-gold text-xs font-mono uppercase tracking-wider shadow-lg">
                    {currentSlide.category === 'Love in Action' ? (
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                    )}
                    <span>{currentSlide.category || 'Photizo Moment'}</span>
                  </span>

                  <span className="px-3 py-1.5 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 text-zinc-400 text-xs font-mono">
                    {String(currentIndex + 1).padStart(2, '0')} / {String(displayExcerpts.length).padStart(2, '0')}
                  </span>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 bg-zinc-950/85 backdrop-blur-md border border-zinc-800 p-1 rounded-full shadow-lg">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 text-zinc-300 hover:text-gold hover:bg-zinc-900 rounded-full transition-all cursor-pointer"
                    title={isPlaying ? "Pause auto-slide" : "Resume auto-slide"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setLightboxIndex(currentIndex)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-gold hover:bg-zinc-900 rounded-full transition-all font-medium cursor-pointer"
                    title="View Original High-Res Photo"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-gold" />
                    <span className="hidden sm:inline">View Photo</span>
                  </button>

                  {isAdmin && currentSlide.id && (
                    <>
                      <button
                        onClick={() => openEditForm(currentSlide)}
                        className="p-2 text-zinc-400 hover:text-gold hover:bg-zinc-900 rounded-full transition-colors cursor-pointer"
                        title="Edit Slide"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(currentSlide.id!)}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-full transition-colors cursor-pointer"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Quote / Title Content */}
              <div className="max-w-3xl pointer-events-auto">
                <Quote className="w-10 h-10 text-gold/30 mb-2 fill-gold/10" />
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white font-light leading-snug drop-shadow-md">
                      "{currentSlide.text}"
                    </h3>

                    <div className="flex items-center gap-3 mt-6">
                      <div className="w-8 h-[2px] bg-gold rounded-full" />
                      <span className="text-gold font-bold tracking-wider text-sm sm:text-base">
                        {currentSlide.source || 'Prophet Japhet Tsukwas'}
                      </span>
                      <span className="text-zinc-500 text-xs font-mono uppercase tracking-widest hidden sm:inline">
                        &bull; Photizo Porch Assembly
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Navigation Chevrons & Pill Dots */}
              <div className="flex items-center justify-between pt-4 pointer-events-auto">
                {/* Arrow Chevrons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => paginate(-1)}
                    className="p-3 bg-zinc-950/80 hover:bg-gold text-zinc-300 hover:text-zinc-950 border border-zinc-800 rounded-full backdrop-blur-md transition-all shadow-xl cursor-pointer"
                    title="Previous Slide"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => paginate(1)}
                    className="p-3 bg-zinc-950/80 hover:bg-gold text-zinc-300 hover:text-zinc-950 border border-zinc-800 rounded-full backdrop-blur-md transition-all shadow-xl cursor-pointer"
                    title="Next Slide"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Miniature Clickable Indicators */}
                <div className="flex items-center gap-1.5 max-w-[200px] sm:max-w-md overflow-x-auto py-2 scrollbar-none">
                  {displayExcerpts.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPage([idx, idx > currentIndex ? 1 : -1])}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === currentIndex
                          ? 'w-8 bg-gold'
                          : 'w-2 bg-zinc-700/80 hover:bg-zinc-500'
                      }`}
                      title={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="w-full h-[420px] flex flex-col items-center justify-center text-zinc-500 border border-zinc-900 rounded-3xl bg-zinc-950/60 p-8 text-center">
            <ImageIcon className="w-12 h-12 text-gold/40 mb-4 animate-pulse" />
            <p className="text-zinc-300 font-serif text-lg">Loading Photos Behind the Scene...</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              The continuous gallery slideshow will begin sliding automatically once loaded.
            </p>
          </div>
        )}

        {/* --- FULLSCREEN LIGHTBOX MODAL --- */}
        <AnimatePresence>
          {lightboxIndex !== null && displayExcerpts[lightboxIndex] && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-2xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="relative max-w-6xl w-full h-[90vh] flex flex-col justify-between items-center overflow-hidden"
              >
                {/* Header */}
                <div className="w-full flex items-center justify-between p-4 bg-zinc-950/90 backdrop-blur-md rounded-2xl border border-zinc-800 z-20">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gold uppercase px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
                      {displayExcerpts[lightboxIndex].category || 'Original Photo'}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {lightboxIndex + 1} of {displayExcerpts.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLightboxIndex(null)}
                      className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Image View */}
                <div className="relative flex-1 w-full flex items-center justify-center p-2 sm:p-4 my-2 overflow-hidden">
                  <img
                    src={displayExcerpts[lightboxIndex].imageUrl}
                    alt={displayExcerpts[lightboxIndex].text}
                    loading="lazy"
                    decoding="async"
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                    referrerPolicy="no-referrer"
                  />

                  <button
                    onClick={() => setLightboxIndex((prev) => (prev !== null ? (prev - 1 + displayExcerpts.length) % displayExcerpts.length : 0))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-zinc-950/80 border border-zinc-800 text-white rounded-full hover:bg-gold hover:text-zinc-950 transition-all cursor-pointer shadow-xl"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setLightboxIndex((prev) => (prev !== null ? (prev + 1) % displayExcerpts.length : 0))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-zinc-950/80 border border-zinc-800 text-white rounded-full hover:bg-gold hover:text-zinc-950 transition-all cursor-pointer shadow-xl"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Caption Footer */}
                <div className="w-full p-4 bg-zinc-950/90 backdrop-blur-md rounded-2xl border border-zinc-800 z-20 text-center">
                  <p className="text-white text-base sm:text-lg font-serif max-w-2xl mx-auto">
                    "{displayExcerpts[lightboxIndex].text}"
                  </p>
                  <p className="text-gold text-xs font-bold uppercase tracking-widest mt-1">
                    {displayExcerpts[lightboxIndex].source}
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- ADMIN BEHIND-THE-SCENES PHOTO MANAGER MODAL --- */}
        {/* Allows admin to inspect, re-caption, or delete photos without showing a public catalog grid */}
        <AnimatePresence>
          {isAdmin && isAdminManagerOpen && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-950">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gold/10 text-gold rounded-xl">
                      <SlidersHorizontal className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Behind-the-Scenes Photo Manager</h3>
                      <p className="text-xs text-zinc-400 font-mono">
                        {excerpts.length} authentic photos actively feeding the continuous slide
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAdminManagerOpen(false)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {excerpts.map((item, idx) => (
                      <div 
                        key={item.id || idx}
                        className="flex items-center gap-3 p-3 bg-zinc-950 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors"
                      >
                        <img 
                          src={item.imageUrl} 
                          alt={item.text} 
                          className="w-16 h-16 rounded-xl object-cover border border-zinc-800 shrink-0"
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{item.text}</p>
                          <p className="text-[10px] text-gold font-mono uppercase truncate mt-0.5">{item.category}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{item.source}</p>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setIsAdminManagerOpen(false);
                              openEditForm(item);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-gold hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {item.id && (
                            <button
                              onClick={() => handleDelete(item.id!)}
                              className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex justify-between items-center">
                  <label className="flex items-center gap-2 bg-gold hover:bg-amber-500 text-zinc-950 px-4 py-2 rounded-full font-bold text-xs cursor-pointer shadow-md">
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload More Photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => setIsAdminManagerOpen(false)}
                    className="px-5 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-full text-xs transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- MULTI-IMAGE REVIEW & BATCH UPLOAD MODAL --- */}
        <AnimatePresence>
          {isMultiUploadModalOpen && (
            <div className="fixed inset-0 z-[170] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-950">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gold/10 text-gold rounded-xl">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">Multi-Photo Gallery Upload</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-gold text-zinc-950">
                          {pendingUploads.length} Selected
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">
                        Review, edit captions, and batch-upload all authentic photos into the slideshow
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!isBatchUploading) {
                        setIsMultiUploadModalOpen(false);
                      }
                    }}
                    disabled={isBatchUploading}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Batch Settings Bar (apply to all) */}
                <div className="px-6 py-3.5 bg-zinc-950/70 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400 font-mono uppercase tracking-wider text-[11px]">Set All Categories:</span>
                      <select
                        value={sharedMultiCategory}
                        onChange={(e) => applySharedCategory(e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-gold text-xs"
                      >
                        <option value="Worship Atmosphere">Worship Atmosphere</option>
                        <option value="Prophetic Altar">Prophetic Altar</option>
                        <option value="Prophetic Word">Prophetic Word</option>
                        <option value="Love in Action">Love in Action</option>
                        <option value="Divine Encounters">Divine Encounters</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400 font-mono uppercase tracking-wider text-[11px]">Source:</span>
                      <input
                        type="text"
                        value={sharedMultiSource}
                        onChange={(e) => applySharedSource(e.target.value)}
                        placeholder="Source / Assembly"
                        className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white placeholder-zinc-500 focus:outline-none focus:border-gold text-xs w-36"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium cursor-pointer transition-colors shrink-0">
                    <FolderPlus className="w-3.5 h-3.5 text-gold" />
                    <span>Select More Photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Scrollable list of pending photos */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                      {error}
                    </div>
                  )}

                  {pendingUploads.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                      <Layers className="w-10 h-10 mx-auto mb-2 opacity-40 text-gold" />
                      <p className="text-sm">No photos selected yet.</p>
                      <label className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gold text-zinc-950 font-bold rounded-full text-xs cursor-pointer hover:bg-amber-400 transition-colors">
                        <UploadCloud className="w-4 h-4" />
                        <span>Choose Multiple Photos</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingUploads.map((item, index) => (
                        <div
                          key={item.id}
                          className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors flex gap-3.5 relative group"
                        >
                          {/* Thumbnail with Index Badge */}
                          <div className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                            <img
                              src={item.dataUrl}
                              alt={item.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-mono text-gold font-bold">
                              #{index + 1}
                            </span>
                            <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[9px] font-mono text-zinc-400">
                              {item.sizeFormatted}
                            </span>
                          </div>

                          {/* Editable Fields */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                                Caption / Title:
                              </label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => updatePendingTitle(item.id, e.target.value)}
                                placeholder="Enter photo caption..."
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-gold rounded-lg px-2.5 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none"
                              />
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              <select
                                value={item.category}
                                onChange={(e) => updatePendingCategory(item.id, e.target.value)}
                                className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-gold rounded-lg px-2 py-1 text-[11px] text-zinc-300 focus:outline-none truncate"
                              >
                                <option value="Worship Atmosphere">Worship Atmosphere</option>
                                <option value="Prophetic Altar">Prophetic Altar</option>
                                <option value="Prophetic Word">Prophetic Word</option>
                                <option value="Love in Action">Love in Action</option>
                                <option value="Divine Encounters">Divine Encounters</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => removePendingUpload(item.id)}
                                disabled={isBatchUploading}
                                className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                                title="Remove photo from upload list"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upload Progress Indicator */}
                {isBatchUploading && batchProgress && (
                  <div className="px-6 py-3 bg-zinc-950/90 border-t border-zinc-800">
                    <div className="flex items-center justify-between text-xs text-zinc-300 mb-1.5">
                      <span className="flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-gold animate-bounce" />
                        <span>Uploading photo {batchProgress.current} of {batchProgress.total}...</span>
                      </span>
                      <span className="font-mono text-gold font-bold">
                        {Math.round((batchProgress.current / batchProgress.total) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold transition-all duration-300 ease-out"
                        style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingUploads([]);
                      setIsMultiUploadModalOpen(false);
                    }}
                    disabled={isBatchUploading}
                    className="px-4 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
                      {pendingUploads.length} photo{pendingUploads.length === 1 ? '' : 's'} ready
                    </span>
                    <button
                      type="button"
                      onClick={handleBatchUploadAll}
                      disabled={isBatchUploading || pendingUploads.length === 0}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gold hover:bg-amber-400 text-zinc-950 font-bold rounded-full text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {isBatchUploading
                          ? `Uploading (${batchProgress?.current || 0}/${batchProgress?.total || pendingUploads.length})...`
                          : `Upload All (${pendingUploads.length}) to Gallery`}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- ADD / EDIT FORM MODAL --- */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-950">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gold/10 text-gold rounded-xl">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {editingExcerpt ? 'Edit Slide Details' : 'Add New Slide'}
                      </h3>
                      <p className="text-xs text-zinc-400 font-mono">Continuous Gallery Slideshow</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>Slide saved successfully!</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-gold" />
                        <span>Caption / Title / Declaration</span>
                      </label>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={3}
                        placeholder="e.g. Hour of Divine Worship, Joyous Giving..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-gold text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gold" />
                          <span>Source / Speaker</span>
                        </label>
                        <input
                          type="text"
                          value={source}
                          onChange={(e) => setSource(e.target.value)}
                          placeholder="e.g. Prophet Japhet Tsukwas"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-gold text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-gold" />
                          <span>Category</span>
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold text-sm"
                        >
                          <option value="Worship Atmosphere">Worship Atmosphere</option>
                          <option value="Prophetic Altar">Prophetic Altar</option>
                          <option value="Prophetic Word">Prophetic Word</option>
                          <option value="Love in Action">Love in Action</option>
                          <option value="Divine Encounters">Divine Encounters</option>
                        </select>
                      </div>
                    </div>

                    {/* Image Upload Area */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5 text-gold" />
                        <span>Upload Photo</span>
                      </label>

                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2 transition-all ${
                          isDragging ? 'border-gold bg-gold/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/40'
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <UploadCloud className="w-8 h-8 text-gold animate-bounce" />
                        <div className="text-xs text-zinc-300">
                          <span className="text-gold font-bold">Click to choose photos (multi-select enabled)</span> or drag & drop here
                        </div>
                      </div>

                      {imageUrl && (
                        <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                          <img 
                            src={imageUrl} 
                            alt="Selected" 
                            loading="lazy"
                            decoding="async"
                            className="w-16 h-16 rounded-lg object-cover border border-zinc-800"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-zinc-300 truncate">Photo Selected</p>
                            <p className="text-[10px] text-zinc-500 truncate">Ready to save</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="p-1.5 text-red-400 hover:text-white hover:bg-red-950 rounded-lg transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 p-5 border-t border-zinc-800 bg-zinc-950">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-5 py-2.5 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full text-sm transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={success}
                      className="flex items-center gap-2 bg-gold hover:bg-amber-500 text-zinc-950 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {success ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Saved!</span>
                        </>
                      ) : (
                        <span>{editingExcerpt ? 'Update Slide' : 'Save Slide'}</span>
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
