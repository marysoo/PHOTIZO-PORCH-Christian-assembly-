import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Settings, X, Save, Share2, Youtube, ExternalLink, Activity, Radio, HelpCircle, Check, Copy, Facebook, MessageSquare, EyeOff, MessageSquareOff } from 'lucide-react';
import { firebaseService, LiveStream } from '../lib/firebaseService';
import { CONTACT_INFO } from '../constants';
import LiveStreamChat from './LiveStreamChat';

// Helper function to extract video ID from various YouTube and Vimeo URL formats
export function extractMediaId(input: string, platform: 'youtube' | 'vimeo' = 'youtube'): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  if (platform === 'youtube') {
    // 1. Direct 11-char ID (e.g. dQw4w9WgXcQ)
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }
    // 2. youtube.com/watch?v=...
    const vMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (vMatch && vMatch[1]) return vMatch[1];

    // 3. youtu.be/...
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch && shortMatch[1]) return shortMatch[1];

    // 4. youtube.com/live/...
    const liveMatch = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
    if (liveMatch && liveMatch[1]) return liveMatch[1];

    // 5. youtube.com/embed/...
    const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch && embedMatch[1]) return embedMatch[1];

    // Fallback: return as-is
    return trimmed;
  } else {
    // Vimeo ID extraction
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/);
    if (vimeoMatch && vimeoMatch[3]) return vimeoMatch[3];
    return trimmed;
  }
}

export default function LiveStreamHero({ isAdmin }: { isAdmin: boolean }) {
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showHowToHelp, setShowHowToHelp] = useState(false);
  const [rawInputUrl, setRawInputUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
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

  const [editForm, setEditForm] = useState<LiveStream>({
    isLive: false,
    streamId: '',
    platform: 'youtube',
    title: '',
    hideChat: false
  });

  useEffect(() => {
    const unsub = firebaseService.subscribeStream((data) => {
      setStream(data);
      if (data) {
        setEditForm(data);
        setRawInputUrl(data.streamId);
      }
    });
    return () => unsub();
  }, []);

  const handleUrlChange = (value: string) => {
    setRawInputUrl(value);
    const extracted = extractMediaId(value, editForm.platform);
    setEditForm(prev => ({ ...prev, streamId: extracted }));
  };

  const handleSave = async () => {
    const finalStreamId = extractMediaId(rawInputUrl || editForm.streamId, editForm.platform);
    const updated: LiveStream = {
      ...editForm,
      streamId: finalStreamId,
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

  const isChatVisible = isChatOpen && !stream?.hideChat;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: stream?.title || "Photizo Porch Live Service",
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const youtubeWatchUrl = stream?.streamId 
    ? `https://www.youtube.com/watch?v=${stream.streamId}`
    : CONTACT_INFO.youtube;

  return (
    <section id="live" className="relative px-6 py-20 bg-zinc-950 overflow-hidden border-b border-zinc-900 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        {/* Stream Banner Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                stream?.isLive 
                  ? 'bg-red-600/20 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.35)]' 
                  : 'bg-zinc-900 border border-zinc-800 text-gold'
              }`}>
                {stream?.isLive ? (
                  <Radio className="w-7 h-7 animate-pulse text-red-500" />
                ) : (
                  <Play className="w-6 h-6 fill-gold text-gold" />
                )}
              </div>
              {stream?.isLive && (
                <div className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-lg">
                  LIVE
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                  stream?.isLive 
                    ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}>
                  {stream?.isLive ? '● On Air Broadcast' : 'Sanctuary Broadcast Altar'}
                </span>
                {stream?.isLive && (
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Activity size={13} className="text-red-500 animate-spin" /> Live Stream
                  </span>
                )}
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-white glow-text">
                {stream?.isLive ? (stream?.title || "Divine Service Broadcast") : "Live Streaming & Broadcast Sanctuary"}
              </h2>
            </div>
          </div>
          
          {/* Controls: Direct isLive Manual Switch, Admin Broadcast Settings & Share */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {isAdmin && (
              <>
                {/* Manual 'isLive' direct toggle switch */}
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 shadow-inner">
                  <span className="text-xs font-semibold text-zinc-300">Live Status:</span>
                  <button
                    type="button"
                    onClick={handleToggleLiveDirect}
                    className={`relative w-12 h-6 rounded-full p-0.5 transition-all cursor-pointer ${
                      stream?.isLive 
                        ? 'bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.6)]' 
                        : 'bg-zinc-800 hover:bg-zinc-750'
                    }`}
                    title={stream?.isLive ? 'Click to switch to OFF-AIR' : 'Click to start LIVE broadcast'}
                    aria-label="Toggle Live Broadcast Status"
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform flex items-center justify-center ${stream?.isLive ? 'translate-x-6' : ''}`}>
                      {stream?.isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                    </div>
                  </button>
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest ${stream?.isLive ? 'text-red-400 animate-pulse' : 'text-zinc-500'}`}>
                    {stream?.isLive ? 'ON AIR' : 'OFF'}
                  </span>
                </div>

                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:border-gold text-zinc-200 hover:text-gold px-4 py-2 rounded-full font-semibold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer"
                  title="Configure broadcast link, title, and platform"
                >
                  <Settings size={14} />
                  <span>Settings</span>
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
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer border ${
                isChatVisible
                  ? 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800 hover:border-red-500/50'
                  : 'bg-gold text-zinc-950 font-bold border-gold shadow-[0_0_15px_var(--theme-glow,rgba(212,175,55,0.3))]'
              }`}
              title={isChatVisible ? "Remove or hide live chat (Distraction-free theater view)" : "Open live fellowship chat"}
            >
              {isChatVisible ? (
                <>
                  <EyeOff size={14} className="text-zinc-400 group-hover:text-red-400" />
                  <span>Hide Live Chat</span>
                </>
              ) : (
                <>
                  <MessageSquare size={14} className="text-zinc-950" />
                  <span>Show Live Chat</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-gold/50 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-md"
              title="Share Live Link"
            >
              {copiedLink ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
            </button>
          </div>
        </div>

        {/* Unified Live Broadcast Grid: Video Player + Real-Time Live Chat */}
        <div className={`grid gap-6 items-stretch ${isChatVisible ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {/* Video Player Column */}
          <div className={isChatVisible ? 'lg:col-span-2' : 'w-full'}>
            <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-zinc-800 bg-zinc-900 shadow-[0_0_80px_-15px_var(--theme-glow-soft,rgba(212,175,55,0.15))] group h-full min-h-[300px]">
              {stream?.isLive && stream?.streamId ? (
                <div className="w-full h-full relative">
                  <iframe 
                    className="w-full h-full"
                    src={stream.platform === 'youtube' 
                      ? `https://www.youtube.com/embed/${stream.streamId}?autoplay=1&rel=0` 
                      : `https://player.vimeo.com/video/${stream.streamId}?autoplay=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={stream.title || "Live Stream"}
                  />

                  {/* Quick external launch chip */}
                  <div className="absolute top-4 right-4 z-20">
                    <a
                      href={youtubeWatchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/75 hover:bg-black backdrop-blur-md border border-white/20 text-white text-xs font-semibold hover:border-red-500 transition-all shadow-xl"
                    >
                      <Youtube size={14} className="text-red-500" />
                      <span>Open on YouTube</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ) : (
                /* Off-air Sanctuary Hub */
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-10 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
                  <div className="relative mb-5">
                    <div className="w-18 h-18 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xl">
                      <Youtube className="w-9 h-9 text-red-500" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-gold">
                      <Play size={12} className="fill-gold" />
                    </div>
                  </div>

                  <span className="text-xs font-bold text-gold uppercase tracking-[0.2em] mb-1.5">Photizo Porch Live Altar</span>
                  <h3 className="text-2xl sm:text-3xl font-serif mb-2.5 text-white">Join Us Live for Divine Revelations</h3>
                  <p className="text-zinc-400 max-w-lg mx-auto mb-5 text-xs sm:text-sm font-light leading-relaxed">
                    Connect to our live prophetic encounters, prayer streams, and apostolic messages. When a service is on air, it streams right here with real-time fellowship chat.
                  </p>

                  {/* Service Schedule Pills */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-xs text-zinc-300">
                    <div className="px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800/80">
                      <span className="text-gold font-bold">Sunday Service:</span> 9:00 AM WAT
                    </div>
                    <div className="px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800/80">
                      <span className="text-gold font-bold">Midweek Communion:</span> Wed 5:00 PM WAT
                    </div>
                    <div className="px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800/80">
                      <span className="text-gold font-bold">Prophetic Watch:</span> Fri 10:00 PM WAT
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <a 
                      href={CONTACT_INFO.youtube}
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-red-600/30 transition-all cursor-pointer"
                    >
                      <Youtube size={15} />
                      <span>Prophet Japhet's Channel</span>
                      <ExternalLink size={12} />
                    </a>

                    <a 
                      href={CONTACT_INFO.facebook}
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500/60 text-zinc-200 hover:text-white font-semibold text-xs transition-all"
                    >
                      <Facebook size={14} className="text-blue-500" />
                      <span>Facebook Live</span>
                    </a>

                    {isAdmin && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold hover:brightness-110 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                      >
                        <Settings size={14} />
                        <span>Connect Stream</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* When Chat is Hidden: Distraction-free theater banner with quick restore action */}
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
                      ? "Live fellowship chat is currently paused by the ministry administrator."
                      : "Live chat is hidden for theater viewing. You can bring back the fellowship chat whenever you wish."}
                  </span>
                </div>
                {!stream?.hideChat ? (
                  <button
                    onClick={() => toggleChatVisibility(true)}
                    className="px-4 py-2 rounded-xl bg-gold hover:brightness-110 text-zinc-950 font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-md"
                  >
                    <MessageSquare size={14} />
                    <span>Show Live Chat</span>
                  </button>
                ) : isAdmin ? (
                  <button
                    onClick={() => handleToggleAdminChat(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gold font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer border border-gold/40"
                  >
                    <MessageSquare size={14} />
                    <span>Enable Chat for Congregation</span>
                  </button>
                ) : null}
              </motion.div>
            )}
          </div>

          {/* Real-Time Live Chat Column */}
          {isChatVisible && (
            <div className="lg:col-span-1 h-[520px] lg:h-[560px] xl:h-[600px] w-full">
              <LiveStreamChat isAdmin={isAdmin} onHide={() => toggleChatVisibility(false)} />
            </div>
          )}
        </div>
      </div>

      {/* Admin Settings Modal: Stream Setup & Connection Guide */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                  <div>
                    <h3 className="text-xl font-serif text-white">Broadcast Control Center</h3>
                    <p className="text-xs text-zinc-400">Connect YouTube or Vimeo Live to the website Live button</p>
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
                      <span><strong>Copy and paste the URL:</strong> Copy the YouTube share link (e.g. <code>https://youtube.com/live/xxxx</code> or <code>https://youtu.be/xxxx</code>) and paste it below. The system automatically extracts the ID for you!</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-gold text-zinc-950 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                      <span><strong>Toggle Live Status ON:</strong> Flip the "Broadcast Status" toggle to <strong>LIVE</strong>, and click <strong>Update Broadcast</strong>. Visitors clicking the "Live Service" button will instantly see your live stream!</span>
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
                      value={rawInputUrl}
                      onChange={e => handleUrlChange(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-white focus:border-gold outline-none font-mono placeholder:text-zinc-600"
                      placeholder="Paste link: https://youtube.com/live/... or video ID"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-zinc-500">Quick presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      // Prompt or use latest link
                      setRawInputUrl(CONTACT_INFO.youtube);
                      handleUrlChange(CONTACT_INFO.youtube);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-gold hover:border-gold/50 cursor-pointer"
                  >
                    Prophet's YouTube Channel
                  </button>
                </div>

                {/* Live Preview If ID Provided */}
                {editForm.streamId && (
                  <div className="mt-4 p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mb-2">Embed Preview:</span>
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                      <iframe 
                        className="w-full h-full"
                        src={editForm.platform === 'youtube'
                          ? `https://www.youtube.com/embed/${editForm.streamId}?rel=0`
                          : `https://player.vimeo.com/video/${editForm.streamId}`}
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
