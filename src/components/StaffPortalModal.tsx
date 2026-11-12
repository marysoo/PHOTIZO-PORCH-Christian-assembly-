import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, LogIn, LogOut, X, Sparkles, Key, Radio, Edit3, HeartHandshake, Headphones, BookOpen, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { firebaseService } from '../lib/firebaseService';

interface StaffPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  isStreamLive?: boolean;
  onToggleLive?: () => void;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
}

export default function StaffPortalModal({
  isOpen,
  onClose,
  isStreamLive = false,
  onToggleLive,
  isEditMode = false,
  onToggleEditMode
}: StaffPortalModalProps) {
  const { user, isAdmin, loginWithGoogle, loginStaffDirect, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'quick' | 'google'>('quick');
  const [staffEmail, setStaffEmail] = useState('tersooaker@gmail.com');
  const [passKey, setPassKey] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleQuickLogin = (email: string) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = loginStaffDirect(email);
      if (res.success) {
        setSuccessMsg(`Welcome, ${email}! Staff Portal privileges activated.`);
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to authenticate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = staffEmail.trim() || 'tersooaker@gmail.com';
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = loginStaffDirect(targetEmail, passKey);
      if (res.success) {
        setSuccessMsg(`Welcome! Logged in as ${targetEmail}.`);
        if (onToggleEditMode && !isEditMode) {
          onToggleEditMode();
        }
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 900);
      } else {
        setErrorMsg(res.message || 'Login failed.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      setSuccessMsg('Google sign-in successful! Staff privileges granted.');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.warn('Google sign in error:', err);
      const isPopupBlocked = err?.code === 'auth/popup-blocked' || err?.message?.includes('popup');
      if (isPopupBlocked) {
        setErrorMsg('The browser blocked the Google popup window in this preview. Please use the "Direct Staff Access" tab to sign in immediately without popups.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setErrorMsg('This preview domain is not on Firebase OAuth authorized domains. Please use the "Direct Staff Access" tab to sign in immediately.');
      } else {
        setErrorMsg(err?.message || 'Google sign-in could not complete. Use Direct Staff Access instead.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      if (onToggleEditMode && isEditMode) {
        onToggleEditMode();
      }
      await logout();
      try {
        localStorage.removeItem('photizo_staff_session');
        localStorage.removeItem('photizo_admin_session');
      } catch {}
      setSuccessMsg('Logged out successfully.');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md z-40"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-50 my-auto text-left"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-zinc-850">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-gold/40 flex items-center justify-center text-gold shadow-lg shadow-gold/5 shrink-0">
              <ShieldCheck className="w-6 h-6 text-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/30">
                  Staff & Sanctuary Altar
                </span>
                {isAdmin && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                    Active
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-serif text-white mt-1">Staff Administrator Portal</h3>
              <p className="text-xs text-zinc-400">Restricted portal for church leaders and administrators</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors shrink-0 cursor-pointer"
            aria-label="Close Staff Portal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Feedback Alerts */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 flex items-start gap-2.5 text-xs text-red-200"
            >
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 p-3.5 rounded-xl bg-green-950/60 border border-green-500/40 flex items-start gap-2.5 text-xs text-green-200"
            >
              <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMsg}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* State: Authenticated Admin */}
        {isAdmin ? (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-gold/40 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">Logged-In Administrator</span>
                <span className="text-[10px] text-gold font-mono uppercase bg-gold/10 px-2 py-0.5 rounded border border-gold/30">Super Admin</span>
              </div>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck size={16} className="text-green-400" />
                <span>{user?.displayName || 'Administrator'}</span>
              </p>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{user?.email}</p>
            </div>

            {/* Quick Admin Operations */}
            <div className="space-y-2.5">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">Sanctuary Quick Actions</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Live Broadcast Switch */}
                {onToggleLive && (
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio size={14} className={isStreamLive ? 'text-red-500 animate-pulse' : 'text-zinc-500'} />
                      <span className="text-xs font-semibold text-zinc-200">Live Altar:</span>
                    </div>
                    <button
                      onClick={onToggleLive}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        isStreamLive ? 'bg-red-600 text-white shadow-md' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {isStreamLive ? 'ON AIR' : 'OFF'}
                    </button>
                  </div>
                )}

                {/* Edit Mode Toggle */}
                {onToggleEditMode && (
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Edit3 size={14} className={isEditMode ? 'text-gold' : 'text-zinc-500'} />
                      <span className="text-xs font-semibold text-zinc-200">Edit Mode:</span>
                    </div>
                    <button
                      onClick={onToggleEditMode}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        isEditMode ? 'bg-gold text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {isEditMode ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation Shortcuts */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <a
                  href="#live"
                  onClick={onClose}
                  className="p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 hover:border-gold/40 text-zinc-300 hover:text-gold transition-all text-center"
                >
                  Broadcast Altar
                </a>
                <a
                  href="#testimonies"
                  onClick={onClose}
                  className="p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 hover:border-gold/40 text-zinc-300 hover:text-gold transition-all text-center"
                >
                  Testimonies
                </a>
                <a
                  href="#sermons"
                  onClick={onClose}
                  className="p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 hover:border-gold/40 text-zinc-300 hover:text-gold transition-all text-center"
                >
                  Audio Sermons
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleLogout}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut size={14} />
                <span>Log Out Admin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onToggleEditMode && !isEditMode) {
                    onToggleEditMode();
                  }
                  onClose();
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gold hover:brightness-110 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
              >
                Done & Return to Sanctuary
              </button>
            </div>
          </div>
        ) : (
          /* State: Not Logged In - Sign In Tabs & Forms */
          <div className="space-y-5">
            {/* Tab Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
              <button
                onClick={() => { setActiveTab('quick'); setErrorMsg(null); }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'quick' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Direct Staff Access
              </button>
              <button
                onClick={() => { setActiveTab('google'); setErrorMsg(null); }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'google' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Google Sign In
              </button>
            </div>

            {/* Tab 1: Direct Staff Access */}
            {activeTab === 'quick' && (
              <div className="space-y-4">
                {/* One-Click Authorized Admin Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 border border-amber-500/30">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                    <Sparkles size={14} />
                    <span>Authorized Administrator</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                    Click below to sign in directly as primary administrator (<span className="text-white font-mono font-semibold">tersooaker@gmail.com</span>) without iframe popup restrictions.
                  </p>
                  <button
                    onClick={() => handleQuickLogin('tersooaker@gmail.com')}
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-gold hover:brightness-110 text-zinc-950 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/10 cursor-pointer"
                  >
                    <ShieldCheck size={16} />
                    <span>{isSubmitting ? 'Authenticating...' : 'Sign In as Admin (tersooaker@gmail.com)'}</span>
                  </button>
                </div>

                {/* Alternate Staff Login Form */}
                <form onSubmit={handleCustomFormLogin} className="space-y-3 pt-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold block mb-1">
                      Staff Email Address
                    </label>
                    <input
                      type="email"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="e.g. fporchministries@gmail.com"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold block mb-1">
                      Staff Passcode / Security Key (Optional for Primary Admin)
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={passKey}
                        onChange={(e) => setPassKey(e.target.value)}
                        placeholder="Enter admin passcode"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-gold outline-none pl-9"
                      />
                      <Key size={14} className="text-zinc-500 absolute left-3 top-3.5" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-200 hover:text-white border border-zinc-700/80 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn size={14} />
                    <span>Verify Staff Credentials</span>
                  </button>
                </form>
              </div>
            )}

            {/* Tab 2: Google Sign In */}
            {activeTab === 'google' && (
              <div className="space-y-4 py-2">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Sign in using your Google Account with matching staff email (<span className="text-zinc-200">tersooaker@gmail.com</span> or <span className="text-zinc-200">fporchministries@gmail.com</span>).
                </p>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-lg cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>{isSubmitting ? 'Opening Google Sign-In...' : 'Sign In With Google'}</span>
                </button>

                <p className="text-[11px] text-zinc-500 leading-relaxed text-center">
                  Note: If your browser blocks popups inside the preview iframe, switch to the <strong>Direct Staff Access</strong> tab.
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
