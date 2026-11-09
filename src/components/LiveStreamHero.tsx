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
  Facebook, 
  MessageSquare, 
  EyeOff, 
  MessageSquareOff,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { firebaseService, LiveStream } from '../lib/firebaseService';
import { CONTACT_INFO } from '../constants';
import LiveStreamChat from './LiveStreamChat';

// Helper function to extract video or playlist ID from various YouTube, Facebook, and Vimeo URL formats
export function extractMediaId(input: string, platform: 'youtube' | 'facebook' | 'vimeo' = 'youtube'): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  if (platform === 'facebook') {
    return trimmed;
  }

  if (platform === 'youtube') {
    // 1. Direct 11-char ID (e.g. dQw4w9WgXcQ)
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

    // Direct token if safe (between 8 and 34 alphanumeric chars)
    if (/^[a-zA-Z0-9_-]{8,34}$/.test(trimmed)) {
      return trimmed;
    }

    return trimmed;
  } else {
    // Vimeo ID extraction
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/);
    if (vimeoMatch && vimeoMatch[3]) return vimeoMatch[3];
    if (/^\d+$/.test(trimmed)) return trimmed;
    return trimmed;
  }
}

// Build clean, mobile-safe, privacy-enhanced embed URL
export function buildEmbedUrl(
  mediaId: string, 
  platform: 'youtube' | 'facebook' | 'vimeo' = 'youtube', 
  options: { autoplay?: boolean } = {}
): string {
  const cleanId = mediaId?.trim();
  if (!cleanId) return '';

  const { autoplay = true } = options;
  const autoPlayVal = autoplay ? '1' : '0';

  if (platform === 'facebook') {
    const fbHref = cleanId.startsWith('http') ? cleanId : `https://www.facebook.com/watch/?v=${cleanId}`;
    return `https://www.facebook.com/plugins/video.php?height=476&href=${encodeURIComponent(fbHref)}&show_text=false&width=476&autoplay=${autoPlayVal}&mute=0`;
  }

  if (platform === 'vimeo') {
    return `https://player.vimeo.com/video/${cleanId}?autoplay=${autoPlayVal}&playsinline=1`;
  }

  // Playlist embed
  if (cleanId.startsWith('PL') || cleanId.startsWith('UU') || cleanId.startsWith('RD')) {
    return `https://www.youtube-nocookie.com/embed/videoseries?list=${cleanId}&autoplay=${autoPlayVal}&rel=0&playsinline=1&modestbranding=1`;
  }

  // Standard video embed with playsinline=1 for flawless mobile Safari/Android rendering
  return `https://www.youtube-nocookie.com/embed/${cleanId}?autoplay=${autoPlayVal}&rel=0&playsinline=1&modestbranding=1&enablejsapi=1`;
}

export default function LiveStreamHero({ isAdmin }: { isAdmin: boolean }) {
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showHowToHelp, setShowHowToHelp] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Dual Stream Switcher tab state (defaults to YouTube, switches to Facebook if stream platform is Facebook)
  const [activeViewPlatform, setActiveViewPlatform] = useState<'youtube' | 'facebook'>('youtube');

  // Form state for Admin Broadcast Control
  const [editForm, setEditForm] = useState<LiveStream>({
    isLive: false,
    streamId: '',
    platform: 'youtube',
    title: 'Photizo Porch Divine Service',
    hideChat: false,
    facebookUrl: CONTACT_INFO.facebook
  });
  const [rawLiveUrl, setRawLiveUrl] = useState('');
  const [rawFacebookUrl, setRawFacebookUrl] = useState('');

  // Subscribe to live stream Firestore document
  useEffect(() => {
    const unsub = firebaseService.subscribeStream((data) => {
      setStream(data);
      if (data) {
        setEditForm(data);
        setRawLiveUrl(data.streamId || '');
        setRawFacebookUrl(data.facebookUrl || '');
        if (data.platform === 'facebook') {
          setActiveViewPlatform('facebook');
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

  const handleSave = async () => {
    const finalStreamId = editForm.platform === 'facebook'
      ? (rawLiveUrl || editForm.streamId)
      : extractMediaId(rawLiveUrl || editForm.streamId, editForm.platform);
    
    const updated: LiveStream = {
      ...editForm,
      streamId: finalStreamId,
      facebookUrl: rawFacebookUrl.trim() || editForm.facebookUrl || (editForm.platform === 'facebook' ? finalStreamId : CONTACT_INFO.facebook),
      title: editForm.title || "Photizo Porch Divine Service"
    };
    await firebaseService.updateStream(updated);
    setIsEditing(false);
  };

  const handleToggleLiveDirect = async () => {
    const nextStatus = !stream?.isLive;
    await firebaseService.setLiveStatus(nextStatus);
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
    const shareTitle = stream?.title || "Photizo Porch Live Service";
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

  const isChatVisible = isChatOpen && !stream?.hideChat;

  // Safe playback: existing YouTube video loads and plays without blank screen
  const youtubeVideoId = (stream?.platform === 'youtube' && stream?.streamId)
    ? stream.streamId
    : (stream?.defaultVideoId || 'gYjT55c-k_A');

  const facebookVideoUrl = stream?.facebookUrl || (stream?.platform === 'facebook' ? stream?.streamId : '') || CONTACT_INFO.facebook;

  const currentPlatform = activeViewPlatform;
  const currentVideoId = currentPlatform === 'youtube' ? youtubeVideoId : facebookVideoUrl;
  const embedUrl = buildEmbedUrl(currentVideoId, currentPlatform, { autoplay: Boolean(stream?.isLive) });
  const activeTitle = stream?.title || "Photizo Porch Divine Service";
  const youtubeWatchUrl = youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : CONTACT_INFO.youtube;
  const facebookWatchUrl = facebookVideoUrl || CONTACT_INFO.facebook;

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
          
          {/* Controls: Direct isLive Switch, Theater View, Admin Settings & Sharing */}
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

            {/* Theater Mode toggle (Desktop/Tablet) */}
            <button
              onClick={() => setTheaterMode(!theaterMode)}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-zinc-900 border border-zinc-800 hover:border-gold/50 text-zinc-300 hover:text-white transition-all cursor-pointer text-xs"
              title={theaterMode ? "Exit Theater View" : "Full Width Theater View"}
            >
              {theaterMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span>{theaterMode ? 'Exit Theater' : 'Theater'}</span>
            </button>

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

        {/* --- MAIN PLAYER FRAME GRID: VIDEO SCREEN + LIVE CHAT --- */}
        <div className={`grid gap-6 items-start ${
          isChatVisible && !theaterMode 
            ? 'grid-cols-1 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {/* Left Column: Responsive 16:9 Video Screen & Controls */}
          <div className={isChatVisible && !theaterMode ? 'lg:col-span-2' : 'w-full'}>
            
            {/* Dual Stream Switcher Tabs: YouTube Broadcast / Facebook Live */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
              <div className="flex items-center gap-1.5 p-1 bg-zinc-900/95 rounded-2xl border border-zinc-800 shadow-md">
                <button
                  type="button"
                  onClick={() => setActiveViewPlatform('youtube')}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeViewPlatform === 'youtube'
                      ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                >
                  <Youtube size={15} className={activeViewPlatform === 'youtube' ? 'text-white' : 'text-red-500'} />
                  <span>YouTube Broadcast</span>
                  {stream?.platform === 'youtube' && stream?.isLive && (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveViewPlatform('facebook')}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeViewPlatform === 'facebook'
                      ? 'bg-[#1877F2] text-white shadow-[0_0_15px_rgba(24,119,242,0.4)]'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                >
                  <Facebook size={15} className={activeViewPlatform === 'facebook' ? 'text-white' : 'text-[#1877F2]'} />
                  <span>Facebook Live</span>
                  {stream?.platform === 'facebook' && stream?.isLive && (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className={`w-2 h-2 rounded-full ${stream?.isLive ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
                <span className="font-medium text-[11px] sm:text-xs">
                  {stream?.isLive 
                    ? `LIVE NOW: ${activeViewPlatform === 'youtube' ? 'YouTube Stream' : 'Facebook Broadcast'}`
                    : (activeViewPlatform === 'youtube' ? 'Sermon Replay & Divine Service' : 'Facebook Ministry Altar')}
                </span>
              </div>
            </div>

            {/* --- ADAPTIVE 16:9 VIDEO FRAME CONTAINER --- */}
            <div 
              ref={playerContainerRef}
              className="relative w-full aspect-video rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden border border-zinc-800 bg-black shadow-[0_0_60px_-15px_var(--theme-glow-soft,rgba(212,175,55,0.2))] group"
            >
              <div className="w-full h-full relative">
                <iframe 
                  className="w-full h-full border-0"
                  src={embedUrl}
                  loading="eager"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={activeTitle}
                />

                {/* Top overlay indicators */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 pointer-events-none">
                  {stream?.isLive ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white font-extrabold text-[10px] sm:text-xs tracking-wider uppercase backdrop-blur-md shadow-lg animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      LIVE ON AIR ({activeViewPlatform.toUpperCase()})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700 text-gold font-bold text-[10px] sm:text-xs tracking-wider uppercase backdrop-blur-md shadow-lg">
                      <span>{activeViewPlatform === 'youtube' ? 'Sanctuary Worship & Sermon' : 'Facebook Ministry Broadcast'}</span>
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
                  <button
                    onClick={handleToggleFullscreen}
                    className="p-2 rounded-full bg-black/75 hover:bg-black backdrop-blur-md border border-white/20 text-white hover:text-gold transition-colors cursor-pointer shadow-lg"
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  >
                    {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                  {activeViewPlatform === 'youtube' ? (
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
                  ) : (
                    <a
                      href={facebookWatchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black backdrop-blur-md border border-white/20 text-white text-xs font-semibold hover:border-blue-500 transition-all shadow-xl"
                    >
                      <Facebook size={14} className="text-[#1877F2]" />
                      <span className="hidden sm:inline">Open Facebook</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* --- CURRENT PLAYING TITLE & DETAILS CARD --- */}
            <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-gold/10 text-gold border border-gold/20">
                    {stream?.isLive ? 'Live Stream' : 'Sanctuary Broadcast'}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">
                    &bull; Prophet Japhet Tsukwas & Ministry Altar
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white truncate">
                  {activeTitle}
                </h3>
              </div>

              {/* Action Buttons: Both YouTube and Facebook */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                <a
                  href={youtubeWatchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  <Youtube size={14} className="text-red-500" />
                  <span>YouTube</span>
                  <ExternalLink size={12} />
                </a>

                <a
                  href={facebookWatchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  <Facebook size={14} className="text-[#1877F2]" />
                  <span>Facebook</span>
                  <ExternalLink size={12} />
                </a>
              </div>
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
            <div className="lg:col-span-1 h-[480px] sm:h-[520px] lg:h-[580px] w-full">
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
                      Connect YouTube Live or recorded broadcast to the sanctuary screen
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
                      <span><strong>Start your broadcast:</strong> Go to YouTube Studio, YouTube app, or OBS and start your Live Stream (or locate your scheduled broadcast link).</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-gold text-zinc-950 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                      <span><strong>Copy and paste the URL:</strong> Copy the YouTube share link (e.g. <code>https://youtube.com/live/xxxx</code> or <code>https://youtu.be/xxxx</code>) into the Live Link field below. The system automatically extracts the ID for you!</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-gold text-zinc-950 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                      <span><strong>Toggle Live Status ON:</strong> Flip the "Broadcast Status" toggle to <strong>LIVE</strong>, and click <strong>Save & Go Live</strong>. Visitors will instantly see your live stream with live fellowship chat!</span>
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
                      {editForm.isLive ? 'Service is currently marked as LIVE NOW on website' : 'Stream is currently marked OFF-AIR'}
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
                    Service Title
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
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">
                        Default Platform
                      </label>
                      <select 
                        value={editForm.platform}
                        onChange={e => setEditForm({ ...editForm, platform: e.target.value as any })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-white focus:border-gold outline-none"
                      >
                        <option value="youtube">YouTube Broadcast</option>
                        <option value="facebook">Facebook Live</option>
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
                        placeholder="Paste link: https://youtube.com/live/... or video ID (e.g. gYjT55c-k_A)"
                      />
                    </div>
                  </div>

                  {/* Facebook Live URL */}
                  <div>
                    <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                      <span>Facebook Live / Video URL</span>
                      <span className="text-[10px] text-blue-400">Facebook Embed Ready</span>
                    </label>
                    <input 
                      type="text" 
                      value={rawFacebookUrl}
                      onChange={e => setRawFacebookUrl(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-white focus:border-gold outline-none font-mono placeholder:text-zinc-600"
                      placeholder="Paste Facebook Live/Video link (e.g. https://www.facebook.com/...)"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-zinc-500">Quick presets:</span>
                  <a
                    href={CONTACT_INFO.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-gold hover:border-gold/50 cursor-pointer flex items-center gap-1.5"
                  >
                    <Youtube size={13} className="text-red-500" />
                    <span>Prophet's YouTube</span>
                    <ExternalLink size={10} />
                  </a>
                  <a
                    href={CONTACT_INFO.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-blue-400 hover:border-blue-500/50 cursor-pointer flex items-center gap-1.5"
                  >
                    <Facebook size={13} className="text-blue-500" />
                    <span>Church Facebook</span>
                    <ExternalLink size={10} />
                  </a>
                </div>

                {/* Live Preview If ID Provided */}
                {editForm.streamId && (
                  <div className="mt-4 p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mb-2">
                      Stream Preview:
                    </span>
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                      <iframe 
                        className="w-full h-full border-0"
                        src={buildEmbedUrl(editForm.streamId, editForm.platform, { autoplay: false })}
                        loading="lazy"
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
