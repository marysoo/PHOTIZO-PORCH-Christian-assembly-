import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Settings, X, Save, Share2, Youtube, ExternalLink, Activity } from 'lucide-react';
import { firebaseService, LiveStream } from '../lib/firebaseService';

export default function LiveStreamHero({ isAdmin }: { isAdmin: boolean }) {
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<LiveStream>({
    isLive: false,
    streamId: '',
    platform: 'youtube',
    title: ''
  });

  useEffect(() => {
    const unsub = firebaseService.subscribeStream((data) => {
      setStream(data);
      if (data) setEditForm(data);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    await firebaseService.updateStream(editForm);
    setIsEditing(false);
  };

  if (!stream?.isLive && !isAdmin) return null;

  return (
    <section className="relative px-6 py-24 bg-zinc-950 overflow-hidden border-b border-zinc-900">
      <div className="max-w-7xl mx-auto">
        {/* Stream Banner */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center animate-pulse">
                <Play className="text-red-500 fill-red-500" />
              </div>
              {stream?.isLive && (
                <div className="absolute -top-1 -right-1 bg-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg">Live</div>
              )}
            </div>
            <div>
              <h2 className="text-4xl font-serif text-white">{stream?.title || "Divine Service"}</h2>
              <p className="text-zinc-500 flex items-center gap-2">
                <Activity size={14} className="text-red-500" /> Currently Streaming from the Sanctuary
              </p>
            </div>
          </div>
          
          {isAdmin && (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-400 px-6 py-3 rounded-full hover:border-gold hover:text-gold transition-all"
            >
              <Settings size={18} /> Stream Settings
            </button>
          )}
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-zinc-800 bg-zinc-900 shadow-[0_0_100px_-20px_var(--theme-glow-soft,rgba(212,175,55,0.15))] group">
          {stream?.isLive ? (
            <iframe 
              className="w-full h-full"
              src={stream.platform === 'youtube' ? `https://www.youtube.com/embed/${stream.streamId}?autoplay=1` : `https://player.vimeo.com/video/${stream.streamId}?autoplay=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-zinc-950">
              <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-8 border border-zinc-800">
                <Youtube className="w-10 h-10 text-zinc-700" />
              </div>
              <h3 className="text-2xl font-serif mb-4 text-zinc-500 italic">No Live Broadcast Currently</h3>
              <p className="text-zinc-600 max-w-md mx-auto mb-8 font-light">
                Our services are archived on our media portal. Join us for our next power-packed session.
              </p>
              <button className="flex items-center gap-2 text-gold font-bold hover:underline transition-all">
                Browse Past Services <ExternalLink size={16} />
              </button>
            </div>
          )}
          
          {/* Interaction Overlay */}
          <div className="absolute bottom-10 right-10 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full hover:bg-black/60 transition-all">
              <Share2 size={24} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Settings Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-serif text-gold">Broadcast Control</h3>
                <button onClick={() => setIsEditing(false)}><X /></button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <div>
                    <h4 className="font-bold">Live Status</h4>
                    <p className="text-xs text-zinc-500">Toggle website visibility</p>
                  </div>
                  <button 
                    onClick={() => setEditForm({...editForm, isLive: !editForm.isLive})}
                    className={`w-14 h-8 rounded-full p-1 transition-colors ${editForm.isLive ? 'bg-red-600' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full transition-transform ${editForm.isLive ? 'translate-x-6' : ''}`} />
                  </button>
                </div>

                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-1">Service Title</label>
                  <input 
                    type="text" 
                    value={editForm.title || ''}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 focus:border-gold outline-none"
                    placeholder="E.g. Sunday Celebration Service"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-1">Platform</label>
                    <select 
                      value={editForm.platform}
                      onChange={e => setEditForm({ ...editForm, platform: e.target.value as any })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 focus:border-gold outline-none appearance-none"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="vimeo">Vimeo</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-1">Video ID</label>
                    <input 
                      type="text" 
                      value={editForm.streamId}
                      onChange={e => setEditForm({ ...editForm, streamId: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 focus:border-gold outline-none font-mono"
                      placeholder="e.g. dQw4w9WgXcQ"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button 
                  onClick={handleSave}
                  className="flex-1 py-4 bg-gold text-white rounded-xl font-bold hover:shadow-[0_0_20px_var(--theme-glow,rgba(212,175,55,0.3))] transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Update Broadcast
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
