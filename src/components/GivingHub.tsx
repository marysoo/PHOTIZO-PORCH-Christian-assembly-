import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, CreditCard, Landmark, Globe, CheckCircle2, Copy, Check, Info, Coins, Lock, ExternalLink } from 'lucide-react';
import { GIVING_OPTIONS, BANK_DETAILS } from '../constants';

export default function GivingHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Payment route dropdown state: hidden until user selects a route
  const [selectedRoute, setSelectedRoute] = useState<'local' | 'international' | null>(null);
  const [isRouteOpen, setIsRouteOpen] = useState(false);
  
  const [showLocalDetails, setShowLocalDetails] = useState(false);
  const [showDomDetails, setShowDomDetails] = useState(false);
  const [showPaypalDetails, setShowPaypalDetails] = useState(false);

  // Close modals on Escape key & manage body scroll lock to prevent trapped scrolls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowLocalDetails(false);
        setShowDomDetails(false);
        setShowPaypalDetails(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const hasAnyOpen = showLocalDetails || showDomDetails || showPaypalDetails;
    if (hasAnyOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showLocalDetails, showDomDetails, showPaypalDetails]);

  return (
    <section id="giving" className="relative py-24 px-6 overflow-hidden">
      <div className="glow-bg absolute inset-0 -z-10" />
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif glow-text mb-6"
          >
            Giving & Sacrifice
          </motion.h2>
          <p className="text-zinc-400 font-light">
            Through your giving, we are able to reach the world with the message of illumination and excellence. Your seed is a testimony of your faith.
          </p>
        </div>

        <div className="flex flex-col items-center gap-8">
          {/* Main Giving Dropdown */}
          <div className="relative w-full max-w-md">
            <span className="block text-zinc-500 text-[10px] uppercase tracking-widest text-center mb-2">Step 1: Select Giving Category</span>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:border-gold/50 transition-all group shadow-lg"
            >
              <span className="text-lg font-medium flex items-center gap-2">
                <Coins className="w-5 h-5 text-gold" />
                {selectedType ? GIVING_OPTIONS.find(o => o.id === selectedType)?.label : "Select Giving Type"}
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180 text-gold' : 'text-zinc-500'}`} />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-50 w-full mt-2 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-zinc-700"
                >
                  {GIVING_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSelectedType(option.id);
                        setIsOpen(false);
                      }}
                      className="w-full text-left p-4 hover:bg-zinc-900 transition-colors border-b border-zinc-800/30 last:border-0 flex items-center justify-between"
                    >
                      <span className="font-medium text-zinc-200">{option.label}</span>
                      {selectedType === option.id && <CheckCircle2 className="w-4 h-4 text-gold" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Payment Route Dropdown */}
          <div className="relative w-full max-w-md mt-2">
            <span className="block text-zinc-500 text-[10px] uppercase tracking-widest text-center mb-2">
              Step 2: Select Payment Route
            </span>
            <button
              onClick={() => setIsRouteOpen(!isRouteOpen)}
              className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:border-gold/50 transition-all group shadow-lg"
            >
              <span className="text-base font-medium flex items-center gap-2.5">
                {selectedRoute === 'local' ? (
                  <>
                    <Landmark className="w-5 h-5 text-amber-400" />
                    <span className="text-zinc-100">Local Payment (Nigeria - Naira)</span>
                  </>
                ) : selectedRoute === 'international' ? (
                  <>
                    <Globe className="w-5 h-5 text-sky-400" />
                    <span className="text-zinc-100">International Payment (PayPal & Keystone Bank Dom)</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 text-zinc-500 group-hover:text-gold transition-colors" />
                    <span className="text-zinc-400">Select Payment Route...</span>
                  </>
                )}
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform ${isRouteOpen ? 'rotate-180 text-gold' : 'text-zinc-500'}`} />
            </button>

            <AnimatePresence>
              {isRouteOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-50 w-full mt-2 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl divide-y divide-zinc-800/40 max-h-72 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-zinc-700"
                >
                  {/* Local Option */}
                  <button
                    onClick={() => {
                      setSelectedRoute('local');
                      setIsRouteOpen(false);
                    }}
                    className="w-full text-left p-4 hover:bg-zinc-900 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-zinc-200 group-hover:text-white flex items-center gap-2">
                          Local Payment
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">Nigeria</span>
                        </div>
                        <p className="text-xs text-zinc-500">Direct transfer via Keystone Bank (Naira tithes, offerings, & seeds)</p>
                      </div>
                    </div>
                    {selectedRoute === 'local' && <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 ml-2" />}
                  </button>

                  {/* International Option */}
                  <button
                    onClick={() => {
                      setSelectedRoute('international');
                      setIsRouteOpen(false);
                    }}
                    className="w-full text-left p-4 hover:bg-zinc-900 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-zinc-200 group-hover:text-white flex items-center gap-2">
                          International Payment
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-400/10 text-sky-400 border border-sky-400/20">Global</span>
                        </div>
                        <p className="text-xs text-zinc-500">PayPal (tsukwasjapheth01@gmail.com) & Keystone Bank USD Dom Account</p>
                      </div>
                    </div>
                    {selectedRoute === 'international' && <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 ml-2" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accounts Section - Hidden until user selects a payment route */}
          <div className="w-full space-y-12 mt-4">
            {selectedRoute === null ? (
              /* Hidden State Placeholder */
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl mx-auto p-8 sm:p-10 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 text-center flex flex-col items-center justify-center backdrop-blur-sm shadow-xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-gold shadow-lg shadow-gold/5">
                  <Lock className="w-7 h-7 text-gold/80" />
                </div>
                <h4 className="text-xl font-serif text-white mb-2">Payment Details Hidden</h4>
                <p className="text-zinc-400 text-sm max-w-md leading-relaxed mb-6">
                  Please select your preferred payment route from the menu above (<span className="text-amber-400 font-medium">Local</span> or <span className="text-sky-400 font-medium">International</span>) to reveal verified accounts, PayPal recipient, and transfer instructions.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button 
                    onClick={() => { setSelectedRoute('local'); setIsRouteOpen(false); }}
                    className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 hover:border-amber-400/50 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Landmark className="w-4 h-4 text-amber-400" />
                    Select Local Payment (Nigeria)
                  </button>
                  <button 
                    onClick={() => { setSelectedRoute('international'); setIsRouteOpen(false); }}
                    className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 hover:border-sky-400/50 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Globe className="w-4 h-4 text-sky-400" />
                    Select International Payment
                  </button>
                </div>
              </motion.div>
            ) : selectedRoute === 'local' ? (
              /* LOCAL ACCOUNTS */
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-zinc-800/40" />
                  <span className="text-zinc-500 text-xs font-semibold tracking-[0.2em] uppercase">Local Ministry Channel (Nigeria)</span>
                  <div className="h-[1px] flex-1 bg-zinc-800/40" />
                </div>
                
                <div className="max-w-2xl mx-auto">
                  <div className="relative group overflow-hidden bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-amber-500/20 hover:border-amber-500/40 p-8 rounded-3xl transition-all duration-300 shadow-xl shadow-amber-500/[0.02] hover:shadow-amber-500/[0.05]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
                          <Landmark className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 inline-block mb-1">
                            {BANK_DETAILS.local.accountType}
                          </span>
                          <h3 className="text-xl font-serif text-white">{BANK_DETAILS.local.bankName}</h3>
                        </div>
                      </div>
                      
                      <QuickCopy value={BANK_DETAILS.local.accountNumber} />
                    </div>

                    <div className="space-y-4 font-sans border-t border-zinc-800/50 pt-5">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">Account Name</span>
                        <p className="text-zinc-200 font-medium tracking-wide">{BANK_DETAILS.local.accountName}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/20">
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">Account Number</span>
                          <p className="font-mono text-xl text-white font-bold tracking-wider">{BANK_DETAILS.local.accountNumber}</p>
                        </div>
                        <button 
                          onClick={() => setShowLocalDetails(true)}
                          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Info size={14} className="text-amber-400" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* INTERNATIONAL ACCOUNTS */
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-zinc-800/40" />
                  <span className="text-zinc-500 text-xs font-semibold tracking-[0.2em] uppercase">International Channels (PayPal & Keystone Bank Dom Account)</span>
                  <div className="h-[1px] flex-1 bg-zinc-800/40" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                  {/* PayPal Transfer Card */}
                  <div className="relative group overflow-hidden bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-zinc-950 border border-sky-500/30 hover:border-sky-400/60 p-6 sm:p-8 rounded-3xl transition-all duration-300 shadow-xl shadow-sky-500/[0.03] hover:shadow-sky-500/[0.08]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl group-hover:bg-sky-500/15 transition-all pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-sky-500/10 rounded-2xl flex items-center justify-center border border-sky-500/30 group-hover:scale-105 transition-transform text-sky-400">
                          <CreditCard className="w-5 h-5 text-sky-400" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-sky-400 tracking-wider uppercase px-2 py-0.5 rounded-full bg-sky-400/10 border border-sky-400/20 inline-block mb-1">
                            {BANK_DETAILS.paypal.accountType}
                          </span>
                          <h3 className="text-lg font-serif text-white">PayPal Instant Transfer</h3>
                        </div>
                      </div>
                      
                      <QuickCopy value={BANK_DETAILS.paypal.email} />
                    </div>

                    <p className="text-xs text-zinc-400 mb-5 leading-relaxed">{BANK_DETAILS.paypal.description}</p>

                    <div className="space-y-4 font-sans border-t border-zinc-800/50 pt-5">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">Recipient PayPal Email</span>
                        <p className="font-mono text-sm text-sky-300 font-semibold truncate selection:bg-sky-500/30">{BANK_DETAILS.paypal.email}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-950/60 p-3 rounded-xl border border-sky-500/20">
                        <a 
                          href="https://www.paypal.com/signin"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <ExternalLink size={14} className="text-sky-400" />
                          Open PayPal
                        </a>
                        <button 
                          onClick={() => setShowPaypalDetails(true)}
                          className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
                        >
                          <Info size={14} className="text-sky-400" />
                          View Info
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Keystone Bank Domiciliary Transfer Card */}
                  <div className="relative group overflow-hidden bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-amber-500/20 hover:border-amber-500/40 p-6 sm:p-8 rounded-3xl transition-all duration-300 shadow-xl shadow-amber-500/[0.02] hover:shadow-amber-500/[0.05]">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
                          <Landmark className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 inline-block mb-1">
                            {BANK_DETAILS.dom.accountType}
                          </span>
                          <h3 className="text-lg font-serif text-white">Keystone Bank Dom Account</h3>
                        </div>
                      </div>
                      
                      <QuickCopy value={BANK_DETAILS.dom.accountNumber} />
                    </div>

                    <p className="text-xs text-zinc-400 mb-5 leading-relaxed">{BANK_DETAILS.dom.description}</p>

                    <div className="space-y-4 font-sans border-t border-zinc-800/50 pt-5">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">Account Beneficiary</span>
                        <p className="text-zinc-300 text-sm font-medium tracking-wide">{BANK_DETAILS.dom.accountName}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/20">
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">Account Number (USD)</span>
                          <p className="font-mono text-sm text-zinc-200 truncate">{BANK_DETAILS.dom.accountNumber}</p>
                        </div>
                        <button 
                          onClick={() => setShowDomDetails(true)}
                          className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
                        >
                          <Info size={14} className="text-amber-400" />
                          View Info
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Local Details Modal */}
      <AnimatePresence>
        {showLocalDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLocalDetails(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-sm z-40" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-50 my-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 inline-block mb-1">
                    {BANK_DETAILS.local.accountType}
                  </span>
                  <h3 className="text-2xl font-serif text-white">{BANK_DETAILS.local.bankName} Info</h3>
                </div>
                <button 
                  onClick={() => setShowLocalDetails(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-1 mb-8">
                <DetailRow label="Bank Name" value={BANK_DETAILS.local.bankName} />
                <DetailRow label="Account Name" value={BANK_DETAILS.local.accountName} />
                <DetailRow label="Account Number" value={BANK_DETAILS.local.accountNumber} />
              </div>

              <div className="bg-zinc-900 aspect-[2.39/1] rounded-2xl border border-zinc-800/50 flex flex-col justify-center px-8 relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1 font-semibold">{BANK_DETAILS.local.bankName}</p>
                <p className="text-xl font-mono text-white tracking-widest font-bold mb-4">{BANK_DETAILS.local.accountNumber.match(/.{1,4}/g)?.join(' ')}</p>
                <div>
                  <p className="text-zinc-500 text-[9px] uppercase tracking-widest">Account Holder</p>
                  <p className="text-xs text-zinc-300 font-medium tracking-wide uppercase">{BANK_DETAILS.local.accountName}</p>
                </div>
              </div>

              <button 
                onClick={() => setShowLocalDetails(false)}
                className="w-full py-4 bg-zinc-100 text-zinc-950 font-bold rounded-xl hover:bg-amber-400 hover:text-white transition-all shadow-lg"
              >
                Close Details
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Domiciliary Details Modal */}
      <AnimatePresence>
        {showDomDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDomDetails(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-sm z-40" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-50 my-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 inline-block mb-1">
                    {BANK_DETAILS.dom.accountType}
                  </span>
                  <h3 className="text-2xl font-serif text-white">{BANK_DETAILS.dom.bankName} Domiciliary</h3>
                </div>
                <button 
                  onClick={() => setShowDomDetails(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-1 mb-6">
                <DetailRow label="Bank Name" value={BANK_DETAILS.dom.bankName} />
                <DetailRow label="Account Name" value={BANK_DETAILS.dom.accountName} />
                <DetailRow label="Account Number (USD)" value={BANK_DETAILS.dom.accountNumber} />
                {BANK_DETAILS.dom.iban && <DetailRow label="IBAN" value={BANK_DETAILS.dom.iban} />}
                {BANK_DETAILS.dom.swift && <DetailRow label="SWIFT Code" value={BANK_DETAILS.dom.swift} />}
                {BANK_DETAILS.dom.sortCode && <DetailRow label="Sort Code" value={BANK_DETAILS.dom.sortCode} />}
                {BANK_DETAILS.dom.bankAddress && <DetailRow label="Bank Address" value={BANK_DETAILS.dom.bankAddress} />}
                <DetailRow label="Description" value={BANK_DETAILS.dom.description} />
              </div>

              <div className="bg-zinc-900 aspect-[2.39/1] rounded-2xl border border-zinc-800/50 flex flex-col justify-center px-8 relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1 font-semibold">{BANK_DETAILS.dom.bankName} (USD)</p>
                <p className="text-xl font-mono text-white tracking-widest font-bold mb-4">{BANK_DETAILS.dom.accountNumber.match(/.{1,4}/g)?.join(' ')}</p>
                <div>
                  <p className="text-zinc-500 text-[9px] uppercase tracking-widest">Account Holder</p>
                  <p className="text-xs text-zinc-300 font-medium tracking-wide uppercase">{BANK_DETAILS.dom.accountName}</p>
                </div>
              </div>

              <button 
                onClick={() => setShowDomDetails(false)}
                className="w-full py-4 bg-zinc-100 text-zinc-950 font-bold rounded-xl hover:bg-amber-400 hover:text-white transition-all shadow-lg"
              >
                Close Details
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PayPal Details Modal */}
      <AnimatePresence>
        {showPaypalDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaypalDetails(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-sm z-40" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-50 my-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-bold text-sky-400 tracking-wider uppercase px-2.5 py-1 rounded-full bg-sky-400/10 border border-sky-400/20 inline-block mb-1">
                    {BANK_DETAILS.paypal.accountType}
                  </span>
                  <h3 className="text-2xl font-serif text-white">PayPal Transfer Details</h3>
                </div>
                <button 
                  onClick={() => setShowPaypalDetails(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-1 mb-6">
                <DetailRow label="PayPal Recipient Email" value={BANK_DETAILS.paypal.email} />
                <DetailRow label="Beneficiary / Account" value={BANK_DETAILS.paypal.accountName} />
                <DetailRow label="Selected Category" value={selectedType ? GIVING_OPTIONS.find(o => o.id === selectedType)?.label || 'Seed / Offering' : 'General Ministry Giving'} />
                <DetailRow label="Channel Description" value={BANK_DETAILS.paypal.description} />
              </div>

              {/* Transfer Memo Instructions */}
              <div className="mb-6 p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex gap-3 text-left">
                <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">PayPal Transfer Note</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    When sending funds via PayPal, kindly include your name and giving category (e.g. <span className="text-white font-medium">Tithe, Offering, Seed, or Ministry Gift</span>) in the transfer note.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="https://www.paypal.com/signin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3.5 px-4 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg text-sm"
                >
                  <ExternalLink size={16} />
                  Open PayPal
                </a>
                <button 
                  onClick={() => setShowPaypalDetails(false)}
                  className="py-3.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold rounded-xl border border-zinc-800 transition-all text-sm"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

// Safe, cross-browser, iframe-compatible clipboard copy utility with fallback
const copyTextToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn("Failed to copy using navigator.clipboard, trying fallback", err);
  }

  // Fallback using textarea element
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Fallback: unable to copy", err);
    return false;
  }
};

function DetailRow({ label, value }: { label: string, value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyTextToClipboard(value);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      onClick={handleCopy}
      className="flex justify-between items-center border-b border-zinc-900 py-3.5 hover:bg-zinc-900/40 px-3 rounded-xl transition-all cursor-pointer group"
    >
      <div className="flex flex-col min-w-0 pr-4">
        <span className="text-zinc-500 text-[9px] uppercase tracking-widest block mb-0.5">{label}</span>
        <span className="font-mono text-zinc-200 text-sm break-all font-medium tracking-wide">{value}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {copied ? (
          <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20">Copied!</span>
        ) : (
          <span className="text-[10px] text-zinc-600 group-hover:text-gold transition-colors uppercase font-bold tracking-wider bg-zinc-900 group-hover:bg-zinc-800 px-2.5 py-1 rounded border border-zinc-800 group-hover:border-gold/30">Copy</span>
        )}
      </div>
    </div>
  );
}

function QuickCopy({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyTextToClipboard(value);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <button 
      onClick={handleCopy}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-1.5 border shrink-0 ${
        copied 
          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
          : 'bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800/80 hover:border-gold/30'
      }`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      <span>{copied ? 'Copied' : 'Quick Copy'}</span>
    </button>
  );
}
