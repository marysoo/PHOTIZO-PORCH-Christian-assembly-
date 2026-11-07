import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Heart, User, CheckCircle, ShieldCheck, History, X } from 'lucide-react';
import { firebaseService, PrayerRequest } from '../lib/firebaseService';

export default function PrayerSystem({ isAdmin }: { isAdmin: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminViewOpen, setIsAdminViewOpen] = useState(false);
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [form, setForm] = useState({ name: '', request: '', isAnonymous: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      const unsub = firebaseService.subscribePrayerRequests(setRequests);
      return () => unsub();
    }
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await firebaseService.submitPrayerRequest({
      name: form.isAnonymous ? 'Anonymous' : form.name,
      request: form.request,
      isAnonymous: form.isAnonymous,
      timestamp: new Date().toISOString(),
      status: 'pending'
    });
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsModalOpen(false);
      setForm({ name: '', request: '', isAnonymous: false });
    }, 2000);
  };

  return (
    <section className="py-24 px-6 border-t border-zinc-900 bg-zinc-950">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-serif mb-6 glow-text">Covenant Prayer Altar</h2>
          <p className="text-zinc-400 mb-10 max-w-2xl mx-auto">
            "For where two or three are gathered together in my name, there am I in the midst of them." Submit your petitions to our intercessory team.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-zinc-100 text-zinc-950 px-8 py-4 rounded-full font-bold hover:bg-gold hover:text-white transition-all shadow-xl"
            >
              <Send size={18} /> Submit Request
            </button>
            
            {isAdmin && (
              <button 
                onClick={() => setIsAdminViewOpen(true)}
                className="flex items-center gap-2 border border-gold/50 text-gold px-8 py-4 rounded-full font-bold hover:bg-gold/10 transition-all"
              >
                <ShieldCheck size={18} /> View Petitions ({requests.filter(r => r.status === 'pending').length})
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white"
              >
                <X />
              </button>

              {isSuccess ? (
                <div className="py-12 text-center">
                  <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-10 h-10 text-gold animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-serif text-white mb-2">Request Received</h3>
                  <p className="text-zinc-500">Our ministers will stand with you in faith.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-2xl font-serif text-gold mb-6">Request Prayer</h3>
                  
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-2">Your Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input 
                        type="text"
                        disabled={form.isAnonymous}
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                        placeholder={form.isAnonymous ? "Anonymous" : "Enter your name"}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 focus:border-gold outline-none transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => setForm({...form, isAnonymous: !form.isAnonymous})}
                      className={`w-10 h-6 rounded-full p-1 transition-colors ${form.isAnonymous ? 'bg-gold' : 'bg-zinc-800'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${form.isAnonymous ? 'translate-x-4' : ''}`} />
                    </button>
                    <span className="text-sm text-zinc-400">Submit anonymously</span>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-2">Your Petition</label>
                    <textarea 
                      required
                      rows={5}
                      value={form.request}
                      onChange={e => setForm({...form, request: e.target.value})}
                      placeholder="Tell us what you'd like us to pray for..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 focus:border-gold outline-none transition-all resize-none"
                    />
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className="w-full py-4 bg-zinc-100 text-zinc-950 font-bold rounded-xl hover:bg-gold hover:text-white transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Send to Altar'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Dashboard Modal */}
      <AnimatePresence>
        {isAdminViewOpen && (
          <div className="fixed inset-0 z-[110] bg-zinc-950 flex flex-col">
            <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/80 backdrop-blur-md">
              <div>
                <h3 className="text-2xl font-serif text-gold">Prayer Dashboard</h3>
                <p className="text-xs text-zinc-500 uppercase">Intercessory Management</p>
              </div>
              <button 
                onClick={() => setIsAdminViewOpen(false)}
                className="p-3 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors"
              >
                <X />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-12">
              <div className="max-w-5xl mx-auto grid gap-6">
                {requests.length === 0 ? (
                  <div className="py-24 text-center border-2 border-dashed border-zinc-900 rounded-3xl">
                    <History size={48} className="mx-auto text-zinc-800 mb-4" />
                    <p className="text-zinc-500">No prayer requests on the altar yet.</p>
                  </div>
                ) : (
                  requests.map((req) => (
                    <motion.div 
                      key={req.id}
                      layout
                      className={`p-8 rounded-3xl border transition-all ${req.status === 'prayed' ? 'bg-zinc-900/30 border-zinc-900 opacity-60' : 'bg-zinc-900 border-zinc-800 hover:border-gold/30'}`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden">
                            {req.isAnonymous ? <X className="text-zinc-600" /> : <User className="text-gold" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{req.name}</h4>
                            <p className="text-xs text-zinc-500 font-mono italic">
                              {new Date(req.timestamp).toLocaleDateString()} at {new Date(req.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          req.status === 'pending' ? 'bg-gold/10 text-gold border border-gold/20' : 
                          req.status === 'prayed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                          'bg-zinc-800 text-zinc-500'
                        }`}>
                          {req.status}
                        </div>
                      </div>
                      
                      <p className="text-zinc-300 text-lg leading-relaxed mb-8 italic">
                        "{req.request}"
                      </p>

                      <div className="flex gap-3">
                        {req.status !== 'prayed' && (
                          <button 
                            onClick={() => firebaseService.updatePrayerStatus(req.id!, 'prayed')}
                            className="flex items-center gap-2 bg-green-500/10 text-green-500 border border-green-500/20 px-6 py-2 rounded-full text-sm font-bold hover:bg-green-500 hover:text-white transition-all"
                          >
                            <CheckCircle size={16} /> Mark as Prayed
                          </button>
                        )}
                        <button 
                          onClick={() => firebaseService.updatePrayerStatus(req.id!, 'archived')}
                          className="px-6 py-2 rounded-full border border-zinc-800 text-zinc-500 text-sm font-bold hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
                        >
                          Archive
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
