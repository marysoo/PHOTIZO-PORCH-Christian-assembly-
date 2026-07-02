import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Clock, 
  User, 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  Disc, 
  FileAudio, 
  X, 
  Sliders, 
  Activity, 
  ListMusic,
  Share2,
  AlertTriangle,
  RotateCcw,
  SkipForward
} from 'lucide-react';
import { firebaseService, Sermon } from '../lib/firebaseService';

const SERMON_CATEGORIES = [
  "Prophetic Word",
  "Sunday Message",
  "Teaching",
  "Faith & Miracles",
  "Deliverance"
];

const CATEGORY_STYLES: { [key: string]: { text: string; bg: string; border: string } } = {
  "Prophetic Word": { text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-500/20" },
  "Sunday Message": { text: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-500/20" },
  "Teaching": { text: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-500/20" },
  "Faith & Miracles": { text: "text-red-400", bg: "bg-red-400/10", border: "border-red-500/20" },
  "Deliverance": { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-500/20" }
};

interface AudioSermonsProps {
  isAdmin: boolean;
}

export default function AudioSermons({ isAdmin }: AudioSermonsProps) {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Player state
  const [currentPlaying, setCurrentPlaying] = useState<Sermon | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Admin Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  
  // Admin Form state
  const [formTitle, setFormTitle] = useState('');
  const [formSpeaker, setFormSpeaker] = useState('Prophet Japeth Tsukwas');
  const [formDate, setFormDate] = useState('2026-07-02');
  const [formAudioUrl, setFormAudioUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState(SERMON_CATEGORIES[0]);
  const [formDuration, setFormDuration] = useState('10:00');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Audio HTML5 ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch sermons
  useEffect(() => {
    const unsubscribe = firebaseService.subscribeSermons((data) => {
      setSermons(data);
      
      // Auto-bootstrap sample sermons if empty and admin is viewing
      if (data.length === 0 && isAdmin) {
        const initialSermons: Sermon[] = [
          {
            title: "Establishing Your Prophetic Season",
            speaker: "Prophet Japeth Tsukwas",
            date: "2026-06-28",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            category: "Prophetic Word",
            description: "An atmospheric message detailing how to identify, align, and cooperatively run with the prophetic instructions of God for your current season.",
            duration: "12:34"
          },
          {
            title: "The Supernatural Dimension of Faith",
            speaker: "Prophet Japeth Tsukwas",
            date: "2026-06-21",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            category: "Teaching",
            description: "Understanding the exact laws of divine faith, supernatural confessions, and stepping beyond intellectual limits to tap into the divine treasury.",
            duration: "07:05"
          },
          {
            title: "The Mantle of Healing & Deliverance",
            speaker: "Prophet Japeth Tsukwas",
            date: "2026-06-14",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            category: "Faith & Miracles",
            description: "A profound teaching from our Atmosphere of Miracles service, exploring how the prophetic mantle breaks physical and emotional infirmities.",
            duration: "10:15"
          }
        ];

        initialSermons.forEach(s => {
          firebaseService.upsertSermon(s);
        });
      }
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Update audio controls on source change
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Sync state with audio element
  useEffect(() => {
    if (!audioRef.current || !currentPlaying) return;
    
    // If audio source is different, change it
    if (audioRef.current.src !== currentPlaying.audioUrl) {
      audioRef.current.src = currentPlaying.audioUrl;
      audioRef.current.load();
    }

    // Set playback rate & volume
    audioRef.current.playbackRate = playbackRate;
    audioRef.current.volume = isMuted ? 0 : volume;

    if (isPlaying) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [currentPlaying, isPlaying, volume, isMuted, playbackRate]);

  // Media Session API integration for Lock Screen and Notification controls (especially for Android and mobile browsers)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentPlaying) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentPlaying.title,
        artist: currentPlaying.speaker,
        album: currentPlaying.category,
        artwork: [
          { src: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=512&q=80', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      // Update state in media session
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      
      navigator.mediaSession.setActionHandler('seekbackward', () => {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
        }
      });
      navigator.mediaSession.setActionHandler('seekforward', () => {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + 10);
        }
      });
    } catch (e) {
      console.warn("MediaSession not fully supported or blocked:", e);
    }
  }, [currentPlaying, isPlaying]);

  const handlePlayToggle = (sermon: Sermon) => {
    if (currentPlaying?.id === sermon.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentPlaying(sermon);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const openAddModal = () => {
    setEditingSermon(null);
    setFormTitle('');
    setFormSpeaker('Prophet Japeth Tsukwas');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormAudioUrl('');
    setFormDescription('');
    setFormCategory(SERMON_CATEGORIES[0]);
    setFormDuration('12:00');
    setFormError('');
    setShowFormModal(true);
  };

  const openEditModal = (sermon: Sermon, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSermon(sermon);
    setFormTitle(sermon.title);
    setFormSpeaker(sermon.speaker);
    setFormDate(sermon.date);
    setFormAudioUrl(sermon.audioUrl);
    setFormDescription(sermon.description);
    setFormCategory(sermon.category);
    setFormDuration(sermon.duration || '10:00');
    setFormError('');
    setShowFormModal(true);
  };

  const handleDeleteSermon = async (sermonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to permanently delete this audio sermon?')) {
      try {
        await firebaseService.deleteSermon(sermonId);
        if (currentPlaying?.id === sermonId) {
          setIsPlaying(false);
          setCurrentPlaying(null);
        }
      } catch (err) {
        alert('Failed to delete sermon.');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSpeaker.trim() || !formAudioUrl.trim() || !formDescription.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const sermonPayload: Sermon = {
      ...(editingSermon?.id ? { id: editingSermon.id } : {}),
      title: formTitle.trim(),
      speaker: formSpeaker.trim(),
      date: formDate,
      audioUrl: formAudioUrl.trim(),
      description: formDescription.trim(),
      category: formCategory,
      duration: formDuration.trim()
    };

    try {
      await firebaseService.upsertSermon(sermonPayload);
      setShowFormModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save sermon. Check Firestore permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skip 10s backward or forward
  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
    }
  };

  // Filter & Search sermons
  const filteredSermons = sermons.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.speaker.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="sermons" className="py-24 px-6 border-b border-zinc-900 bg-zinc-950/40 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Title Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="text-left">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-[0.25em] block mb-2">Spiritual Audio & Teachings</span>
            <h2 className="text-4xl md:text-5xl font-serif text-white glow-text">Sermons & Podcasts</h2>
            <p className="text-zinc-400 text-sm mt-2 max-w-lg">
              Feed your spirit with anointed prophetic messages, teachings, and spiritual insights posted directly by Prophet Japeth Tsukwas.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button 
                onClick={openAddModal}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-bold px-5 py-3 rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all text-xs uppercase tracking-wider"
              >
                <Plus size={16} /> Post Sermon Link
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-6 border-b border-zinc-900/60">
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === 'All'
                  ? 'bg-amber-400 text-zinc-950 font-bold shadow-lg shadow-amber-400/10'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              All Sermons
            </button>
            {SERMON_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-lg shadow-amber-400/10'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teachings, speaker..."
              className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-full pl-11 pr-5 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-400 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Sermons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSermons.length === 0 ? (
            <div className="col-span-full py-16 text-center border border-dashed border-zinc-900 rounded-3xl">
              <FileAudio className="w-10 h-10 text-zinc-700 mx-auto mb-4 animate-pulse" />
              <p className="text-zinc-400 font-serif text-lg mb-1">No sermons posted</p>
              <p className="text-zinc-500 text-xs">There are no audio messages matching your filters at the moment.</p>
            </div>
          ) : (
            filteredSermons.map(s => {
              const styles = CATEGORY_STYLES[s.category] || { text: "text-zinc-400", bg: "bg-zinc-900", border: "border-zinc-800" };
              const isCurrent = currentPlaying?.id === s.id;
              
              return (
                <motion.div
                  key={s.id}
                  layout
                  className={`relative group bg-gradient-to-br from-zinc-900/80 to-zinc-950 border rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between h-80 shadow-lg ${
                    isCurrent 
                      ? 'border-amber-400/60 shadow-[0_0_25px_rgba(212,175,55,0.05)]' 
                      : 'border-zinc-900 hover:border-zinc-800/80'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.01] rounded-full blur-2xl pointer-events-none" />
                  
                  {/* Top segment */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${styles.bg} ${styles.text} ${styles.border}`}>
                        {s.category}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                        <Clock size={11} /> {s.duration || '12:00'}
                      </span>
                    </div>

                    <h3 className="text-lg font-serif text-white font-medium line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
                      {s.title}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-500">
                      <User size={12} className="text-zinc-600" />
                      <span>{s.speaker}</span>
                    </div>

                    <p className="text-zinc-400 text-xs mt-3.5 line-clamp-3 leading-relaxed">
                      {s.description}
                    </p>
                  </div>

                  {/* Play & Bottom segment */}
                  <div className="flex items-center justify-between border-t border-zinc-900/80 pt-4 mt-6">
                    <span className="text-[10px] text-zinc-600 font-mono">
                      Posted {s.date ? new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    </span>

                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <div className="flex gap-1.5 mr-2">
                          <button
                            onClick={(e) => openEditModal(s, e)}
                            className="p-2 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteSermon(s.id!, e)}
                            className="p-2 bg-zinc-900/60 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => handlePlayToggle(s)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
                          isCurrent && isPlaying
                            ? 'bg-amber-400 text-zinc-950 font-bold scale-105'
                            : 'bg-zinc-800 hover:bg-amber-400 text-zinc-300 hover:text-zinc-950 group-hover:scale-105'
                        }`}
                      >
                        {isCurrent && isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

      </div>

      {/* Persistent Audio Player Bar (Floating at bottom of screen) */}
      <AnimatePresence>
        {currentPlaying && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[450px] bg-zinc-950/95 border border-zinc-800 backdrop-blur-md rounded-2xl p-4 shadow-2xl z-[90] flex flex-col gap-3 text-left"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800/80 shrink-0 relative overflow-hidden group">
                  <Disc className={`w-6 h-6 text-amber-400 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                </div>
                
                <div className="min-w-0">
                  <h4 className="text-sm font-serif font-medium text-white truncate leading-tight">{currentPlaying.title}</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{currentPlaying.speaker} • {currentPlaying.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button 
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="px-3 py-2 text-[10px] font-mono font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/60 rounded-xl text-zinc-400 hover:text-white transition-colors uppercase min-h-[44px] flex items-center justify-center"
                  title="Speed"
                >
                  {playbackRate}x
                </button>
                <button 
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentPlaying(null);
                  }}
                  className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Playback speed contextual floating panel */}
            {showSpeedMenu && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 flex gap-1 justify-around absolute bottom-20 right-4 shadow-xl z-[95]">
                {[0.75, 1, 1.25, 1.5, 2].map(rate => (
                  <button
                    key={rate}
                    onClick={() => {
                      setPlaybackRate(rate);
                      setShowSpeedMenu(false);
                    }}
                    className={`px-2.5 py-1 text-[10px] rounded font-mono font-bold transition-all ${
                      playbackRate === rate ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}

            {/* Progress Bar slider */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <input 
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 bg-zinc-800 h-1 rounded-full appearance-none cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Audio Controls row */}
            <div className="flex items-center justify-between border-t border-zinc-900/60 pt-2 mt-1">
              {/* Back / Forward 10s */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={skipBackward}
                  className="w-11 h-11 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                  title="Backward 10s"
                >
                  <RotateCcw size={16} />
                </button>
                <button 
                  onClick={skipForward}
                  className="w-11 h-11 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                  title="Forward 10s"
                >
                  <SkipForward size={16} />
                </button>
              </div>

              {/* Main Play / Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-all shadow-md shadow-amber-400/10 shrink-0"
              >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
              </button>

              {/* Volume / Mute */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <input 
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-14 accent-zinc-300 bg-zinc-800 h-1 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Post / Edit Sermon Modal */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFormModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sliders className="text-amber-400 w-5 h-5 animate-pulse" />
                  <h3 className="text-xl font-serif text-white font-bold">
                    {editingSermon ? 'Edit Audio Teaching' : 'Post Audio Message / Podcast'}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowFormModal(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {formError && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-5">
                
                {/* Title */}
                <div className="text-left">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-1.5">Sermon Title *</label>
                  <input 
                    type="text" 
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Supernatural Speed and Acceleration"
                    className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="text-left">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-1.5">Category *</label>
                    <select 
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-3 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 transition-colors appearance-none"
                    >
                      {SERMON_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div className="text-left">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-1.5">Publish Date *</label>
                    <input 
                      type="date" 
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Speaker */}
                  <div className="text-left">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-1.5">Speaker Name *</label>
                    <input 
                      type="text" 
                      value={formSpeaker}
                      onChange={(e) => setFormSpeaker(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 transition-colors"
                      required
                    />
                  </div>

                  {/* Duration label */}
                  <div className="text-left">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-1.5">Duration (e.g. 15:45) *</label>
                    <input 
                      type="text" 
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      placeholder="e.g. 12:34"
                      className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Direct MP3 Audio Link / URL */}
                <div className="text-left">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block">Audio Stream URL *</label>
                    <span className="text-[9px] text-zinc-500 font-medium">Must be a direct audio link (e.g. .mp3)</span>
                  </div>
                  <input 
                    type="url" 
                    value={formAudioUrl}
                    onChange={(e) => setFormAudioUrl(e.target.value)}
                    placeholder="https://example.com/sermon.mp3"
                    className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 transition-colors"
                    required
                  />
                </div>

                {/* Description */}
                <div className="text-left">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-1.5">Short Message Summary *</label>
                  <textarea 
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Provide a quick summary of the prophetic points, scripture references, or core focus discussed..."
                    className="w-full h-24 bg-zinc-900 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                    required
                  />
                </div>

                {/* Submits */}
                <div className="flex gap-3 pt-4 border-t border-zinc-900">
                  <button 
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="flex-1 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold rounded-xl transition-all text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-zinc-950 font-bold rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Saving...' : (editingSermon ? 'Save Changes' : 'Publish Sermon')}
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
