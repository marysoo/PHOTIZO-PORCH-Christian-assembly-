import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Smartphone, 
  Download, 
  Maximize2, 
  Copy, 
  Check, 
  ExternalLink, 
  Landmark, 
  Globe, 
  PhoneCall, 
  ShieldCheck, 
  Sparkles, 
  X,
  Info
} from 'lucide-react';
import { BANK_DETAILS } from '../constants';

interface QRCodeItem {
  id: string;
  category: 'local' | 'international';
  title: string;
  bankName: string;
  accountType: string;
  badge: string;
  badgeColor: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  qrPayload: string;
  description: string;
  ussdCode?: string;
  directUrl?: string;
}

export default function GivingQRCodeSection() {
  const [filter, setFilter] = useState<'all' | 'local' | 'international'>('all');
  const [activeModalItem, setActiveModalItem] = useState<QRCodeItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const qrItems: QRCodeItem[] = [
    {
      id: 'zenith-local',
      category: 'local',
      title: 'Zenith Bank • Local Transfer',
      bankName: BANK_DETAILS.local.bankName,
      accountType: 'Local Naira (NGN)',
      badge: 'Primary Local',
      badgeColor: 'border-amber-400/30 text-amber-400 bg-amber-400/10',
      accountNumber: BANK_DETAILS.local.accountNumber,
      accountName: BANK_DETAILS.local.accountName,
      currency: 'NGN (₦)',
      qrPayload: `BANK: ${BANK_DETAILS.local.bankName}\nACCOUNT: ${BANK_DETAILS.local.accountNumber}\nNAME: ${BANK_DETAILS.local.accountName}\nPURPOSE: Tithe / Offering / Kingdom Seed`,
      description: 'Instant local giving via mobile banking app or USSD transfer.',
      ussdCode: `*966*0*${BANK_DETAILS.local.accountNumber}#`
    },
    {
      id: 'keystone-local',
      category: 'local',
      title: 'Keystone Bank • Local Transfer',
      bankName: BANK_DETAILS.localSecondary.bankName,
      accountType: 'Local Naira (NGN)',
      badge: 'Secondary Local',
      badgeColor: 'border-zinc-500/30 text-zinc-300 bg-zinc-800',
      accountNumber: BANK_DETAILS.localSecondary.accountNumber,
      accountName: BANK_DETAILS.localSecondary.accountName,
      currency: 'NGN (₦)',
      qrPayload: `BANK: ${BANK_DETAILS.localSecondary.bankName}\nACCOUNT: ${BANK_DETAILS.localSecondary.accountNumber}\nNAME: ${BANK_DETAILS.localSecondary.accountName}\nPURPOSE: Tithe / Offering / Seed`,
      description: 'Direct local transfer for partners and brethren in Nigeria.'
    },
    {
      id: 'paypal-global',
      category: 'international',
      title: 'PayPal & Xoom • International Giving',
      bankName: 'PayPal Xoom (Fidelity Bank)',
      accountType: 'Online / Card / PayPal Xoom',
      badge: 'Under Review • Use Xoom',
      badgeColor: 'border-amber-400/30 text-amber-300 bg-amber-400/10',
      accountNumber: '6977216553 (Fidelity Bank)',
      accountName: 'Japheth Mbalumunga Tsukwas',
      currency: 'USD & Global currencies via Xoom',
      qrPayload: 'https://www.xoom.com/nigeria/send-money',
      description: 'PayPal account is currently under review. USA and global partners can send directly to Fidelity Bank via PayPal Xoom.',
      directUrl: 'https://www.xoom.com/nigeria/send-money'
    },
    {
      id: 'zenith-usd-dom',
      category: 'international',
      title: 'Zenith Bank • USD Domiciliary',
      bankName: BANK_DETAILS.dom.bankName,
      accountType: 'USD ($) Domiciliary',
      badge: 'USD Domiciliary',
      badgeColor: 'border-amber-400/30 text-amber-400 bg-amber-400/10',
      accountNumber: BANK_DETAILS.dom.accountNumber,
      accountName: BANK_DETAILS.dom.accountName,
      currency: 'USD ($)',
      qrPayload: `BANK: ${BANK_DETAILS.dom.bankName}\nACCOUNT: ${BANK_DETAILS.dom.accountNumber}\nBENEFICIARY: ${BANK_DETAILS.dom.accountName}\nCURRENCY: USD ($)`,
      description: 'Direct foreign exchange transfer for international kingdom builders.'
    },
    {
      id: 'zenith-gbp-dom',
      category: 'international',
      title: 'Zenith Bank • GBP Domiciliary',
      bankName: BANK_DETAILS.domGbp.bankName,
      accountType: 'GBP (£) Domiciliary',
      badge: 'GBP (£) Domiciliary',
      badgeColor: 'border-emerald-400/30 text-emerald-400 bg-emerald-400/10',
      accountNumber: BANK_DETAILS.domGbp.accountNumber,
      accountName: BANK_DETAILS.domGbp.accountName,
      currency: 'GBP (£)',
      qrPayload: `BANK: ${BANK_DETAILS.domGbp.bankName}\nACCOUNT: ${BANK_DETAILS.domGbp.accountNumber}\nBENEFICIARY: ${BANK_DETAILS.domGbp.accountName}\nCURRENCY: GBP (£)`,
      description: 'Official British Pounds domiciliary account for UK and European partners.'
    },
    {
      id: 'keystone-dom',
      category: 'international',
      title: 'Keystone Bank • USD Domiciliary',
      bankName: BANK_DETAILS.domKeystone.bankName,
      accountType: 'USD Domiciliary Wire',
      badge: 'Wire & Swift',
      badgeColor: 'border-purple-400/30 text-purple-400 bg-purple-400/10',
      accountNumber: BANK_DETAILS.domKeystone.accountNumber,
      accountName: BANK_DETAILS.domKeystone.accountName,
      currency: 'USD ($)',
      qrPayload: `BANK: ${BANK_DETAILS.domKeystone.bankName}\nACCOUNT: ${BANK_DETAILS.domKeystone.accountNumber}\nSWIFT: ${BANK_DETAILS.domKeystone.swift}\nBENEFICIARY: ${BANK_DETAILS.domKeystone.accountName}`,
      description: 'International wire routing with official SWIFT code and CITI correspondent.'
    }
  ];

  const filteredItems = qrItems.filter(item => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  const copyText = async (text: string, id: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        return;
      }
    } catch {
      // fallback
    }

    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Unable to copy", err);
    }
  };

  const downloadQR = (svgElementId: string, filename: string) => {
    setDownloadingId(svgElementId);
    try {
      const svg = document.getElementById(svgElementId);
      if (!svg) {
        setDownloadingId(null);
        return;
      }
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width + 48;
        canvas.height = img.height + 48;
        if (ctx) {
          ctx.fillStyle = "#09090b";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          // Draw white card background for QR
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.roundRect(16, 16, img.width + 16, img.height + 16, 12);
          ctx.fill();
          ctx.drawImage(img, 24, 24);

          const pngUrl = canvas.toDataURL("image/png");
          const downloadAnchor = document.createElement("a");
          downloadAnchor.download = `${filename}.png`;
          downloadAnchor.href = pngUrl;
          downloadAnchor.click();
        }
        setDownloadingId(null);
      };
      img.onerror = () => setDownloadingId(null);
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.error("Failed to download QR code", err);
      setDownloadingId(null);
    }
  };

  return (
    <div id="giving-qr-codes" className="w-full mt-16 pt-12 border-t border-zinc-800/80 scroll-mt-24">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3 shadow-sm">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile Giving • Scannable QR Codes</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-serif text-white mb-3">
          Scan to Give on Mobile
        </h3>
        <p className="text-zinc-400 text-sm leading-relaxed font-light">
          Open your smartphone camera or mobile banking app to instantly scan and complete your donation for both Nigerian local accounts and international channels.
        </p>

        {/* Filter Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            All Channels ({qrItems.length})
          </button>
          <button
            onClick={() => setFilter('local')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'local'
                ? 'bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-amber-400/30'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Local Naira QRs (2)</span>
          </button>
          <button
            onClick={() => setFilter('international')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'international'
                ? 'bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-sky-400/30'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>International & PayPal (4)</span>
          </button>
        </div>
      </div>

      {/* Grid of QR Codes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {filteredItems.map((item) => {
          const svgId = `qr-code-${item.id}`;
          const isCopied = copiedId === item.id;
          const isDownloading = downloadingId === svgId;

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800/90 hover:border-amber-500/40 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl group hover:shadow-2xl hover:shadow-amber-500/[0.04]"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border inline-block mb-1.5 ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    <h4 className="text-base font-serif text-white group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-zinc-400">{item.bankName}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-zinc-800/70 border border-zinc-700/60 flex items-center justify-center shrink-0 text-zinc-400 group-hover:text-amber-400 transition-colors">
                    {item.category === 'local' ? <Landmark className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="relative my-4 flex flex-col items-center">
                  <div 
                    onClick={() => setActiveModalItem(item)}
                    className="relative bg-white p-3.5 rounded-2xl shadow-lg border-2 border-zinc-200 cursor-pointer group/qr transition-transform duration-200 hover:scale-[1.03]"
                    title="Click to enlarge QR code"
                  >
                    <QRCodeSVG
                      id={svgId}
                      value={item.qrPayload}
                      size={168}
                      level="M"
                      bgColor="#ffffff"
                      fgColor="#09090b"
                      includeMargin={false}
                    />
                    
                    {/* Hover Hint Overlay */}
                    <div className="absolute inset-0 bg-black/75 rounded-2xl opacity-0 group-hover/qr:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity text-white backdrop-blur-[2px]">
                      <Maximize2 className="w-5 h-5 text-amber-400" />
                      <span className="text-[11px] font-semibold tracking-wider uppercase">Enlarge</span>
                    </div>

                    {/* Corner Camera Frame accents */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-amber-400 rounded-tl" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-amber-400 rounded-tr" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-amber-400 rounded-bl" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-amber-400 rounded-br" />
                  </div>

                  <span className="text-[10px] text-zinc-500 mt-2 flex items-center gap-1">
                    <QrCode className="w-3 h-3 text-amber-400/80" />
                    Tap QR to expand & view guide
                  </span>
                </div>

                {/* Account details summary */}
                <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-3.5 mb-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 uppercase tracking-widest text-[9px]">Account Number</span>
                    <span className="font-mono font-bold text-white tracking-wider">{item.accountNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-zinc-900 pt-2">
                    <span className="text-zinc-500 uppercase tracking-widest text-[9px]">Beneficiary</span>
                    <span className="text-zinc-300 text-[11px] font-medium truncate max-w-[160px]" title={item.accountName}>
                      {item.accountName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => copyText(item.accountNumber, item.id)}
                    className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Copy Num</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => downloadQR(svgId, `Photizo_Porch_${item.id}`)}
                    disabled={isDownloading}
                    className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{isDownloading ? 'Saving...' : 'Save QR'}</span>
                  </button>
                </div>

                {/* Optional USSD or Direct URL button */}
                {item.ussdCode && (
                  <a
                    href={`tel:${item.ussdCode}`}
                    className="w-full py-2 px-3 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Quick Dial USSD ({item.ussdCode})</span>
                  </a>
                )}

                {item.directUrl && (
                  <a
                    href={item.directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in PayPal Browser</span>
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile Instructions Card */}
      <div className="max-w-4xl mx-auto mt-12 p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-serif text-white mb-1">How Mobile QR Giving Works</h4>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
              1. Open your phone camera or bank app (Zenith, GTBank, Kuda, etc.) &bull; 2. Aim at the QR code &bull; 3. Confirm <strong className="text-zinc-200">PHOTIZO PORCH CHRISTIAN ASSEMBLY</strong> as beneficiary and approve your donation.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            100% Secure & Direct
          </span>
        </div>
      </div>

      {/* Enlarged QR Modal */}
      <AnimatePresence>
        {activeModalItem && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalItem(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md z-40"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-50 my-auto text-center"
            >
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border inline-block mb-3 ${activeModalItem.badgeColor}`}>
                {activeModalItem.badge}
              </span>
              <h3 className="text-2xl font-serif text-white mb-1">{activeModalItem.title}</h3>
              <p className="text-xs text-zinc-400 mb-6">{activeModalItem.description}</p>

              {/* Large QR Display */}
              <div className="inline-block relative bg-white p-5 rounded-3xl shadow-2xl border-4 border-amber-400/20 mb-6">
                <QRCodeSVG
                  id={`modal-qr-${activeModalItem.id}`}
                  value={activeModalItem.qrPayload}
                  size={240}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#09090b"
                  includeMargin={false}
                />
              </div>

              {/* Details card */}
              <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 text-left space-y-2 mb-6">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Bank / Provider</span>
                  <span className="text-white font-medium">{activeModalItem.bankName}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-zinc-800 pt-2">
                  <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Account / Recipient</span>
                  <span className="font-mono font-bold text-amber-400 tracking-wider text-sm">{activeModalItem.accountNumber}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-zinc-800 pt-2">
                  <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Beneficiary Name</span>
                  <span className="text-zinc-200 text-xs font-medium">{activeModalItem.accountName}</span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => copyText(activeModalItem.accountNumber, `modal-${activeModalItem.id}`)}
                  className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedId === `modal-${activeModalItem.id}` ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-zinc-400" />
                      <span>Copy Details</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => downloadQR(`modal-qr-${activeModalItem.id}`, `Photizo_${activeModalItem.id}_large`)}
                  className="py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-400/20 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Save QR Code</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
