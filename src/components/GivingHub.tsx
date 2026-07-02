import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, CreditCard, Landmark, Globe, CheckCircle2, QrCode, Copy, Check, Info, Coins } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { GIVING_OPTIONS, BANK_DETAILS } from '../constants';

export default function GivingHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'local' | 'international'>('all');
  
  const [showLocalDetails, setShowLocalDetails] = useState(false);
  const [showDomDetails, setShowDomDetails] = useState(false);
  const [showEuropeDetails, setShowEuropeDetails] = useState(false);
  const [showUsaDetails, setShowUsaDetails] = useState(false);
  const [showIBANQR, setShowIBANQR] = useState(false);

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
                  className="absolute z-50 w-full mt-2 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl"
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

          {/* Region Tabs */}
          <div className="w-full max-w-lg mt-4">
            <span className="block text-zinc-500 text-[10px] uppercase tracking-widest text-center mb-3">Step 2: Choose Payment Route</span>
            <div className="grid grid-cols-3 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800/80">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'all' 
                    ? 'bg-zinc-900 border border-zinc-800 text-white shadow' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All Accounts
              </button>
              <button
                onClick={() => setActiveTab('local')}
                className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'local' 
                    ? 'bg-zinc-900 border border-zinc-800 text-white shadow' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Local (Nigeria)
              </button>
              <button
                onClick={() => setActiveTab('international')}
                className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'international' 
                    ? 'bg-zinc-900 border border-zinc-800 text-white shadow' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                International
              </button>
            </div>
          </div>

          {/* Accounts Grid */}
          <div className="w-full space-y-12 mt-4">
            {/* LOCAL ACCOUNTS */}
            {(activeTab === 'all' || activeTab === 'local') && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-zinc-800/40" />
                  <span className="text-zinc-500 text-xs font-semibold tracking-[0.2em] uppercase">Local Ministry Channels (Nigeria)</span>
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
              </div>
            )}

            {/* INTERNATIONAL ACCOUNTS */}
            {(activeTab === 'all' || activeTab === 'international') && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-zinc-800/40" />
                  <span className="text-zinc-500 text-xs font-semibold tracking-[0.2em] uppercase">International Channels (USD / EUR / GBP)</span>
                  <div className="h-[1px] flex-1 bg-zinc-800/40" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {/* Ministry Domiciliary Transfer Card */}
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
                          <h3 className="text-lg font-serif text-white">Ministry Dom Route</h3>
                        </div>
                      </div>
                      
                      <QuickCopy value={BANK_DETAILS.dom.accountNumber} />
                    </div>

                    <p className="text-xs text-zinc-500 mb-5 leading-relaxed">{BANK_DETAILS.dom.description}</p>

                    <div className="space-y-4 font-sans border-t border-zinc-800/50 pt-5">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">Account Beneficiary</span>
                        <p className="text-zinc-300 text-sm font-medium tracking-wide">{BANK_DETAILS.dom.accountName}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/20">
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">Account Number</span>
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

                  {/* Europe Transfer Card */}
                  <div className="relative group overflow-hidden bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800 hover:border-zinc-700/80 p-6 sm:p-8 rounded-3xl transition-all duration-300 shadow-xl shadow-black/30">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-700/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700/50 group-hover:scale-105 transition-transform">
                          <Globe className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 inline-block mb-1">
                            {BANK_DETAILS.europe.accountType}
                          </span>
                          <h3 className="text-lg font-serif text-white">Europe & UK Route</h3>
                        </div>
                      </div>
                      
                      <QuickCopy value={BANK_DETAILS.europe.iban} />
                    </div>

                    <p className="text-xs text-zinc-500 mb-5 leading-relaxed">{BANK_DETAILS.europe.description}</p>

                    <div className="space-y-4 font-sans border-t border-zinc-800/50 pt-5">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">Account Beneficiary</span>
                        <p className="text-zinc-300 text-sm font-medium tracking-wide">{BANK_DETAILS.europe.accountName}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/20">
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">IBAN</span>
                          <p className="font-mono text-sm text-zinc-200 truncate">{BANK_DETAILS.europe.iban}</p>
                        </div>
                        <button 
                          onClick={() => setShowEuropeDetails(true)}
                          className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
                        >
                          <Info size={14} className="text-gold" />
                          View Info
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* USA Transfer Card */}
                  <div className="relative group overflow-hidden bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800 hover:border-zinc-700/80 p-6 sm:p-8 rounded-3xl transition-all duration-300 shadow-xl shadow-black/30">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-700/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700/50 group-hover:scale-105 transition-transform">
                          <Globe className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 inline-block mb-1">
                            {BANK_DETAILS.usa.accountType}
                          </span>
                          <h3 className="text-lg font-serif text-white">USA ACH Route</h3>
                        </div>
                      </div>
                      
                      <QuickCopy value={BANK_DETAILS.usa.accountNumber} />
                    </div>

                    <p className="text-xs text-zinc-500 mb-5 leading-relaxed">{BANK_DETAILS.usa.description}</p>

                    <div className="space-y-4 font-sans border-t border-zinc-800/50 pt-5">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">Account Beneficiary</span>
                        <p className="text-zinc-300 text-sm font-medium tracking-wide">{BANK_DETAILS.usa.beneficiaryName}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/20">
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">Account Number</span>
                          <p className="font-mono text-sm text-zinc-200 truncate">{BANK_DETAILS.usa.accountNumber}</p>
                        </div>
                        <button 
                          onClick={() => setShowUsaDetails(true)}
                          className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
                        >
                          <Info size={14} className="text-gold" />
                          View Info
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Local Details Modal */}
      <AnimatePresence>
        {showLocalDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLocalDetails(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDomDetails(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
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

      {/* Europe Transfer Modal */}
      <AnimatePresence>
        {showEuropeDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEuropeDetails(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 inline-block mb-1">
                    {BANK_DETAILS.europe.accountType}
                  </span>
                  <h3 className="text-2xl font-serif text-white">Europe Bank Details</h3>
                </div>
                <button 
                  onClick={() => setShowEuropeDetails(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-1 mb-8">
                <DetailRow label="Bank Name" value={BANK_DETAILS.europe.bankName} />
                <DetailRow label="Account Name" value={BANK_DETAILS.europe.accountName} />
                <DetailRow label="IBAN" value={BANK_DETAILS.europe.iban} />
                <DetailRow label="SWIFT/BIC" value={BANK_DETAILS.europe.swift} />
                <DetailRow label="Bank Address" value={BANK_DETAILS.europe.bankAddress} />
              </div>

              {/* Important Instruction for UK Users */}
              <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 text-left">
                <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">UK Transfer Guideline</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    A UK account is required. Please ensure the destination country is set to <strong className="text-white">Malta</strong> for all users sending/paying to this account from the UK.
                  </p>
                </div>
              </div>

              {/* QR Code Toggle */}
              <div className="mb-8">
                <button 
                  onClick={() => setShowIBANQR(!showIBANQR)}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-zinc-800 rounded-xl hover:border-gold hover:text-gold transition-all group"
                >
                  <QrCode size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-xs tracking-wider uppercase">{showIBANQR ? "Hide IBAN QR Code" : "Show IBAN QR Code"}</span>
                </button>
                
                <AnimatePresence>
                  {showIBANQR && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6 flex flex-col items-center">
                        <div className="bg-white p-4 rounded-2xl shadow-xl">
                          <QRCodeSVG 
                            value={BANK_DETAILS.europe.iban} 
                            size={180}
                            level="H"
                            includeMargin={false}
                          />
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-4 uppercase tracking-[0.2em] text-center">
                          Scan this code in your mobile banking app to copy the IBAN directly
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={() => setShowEuropeDetails(false)}
                className="w-full py-4 bg-zinc-100 text-zinc-950 font-bold rounded-xl hover:bg-gold hover:text-white transition-all shadow-lg"
              >
                Close Details
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* USA Transfer Modal */}
      <AnimatePresence>
        {showUsaDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUsaDetails(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 inline-block mb-1">
                    {BANK_DETAILS.usa.accountType}
                  </span>
                  <h3 className="text-2xl font-serif text-white">USA Bank Details</h3>
                </div>
                <button 
                  onClick={() => setShowUsaDetails(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-1 mb-8">
                <DetailRow label="Beneficiary Name" value={BANK_DETAILS.usa.beneficiaryName} />
                <DetailRow label="Account Number" value={BANK_DETAILS.usa.accountNumber} />
                <DetailRow label="Routing Number" value={BANK_DETAILS.usa.routingNumber} />
                <DetailRow label="Bank Name" value={BANK_DETAILS.usa.bankName} />
                <DetailRow label="Bank Address" value={BANK_DETAILS.usa.bankAddress} />
              </div>

              {/* Important Transfer Guideline for US Users */}
              <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 text-left">
                <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">USA Transfer Guideline</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Please use <strong className="text-white">ACH</strong> only. Do <strong className="text-red-400">NOT</strong> use Wire transfer. When presented with options by USA banks, choose ACH and NOT wire.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowUsaDetails(false)}
                className="w-full py-4 bg-zinc-100 text-zinc-950 font-bold rounded-xl hover:bg-gold hover:text-white transition-all shadow-lg"
              >
                Close Details
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
