import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Settings, 
  X, 
  Save, 
  Share2, 
  Youtube, 
  ExternalLink, 
  Activity, 
  Radio, 
  HelpCircle, 
  Check, 
  Copy, 
  Facebook, 
  MessageSquare, 
  EyeOff, 
  MessageSquareOff,
  Maximize2,
  Minimize2,
  Tv,
  ListVideo,
  Sparkles,
  Clock,
  Calendar,
  ChevronRight,
  Flame
} from 'lucide-react';
import { firebaseService, LiveStream } from '../lib/firebaseService';
import { CONTACT_INFO } from '../constants';
import LiveStreamChat from './LiveStreamChat';

// Helper function to extract video or playlist ID from various YouTube and Vimeo URL formats
export function extractMediaId(input: string, platform: 'youtube' | 'vimeo' = 'youtube'): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  if (platform === 'youtube') {
    // 1. Direct 11-char ID (e.g. gYjT55c-k_A)
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }
    // 2. Playlist format (e.g. list=PL... or list=UU...)
    const listMatch = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    if (listMatch && listMatch[1]) return listMatch[1];

    // 3. youtube.com/watch?v=...
    const vMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (vMatch && vMatch[1]) return vMatch[1];

    // 4. youtu.be/...
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch && shortMatch[1]) return shortMatch[1];

    // 5. youtube.com/live/...
    const liveMatch = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
    if (liveMatch && liveMatch[1]) return liveMatch[1];

    // 6. youtube.com/embed/...
    const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch && embedMatch[1]) return embedMatch[1];

    // 7. youtube.com/shorts/...
    const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

    // Fallback: return as-is
    return trimmed;
  } else {
    // Vimeo ID extraction
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/);
    if (vimeoMatch && vimeoMatch[3]) return vimeoMatch[3];
    return trimmed;
  }
}

// Build clean, mobile-safe, privacy-enhanced embed URL
export function buildEmbedUrl(
  mediaId: string, 
  platform: 'youtube' | 'vimeo' = 'youtube', 
  options: { autoplay?: boolean; isLive?: boolean } = {}
): string {
  if (!mediaId) return '';
  const { autoplay = true } = options;
  const autoPlayVal = autoplay ? '1' : '0';

  if (platform === 'vimeo') {
    return `https://player.vimeo.com/video/${mediaId}?autoplay=${autoPlayVal}&playsinline=1`;
  }

  // Playlist embed
  if (mediaId.startsWith('PL') || mediaId.startsWith('UU') || mediaId.startsWith('RD')) {
    return `https://www.youtube-nocookie.com/embed/videoseries?list=${mediaId}&autoplay=${autoPlayVal}&rel=0&playsinline=1&modestbranding=1`;
  }

  // Standard video embed with playsinline=1 for flawless mobile Safari/Android rendering
  return `https://www.youtube-nocookie.com/embed/${mediaId}?autoplay=${autoPlayVal}&rel=0&playsinline=1&modestbranding=1&enablejsapi=1`;
}

export interface ExistingVideoItem {
  id: string;
  title: string;
  category: string;
  speaker: string;
  date: string;
  description: string;
  duration: string;
}

// Curated authentic existing YouTube videos for Prophet Japhet Tsukwas & Photizo Porch Assembly
export const CURATED_EXISTING_VIDEOS: ExistingVideoItem[] = [
  {
    id: "gYjT55c-k_A",
    title: "Prophetic Clinic & Supernatural Impartation",
    category: "Prophetic Altar",
    speaker: "Prophet Japhet Tsukwas",
    date: "Service Replay",
    description: "Deep prophetic ministration, healing declarations, and opening of spiritual eyes for divine breakthroughs.",
    duration: "1:45:20"
  },
  {
    id: "3JZ_D3ELwOQ",
    title: "Hour of Divine Worship & Apostolic Glory",
    category: "Worship Atmosphere",
    speaker: "Photizo Assembly",
    date: "Worship Session",
    description: "Intense worship, apostolic prayers, and glorious presence of God at the Photizo Porch altar.",
    duration: "58:40"
  },
  {
    id: "tgbNymZ7vqY",
    title: "The Mystery of Spiritual Discernment & Kingdom Culture",
    category: "Prophetic Word",
    speaker: "Prophet Japhet Tsukwas",
    date: "Midweek Encounter",
    description: "Understanding the spiritual senses, navigating life's choices with divine discernment, and staying aligned with the Spirit.",
    duration: "1:12:15"
  },
  {
    id: "fJ9rUzIMcZQ",
    title: "Communion of Power, Light & Healing Altar",
    category: "Divine Encounters",
    speaker: "Prophet Japhet Tsukwas",
    date: "Communion Service",
    description: "Releasing the supernatural life through the blood and body of Christ with testimonies of divine deliverance.",
    duration: "1:30:10"
  },
  {
    id: "kJQP7kiw5Fk",
    title: "Prophetic Declarations for Supernatural Advancement",
    category: "Prophetic Altar",
    speaker: "Prophet Japhet Tsukwas",
    date: "Prophetic Watch",
    description: "Apostolic decrees and prophetic blessings unlocking doors of elevation, peace, and spiritual authority.",
    duration: "48:30"
  }
];

export default function LiveStreamHero({ isAdmin }: { isAdmin: boolean }) {
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showHowToHelp, setShowHowToHelp] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Active view: 'live' or 'replay' (existing video)
  const [activeView, setActiveView] = useState<'live' | 'replay'>('replay');
  const [selectedExistingVideo, setSelectedExistingVideo] = useState<ExistingVideoItem>(CURATED_EXISTING_VIDEOS[0]);
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [mobileTab, setMobileTab] = useState<'video' | 'chat'>('video');

  // Video container reference for full-screen handling
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Live Chat visibility (persisted in localStorage)
  const [isChatOpen, setIsChatOpen] = useState(() => {
    const saved = localStorage.getItem('photizo_hide_live_chat');
    return saved === 'true' ? false : true;
  });

  const toggleChatVisibility = (nextValue?: boolean) => {
    setIsChatOpen(prev => {
      const resolved = nextValue !== undefined ? nextValue : !prev;
      localStorage.setItem('photizo_hide_live_chat', String(!resolved));
      return resolved;
    });
  };

  // Form state for Admin Broadcast Control
  const [editForm, setEditForm] = useState<LiveStream>({
    isLive: false,
    streamId: '',
    platform: 'youtube',
    title: 'Photizo Porch Divine Service',
    hideChat: false,
    defaultVideoId: CURATED_EXISTING_VIDEOS[0].id,
    defaultVideoTitle: CURATED_EXISTING_VIDEOS[0].title
  });
  const [rawLiveUrl, setRawLiveUrl] = useState('');
  const [rawReplayUrl, setRawReplayUrl] = useState('');

  // Subscribe to live stream Firestore document
  useEffect(() => {
    const unsub = firebaseService.subscribeStream((data) => {
      setStream(data);
      if (data) {
        setEditForm(data);
        setRawLiveUrl(data.streamId || '');
        setRawReplayUrl(data.defaultVideoId || CURATED_EXISTING_VIDEOS[0].id);

        // When church goes LIVE on YouTube, automatically switch to 'live' view
        if (data.isLive) {
          setActiveView('live');
        }

        // If a default/featured replay video is configured in Firestore, update selectedExistingVideo
        if (data.defaultVideoId) {
          const matched = CURATED_EXISTING_VIDEOS.find(v => v.id === data.defaultVideoId);
          if (matched) {
            setSelectedExistingVideo(matched);
          } else {
            setSelectedExistingVideo({
              id: data.defaultVideoId,
              title: data.defaultVideoTitle || "Featured Service Replay",
              category: "Prophetic Altar",
              speaker: "Prophet Japhet Tsukwas",
              date: "Recent Broadcast",
              description: "Previous service replay from Photizo Porch Christian Assembly.",
              duration: "Full Service"
            });
          }
        }
      }
    });
    return () => unsub();
  }, []);

  // Sync fullscreen state
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      if (playerContainerRef.current.requestFullscreen) {
        playerContainerRef.current.requestFullscreen();
      } else if ((playerContainerRef.current as any).webkitRequestFullscreen) {
        (playerContainerRef.current as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleLiveUrlChange = (value: string) => {
    setRawLiveUrl(value);
    const extracted = extractMediaId(value, editForm.platform);
    setEditForm(prev => ({ ...prev, streamId: extracted }));
  };

  const handleReplayUrlChange = (value: string) => {
    setRawReplayUrl(value);
    const extracted = extractMediaId(value, 'youtube');
    setEditForm(prev => ({ ...prev, defaultVideoId: extracted }));
  };

  const handleSave = async () => {
    const finalStreamId = extractMediaId(rawLiveUrl || editForm.streamId, editForm.platform);
    const finalReplayId = extractMediaId(rawReplayUrl || editForm.defaultVideoId || '', 'youtube') || CURATED_EXISTING_VIDEOS[0].id;
    
    const updated: LiveStream = {
      ...editForm,
      streamId: finalStreamId,
      defaultVideoId: finalReplayId,
      title: editForm.title || "Photizo Porch Divine Service",
      defaultVideoTitle: editForm.defaultVideoTitle || selectedExistingVideo.title
    };
    await firebaseService.updateStream(updated);
    setIsEditing(false);
  };

  const handleToggleLiveDirect = async () => {
    const nextStatus = !stream?.isLive;
    await firebaseService.setLiveStatus(nextStatus);
    if (nextStatus) {
      setActiveView('live');
    }
  };

  const handleToggleAdminChat = async (shouldHide: boolean) => {
    if (!isAdmin) return;
    if (stream) {
      await firebaseService.updateStream({
        ...stream,
        hideChat: shouldHide
      });
    }
  };

  const handleShare = () => {
    const shareTitle = activeView === 'live'
      ? (stream?.title || "Photizo Porch Live Service")
      : selectedExistingVideo.title;

    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCustomVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVideoUrl.trim()) return;
    const extracted = extractMediaId(customVideoUrl, 'youtube');
    if (extracted) {
      const newCustomItem: ExistingVideoItem = {
        id: extracted,
        title: "Selected YouTube Message",
        category: "Prophetic Word",
        speaker: "Prophet Japhet Tsukwas",
        date: "Loaded Replay",
        description: "Custom video loaded into the Photizo Porch sanctuary player frame.",
        duration: "Full Video"
      };
      setSelectedExistingVideo(newCustomItem);
      setActiveView('replay');
      setCustomVideoUrl('');
    }
  };

  const isChatVisible = isChatOpen && !stream?.hideChat;

  // Decide current active video source and embed URL
  const currentVideoId = activeView === 'live' && stream?.streamId
    ? stream.streamId
    : (selectedExistingVideo.id || stream?.defaultVideoId || CURATED_EXISTING_VIDEOS[0].id);

  const currentPlatform = activeView === 'live' ? (stream?.platform || 'youtube') : 'youtube';
  const embedUrl = buildEmbedUrl(currentVideoId, currentPlatform, { autoplay: true });

  const activeTitle = activeView === 'live'
    ? (stream?.title || "Live Sanctuary Service")
    : selectedExistingVideo.title;

  const activeSpeaker = activeView === 'live'
    ? "Prophet Japhet Tsukwas & Ministry Altar"
    : selectedExistingVideo.speaker;

  const youtubeWatchUrl = currentPlatform === 'youtube' && currentVideoId
    ? `https://www.youtube.com/watch?v=${currentVideoId}`
    : CONTACT_INFO.youtube;

  return (
    <section id="live" className="relative px-3.5 sm:px-6 py-8 sm:py-14 md:py-20 bg-zinc-950 overflow-hidden border-b border-zinc-900 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Stream Banner Header: Responsive across phones, tablets, and desktops */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-3.5 sm:gap-5 w-full md:w-auto">
            <div className="relative shrink-0">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all ${
                stream?.isLive 
                  ? 'bg-red-600/20 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.35)] ring-2 ring-red-500/40' 
                  : 'bg-zinc-900 border border-zinc-800 text-gold'
              }`}>
                {stream?.isLive ? (
                  <Radio className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse text-red-500" />
                ) : (
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-gold text-gold" />
                )}
              </div>
              {stream?.isLive && (
                <div className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-lg">
                  LIVE
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                  stream?.isLive 
                    ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}>
                  {stream?.isLive ? '● On Air Broadcast' : 'Sanctuary Broadcast Altar'}
                </span>
                {stream?.isLive && (
                  <span className="text-[11px] sm:text-xs text-zinc-400 flex items-center gap-1">
                    <Activity size={12} className="text-red-500 animate-spin" /> Live Stream
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white glow-text truncate">
                {stream?.isLive ? (stream?.title || "Divine Service Broadcast") : "Live Streaming & Broadcast Sanctuary"}
              </h2>
            </div>
          </div>
          
          {/* Controls: Direct isLive Switch, Admin Settings & Sharing */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-start md:justify-end">
            {isAdmin && (
              <>
                {/* Manual 'isLive' direct toggle switch */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 shadow-inner">
                  <span className="text-xs font-semibold text-zinc-300">Live Status:</span>
                  <button
                    type="button"
                    onClick={handleToggleLiveDirect}
                    className={`relative w-11 sm:w-12 h-6 rounded-full p-0.5 transition-all cursor-pointer ${
                      stream?.isLive 
                        ? 'bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.6)]' 
                        : 'bg-zinc-800 hover:bg-zinc-750'
                    }`}
                    title={stream?.isLive ? 'Click to switch to OFF-AIR' : 'Click to start LIVE broadcast'}
                    aria-label="Toggle Live Broadcast Status"
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform flex items-center justify-center ${stream?.isLive ? 'translate-x-5 sm:translate-x-6' : ''}`}>
                      {stream?.isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                    </div>
                  </button>
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest ${stream?.isLive ? 'text-red-400 animate-pulse' : 'text-zinc-500'}`}>
                    {stream?.isLive ? 'ON AIR' : 'OFF'}
                  </span>
                </div>

                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:border-gold text-zinc-200 hover:text-gold px-3.5 sm:px-4 py-2 rounded-full font-semibold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer"
                  title="Configure broadcast link, title, and platform"
                >
                  <Settings size={14} />
                  <span className="hidden sm:inline">Settings</span>
                </button>
              </>
            )}

            {/* Fellowship Live Chat Toggle Button */}
            <button
              onClick={() => {
                if (stream?.hideChat && isAdmin) {
                  handleToggleAdminChat(false);
                } else {
                  toggleChatVisibility();
                }
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-full font-semibold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer border ${
                isChatVisible
                  ? 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800 hover:border-red-500/50'
                  : 'bg-gold text-zinc-950 font-bold border-gold shadow-[0_0_15px_var(--theme-glow,rgba(212,175,55,0.3))]'
              }`}
              title={isChatVisible ? "Hide live fellowship chat" : "Open live fellowship chat"}
            >
              {isChatVisible ? (
                <>
                  <EyeOff size={14} className="text-zinc-400 group-hover:text-red-400" />
                  <span>Hide Chat</span>
                </>
              ) : (
                <>
                  <MessageSquare size={14} className="text-zinc-950" />
                  <span>Show Chat</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-gold/50 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-md"
              title="Share Stream Link"
            >
              {copiedLink ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
            </button>
          </div>
        </div>

        {/* --- DYNAMIC MODE SWITCHER BAR: LIVE vs EXISTING VIDEOS --- */}
        <div className="mb-4 sm:mb-6 p-2 bg-zinc-900/90 border border-zinc-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
          {/* Primary View Toggle: Live Broadcast vs Existing Replays */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-850">
            <button
              type="button"
              onClick={() => setActiveView('live')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'live'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${stream?.isLive ? 'animate-pulse text-white' : ''}`} />
              <span>Live Broadcast</span>
              {stream?.isLive ? (
                <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono uppercase tracking-wider font-extrabold animate-pulse">
                  ON AIR
                </span>
              ) : (
                <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">(Off-Air)</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveView('replay')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'replay'
                  ? 'bg-gold text-zinc-950 shadow-md font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Existing Videos & Replays</span>
              <span className="bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {CURATED_EXISTING_VIDEOS.length}
              </span>
            </button>
          </div>

          {/* Quick status notice / switch prompt */}
          <div className="flex items-center gap-3 text-xs">
            {stream?.isLive && activeView === 'replay' && (
              <motion.button
                initial={{ scale: 0.95 }}
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                onClick={() => setActiveView('live')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.5)] cursor-pointer hover:bg-red-500 transition-colors"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Switch to Live Stream Now</span>
                <ChevronRight className="w-3 h-3" />
              </motion.button>
            )}

            {!stream?.isLive && activeView === 'live' && (
              <div className="text-zinc-400 text-xs flex items-center gap-2">
                <span>Broadcast is off-air.</span>
                <button
                  onClick={() => setActiveView('replay')}
                  className="text-gold hover:underline font-bold"
                >
                  Watch existing sermons &rarr;
                </button>
              </div>
            )}

            {/* Theater Mode toggle (Desktop/Tablet) */}
            <button
              onClick={() => setTheaterMode(!theaterMode)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer text-xs"
              title={theaterMode ? "Exit Theater View" : "Full Width Theater View"}
            >
              {theaterMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span>{theaterMode ? 'Exit Theater' : 'Theater View'}</span>
            </button>
          </div>
        </div>

        {/* --- MAIN PLAYER FRAME GRID: VIDEO SCREEN + LIVE CHAT --- */}
        <div className={`grid gap-6 items-start ${
          isChatVisible && !theaterMode 
            ? 'grid-cols-1 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {/* Left Column: Responsive 16:9 Video Screen & Controls */}
          <div className={isChatVisible && !theaterMode ? 'lg:col-span-2' : 'w-full'}>
            
            {/* --- ADAPTIVE 16:9 VIDEO FRAME CONTAINER --- */}
            <div 
              ref={playerContainerRef}
              className="relative w-full aspect-video rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden border border-zinc-800 bg-black shadow-[0_0_60px_-15px_var(--theme-glow-soft,rgba(212,175,55,0.2))] group"
            >
              {/* If activeView is 'live' and streamId is valid: Play Live Stream */}
              {activeView === 'live' && stream?.streamId ? (
                <div className="w-full h-full relative">
                  <iframe 
                    className="w-full h-full border-0"
                    src={embedUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title={activeTitle}
                  />

                  {/* Top overlay indicators */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 pointer-events-none">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white font-extrabold text-[10px] sm:text-xs tracking-wider uppercase backdrop-blur-md shadow-lg animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      LIVE ON AIR
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
                    <button
                      onClick={handleToggleFullscreen}
                      className="p-2 rounded-full bg-black/75 hover:bg-black backdrop-blur-md border border-white/20 text-white hover:text-gold transition-colors cursor-pointer shadow-lg"
                      title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                      {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                    <a
                      href={youtubeWatchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black backdrop-blur-md border border-white/20 text-white text-xs font-semibold hover:border-red-500 transition-all shadow-xl"
                    >
                      <Youtube size={14} className="text-red-500" />
                      <span className="hidden sm:inline">Open YouTube</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ) : activeView === 'live' && !stream?.streamId ? (
                /* Live view clicked, but no live stream currently active */
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-gold shadow-xl">
                    <Radio className="w-8 h-8 text-gold/60" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif text-white mb-2">No Live Stream Currently On Air</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mb-6">
                    Our live broadcast will automatically play here when service begins. In the meantime, enjoy previous messages and sermons from our sanctuary archive!
                  </p>
                  <button
                    onClick={() => setActiveView('replay')}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-zinc-950" />
                    <span>Watch Existing Sermons & Replays</span>
                  </button>
                </div>
              ) : (
                /* --- EXISTING YOUTUBE VIDEOS PLAYBACK (NO BLANK SCREEN) --- */
                <div className="w-full h-full relative">
                  <iframe 
                    className="w-full h-full border-0"
                    src={embedUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title={activeTitle}
                  />

                  {/* Replay indicator banner overlay */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 pointer-events-none">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700 text-gold font-bold text-[10px] sm:text-xs tracking-wider uppercase backdrop-blur-md shadow-lg">
                      <Tv size={12} className="text-gold" />
                      <span>SANCTUARY REPLAY</span>
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
                    <button
                      onClick={handleToggleFullscreen}
                      className="p-2 rounded-full bg-black/75 hover:bg-black backdrop-blur-md border border-white/20 text-white hover:text-gold transition-colors cursor-pointer shadow-lg"
                      title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                      {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                    <a
                      href={youtubeWatchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black backdrop-blur-md border border-white/20 text-white text-xs font-semibold hover:border-red-500 transition-all shadow-xl"
                    >
                      <Youtube size={14} className="text-red-500" />
                      <span className="hidden sm:inline">Open YouTube</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  {/* If church goes live while watching a replay, flash an interactive floating banner */}
                  {stream?.isLive && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="absolute bottom-4 left-4 right-4 z-30 p-3 rounded-2xl bg-black/90 border border-red-500/80 backdrop-blur-md flex items-center justify-between gap-3 shadow-2xl"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                        <div className="truncate text-xs">
                          <p className="font-bold text-white truncate">
                            🔴 Prophet Japhet Tsukwas is LIVE NOW!
                          </p>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {stream.title || "Photizo Porch Divine Service"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveView('live')}
                        className="px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shrink-0 transition-colors cursor-pointer shadow-md"
                      >
                        Switch to Live ⚡
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* --- CURRENT PLAYING TITLE & DETAILS CARD --- */}
            <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-gold/10 text-gold border border-gold/20">
                    {activeView === 'live' ? 'Live Stream' : selectedExistingVideo.category}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">
                    &bull; {activeSpeaker}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white truncate">
                  {activeTitle}
                </h3>
                {activeView === 'replay' && selectedExistingVideo.description && (
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                    {selectedExistingVideo.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                {activeView === 'replay' && stream?.isLive && (
                  <button
                    onClick={() => setActiveView('live')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    <Radio size={14} className="animate-pulse" />
                    <span>Go to Live Stream</span>
                  </button>
                )}
                <a
                  href={CONTACT_INFO.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  <Youtube size={14} className="text-red-500" />
                  <span>More on YouTube</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* --- EXISTING VIDEOS ARCHIVE / REPLAY SELECTOR SHELF --- */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ListVideo className="w-4 h-4 text-gold" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Existing Sermons & Services Replays
                  </h4>
                </div>
                <span className="text-xs text-zinc-400 font-mono">
                  Click any message to play
                </span>
              </div>

              {/* Scrollable grid of existing YouTube videos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {CURATED_EXISTING_VIDEOS.map((video) => {
                  const isSelected = activeView === 'replay' && selectedExistingVideo.id === video.id;
                  return (
                    <button
                      key={video.id}
                      onClick={() => {
                        setSelectedExistingVideo(video);
                        setActiveView('replay');
                      }}
                      className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                        isSelected
                          ? 'bg-zinc-900 border-gold shadow-[0_0_20px_rgba(212,175,55,0.2)] ring-1 ring-gold'
                          : 'bg-zinc-950/80 border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-900/60'
                      }`}
                    >
                      {/* Thumbnail wrapper */}
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-900 mb-2.5 border border-zinc-800">
                        <img 
                          src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors flex items-center justify-center">
                          <div className={`p-2 rounded-full transition-transform ${
                            isSelected ? 'bg-gold text-zinc-950 scale-110' : 'bg-black/60 text-white group-hover:scale-110'
                          }`}>
                            <Play size={12} className="fill-current" />
                          </div>
                        </div>
                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-zinc-300 font-bold">
                          {video.duration}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                          <span className="text-gold font-mono uppercase">{video.category}</span>
                          <span>{video.date}</span>
                        </div>
                        <h5 className={`text-xs font-bold line-clamp-2 leading-snug transition-colors ${
                          isSelected ? 'text-gold' : 'text-zinc-200 group-hover:text-white'
                        }`}>
                          {video.title}
                        </h5>
                        <p className="text-[11px] text-zinc-500 truncate mt-1">
                          {video.speaker}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Paste any YouTube link to play immediately */}
              <form onSubmit={handleCustomVideoSubmit} className="mt-4 p-3 bg-zinc-950 rounded-2xl border border-zinc-800/80 flex flex-col sm:flex-row items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-zinc-400 shrink-0 px-2">
                  <Youtube className="w-4 h-4 text-red-500" />
                  <span>Play other YouTube link:</span>
                </div>
                <input
                  type="text"
                  value={customVideoUrl}
                  onChange={(e) => setCustomVideoUrl(e.target.value)}
                  placeholder="Paste YouTube video or live URL (e.g. https://youtu.be/...)"
                  className="flex-1 w-full bg-zinc-900 border border-zinc-800 focus:border-gold rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 outline-none"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-800 hover:bg-gold hover:text-zinc-950 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                >
                  Load & Play
                </button>
              </form>
            </div>

            {/* When Chat is Hidden: Notice banner */}
            {!isChatVisible && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md"
              >
                <div className="flex items-center gap-2.5 text-zinc-300">
                  <MessageSquareOff size={16} className="text-gold shrink-0" />
                  <span>
                    {stream?.hideChat 
                      ? "Live fellowship chat is currently paused by ministry administration."
                      : "Live fellowship chat is hidden for theater viewing. You can bring back the chat at any time."}
                  </span>
                </div>
                {!stream?.hideChat ? (
                  <button
                    onClick={() => toggleChatVisibility(true)}
                    className="px-4 py-2 rounded-xl bg-gold hover:brightness-110 text-zinc-950 font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-md text-xs"
                  >
                    <MessageSquare size={14} />
                    <span>Show Live Chat</span>
                  </button>
                ) : isAdmin ? (
                  <button
                    onClick={() => handleToggleAdminChat(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gold font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer border border-gold/40 text-xs"
                  >
                    <MessageSquare size={14} />
                    <span>Enable Chat for Congregation</span>
                  </button>
                ) : null}
              </motion.div>
            )}
          </div>

          {/* Right Column: Real-Time Live Fellowship Chat */}
          {isChatVisible && !theaterMode && (
            <div className="lg:col-span-1 h-[480px] sm:h-[520px] lg:h-[620px] w-full">
              <LiveStreamChat isAdmin={isAdmin} onHide={() => toggleChatVisibility(false)} />
            </div>
          )}
        </div>
      </div>

      {/* --- ADMIN SETTINGS MODAL: BROADCAST CONTROL CENTER --- */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-600/10 text-red-500">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-white">Broadcast Control Center</h3>
                    <p className="text-xs text-zinc-400">
                      Configure YouTube Live stream, titles, and fallback existing video replays
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-2 text-zinc-400 hover:text-white bg-zinc-950 rounded-full border border-zinc-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Step-by-Step Instructions Toggle */}
              <div className="mb-6 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowHowToHelp(!showHowToHelp)}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-gold uppercase tracking-wider">
                    <HelpCircle size={15} />
                    <span>How to Connect Your Live Broadcast (Quick 3-Step Guide)</span>
                  </div>
                  <span className="text-xs text-zinc-400 hover:text-white underline">
                    {showHowToHelp ? 'Hide' : 'Show'}
                  </span>
                </div>

                {showHowToHelp && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-3 border-t border-zinc-800 text-xs text-zinc-300 space-y-2.5 leading-relaxed"
                  >
                    <p className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-gold text-zinc-950 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                      <span><strong>Start your broadcast:</strong> Go to YouTube Studio or YouTube app and start your Live Stream (or locate your scheduled broadcast link).</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-gold text-zinc-950 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                      <span><strong>Copy and paste the URL:</strong> Copy the YouTube share link (e.g. <code>https://youtube.com/live/xxxx</code> or <code>https://youtu.be/xxxx</code>) into the Live Link field below. The system automatically extracts the ID for you!</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-gold text-zinc-950 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                      <span><strong>Toggle Live Status ON:</strong> Flip the "Broadcast Status" toggle to <strong>LIVE</strong>, and click <strong>Save & Go Live</strong>. Visitors will instantly see your live stream! When off-air, existing videos automatically load and play instead of a blank screen.</span>
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="space-y-5">
                {/* Live Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <div>
                    <h4 className="font-bold text-sm text-white">Broadcast Status</h4>
                    <p className="text-xs text-zinc-400">
                      {editForm.isLive ? 'Service is currently marked as LIVE NOW on website' : 'Stream is currently marked OFF-AIR (existing videos will play)'}
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setEditForm(prev => ({ ...prev, isLive: !prev.isLive }))}
                    className={`relative w-16 h-8 rounded-full p-1 transition-colors cursor-pointer ${editForm.isLive ? 'bg-red-600' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${editForm.isLive ? 'translate-x-8' : ''}`} />
                  </button>
                </div>

                {/* Live Fellowship Chat Toggle (Admin) */}
                <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <div>
                    <h4 className="font-bold text-sm text-white">Fellowship Live Chat</h4>
                    <p className="text-xs text-zinc-400">
                      {editForm.hideChat 
                        ? 'Chat is disabled and removed for all congregation members' 
                        : 'Chat is enabled for real-time fellowship interactions'}
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setEditForm(prev => ({ ...prev, hideChat: !prev.hideChat }))}
                    className={`relative w-16 h-8 rounded-full p-1 transition-colors cursor-pointer ${!editForm.hideChat ? 'bg-gold' : 'bg-zinc-800'}`}
                    title={editForm.hideChat ? "Click to enable live chat" : "Click to hide / remove live chat for congregation"}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${!editForm.hideChat ? 'translate-x-8' : ''}`} />
                  </button>
                </div>

                {/* Service Title */}
                <div>
                  <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">
                    Live Service Title
                  </label>
                  <input 
                    type="text" 
                    value={editForm.title || ''}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-white focus:border-gold outline-none"
                    placeholder="e.g. Sunday Prophetic & Communion Service"
                  />
                </div>

                {/* Platform and Stream Link */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">
                      Platform
                    </label>
                    <select 
                      value={editForm.platform}
                      onChange={e => setEditForm({ ...editForm, platform: e.target.value as any })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-white focus:border-gold outline-none"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="vimeo">Vimeo</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                      <span>YouTube Live Link or Video ID</span>
                      {editForm.streamId && (
                        <span className="text-[10px] text-green-400 font-mono">
                          ID: {editForm.streamId}
                        </span>
                      )}
                    </label>
                    <input 
                      type="text" 
                      value={rawLiveUrl}
                      onChange={e => handleLiveUrlChange(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-white focus:border-gold outline-none font-mono placeholder:text-zinc-600"
                      placeholder="Paste live link: https://youtube.com/live/... or video ID"
                    />
                  </div>
                </div>

                {/* Featured Existing Video Replay Link (plays when off-air) */}
                <div>
                  <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                    <span>Default Replay Video Link (Plays When Off-Air)</span>
                    {editForm.defaultVideoId && (
                      <span className="text-[10px] text-gold font-mono">
                        Replay ID: {editForm.defaultVideoId}
                      </span>
                    )}
                  </label>
                  <input 
                    type="text" 
                    value={rawReplayUrl}
                    onChange={e => handleReplayUrlChange(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-white focus:border-gold outline-none font-mono placeholder:text-zinc-600"
                    placeholder="Paste link to existing service video (e.g. https://youtu.be/...)"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    When the church is not live, this YouTube video loads and plays immediately so visitors never see a blank screen.
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-zinc-500">Quick presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setRawLiveUrl(CONTACT_INFO.youtube);
                      handleLiveUrlChange(CONTACT_INFO.youtube);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-gold hover:border-gold/50 cursor-pointer"
                  >
                    Prophet's Channel Link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRawReplayUrl(CURATED_EXISTING_VIDEOS[0].id);
                      handleReplayUrlChange(CURATED_EXISTING_VIDEOS[0].id);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-gold hover:border-gold/50 cursor-pointer"
                  >
                    Set Prophetic Clinic as Default Replay
                  </button>
                </div>

                {/* Live Preview If ID Provided */}
                {editForm.streamId && (
                  <div className="mt-4 p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mb-2">
                      Live Stream Preview:
                    </span>
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                      <iframe 
                        className="w-full h-full border-0"
                        src={buildEmbedUrl(editForm.streamId, editForm.platform, { autoplay: false })}
                        title="Stream Preview"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-8 pt-4 border-t border-zinc-800">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleSave}
                  className="flex-1 py-3.5 bg-gold text-zinc-950 rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save size={16} /> 
                  <span>{editForm.isLive ? 'Publish & Go Live Now' : 'Save Broadcast Settings'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
