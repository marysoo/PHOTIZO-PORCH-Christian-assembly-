import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Trash2, 
  Shield, 
  Sparkles, 
  MessageSquare, 
  ChevronDown, 
  User, 
  Flame, 
  EyeOff, 
  X, 
  Edit2, 
  Check, 
  Clock 
} from 'lucide-react';
import { firebaseService, LiveChatMessage } from '../lib/firebaseService';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface LiveStreamChatProps {
  isAdmin?: boolean;
  className?: string;
  onHide?: () => void;
}

const QUICK_REACTIONS = [
  "Amen! 🙏",
  "Hallelujah! 🔥",
  "I receive this Word! ✝️",
  "Glory to God! ✨",
  "Divine Light! 🌟",
  "Watching from Nigeria 🇳🇬",
  "Watching from UK 🇬🇧",
  "Watching from USA 🇺🇸"
];

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export default function LiveStreamChat({ isAdmin = false, className = '', onHide }: LiveStreamChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [senderName, setSenderName] = useState(() => {
    return localStorage.getItem('photizo_chat_username') || user?.displayName || '';
  });
  const [isEditingName, setIsEditingName] = useState(!senderName);
  const [isSending, setIsSending] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Persistent Client User ID so users can edit and manage their own chats
  const [chatUserId] = useState<string>(() => {
    let id = localStorage.getItem('photizo_chat_user_id');
    if (!id) {
      id = `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('photizo_chat_user_id', id);
    }
    return id;
  });

  // Inline Message Editing State
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isUpdatingEdit, setIsUpdatingEdit] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Sync sender name when Google user logs in
  useEffect(() => {
    if (user?.displayName && !senderName) {
      setSenderName(user.displayName);
      setIsEditingName(false);
      localStorage.setItem('photizo_chat_username', user.displayName);
    }
  }, [user]);

  // Subscribe to live chat messages (filtered to past 24 hours)
  useEffect(() => {
    const unsub = firebaseService.subscribeLiveChat((chatList) => {
      const now = Date.now();
      const valid = chatList.filter(msg => {
        const t = new Date(msg.createdAt).getTime();
        return !isNaN(t) && (now - t <= TWENTY_FOUR_HOURS_MS);
      });
      setMessages(valid);
    });
    return () => unsub();
  }, []);

  // Periodic 24h prune timer: ensures chats expire strictly after 24 hours
  useEffect(() => {
    const interval = setInterval(() => {
      const cutoff = Date.now() - TWENTY_FOUR_HOURS_MS;
      setMessages(prev => prev.filter(msg => {
        const t = new Date(msg.createdAt).getTime();
        return !isNaN(t) && t >= cutoff;
      }));
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom('smooth');
    }
  }, [messages]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
    setShowScrollBottom(!isNearBottom);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText !== undefined ? customText : inputText).trim();
    if (!textToSend || isSending) return;

    let finalName = senderName.trim();
    if (!finalName) {
      finalName = user?.displayName || `Fellow Believer #${Math.floor(100 + Math.random() * 900)}`;
      setSenderName(finalName);
      localStorage.setItem('photizo_chat_username', finalName);
    }

    setIsSending(true);
    try {
      const role: LiveChatMessage['role'] = isAdmin ? 'admin' : (user?.email?.includes('tsukwas') ? 'pastor' : 'member');
      await firebaseService.sendLiveChatMessage({
        senderName: finalName,
        message: textToSend,
        createdAt: new Date().toISOString(),
        role,
        senderId: user?.uid || chatUserId
      });
      if (customText === undefined) {
        setInputText('');
      }
      setShowScrollBottom(false);
      setTimeout(() => scrollToBottom('smooth'), 100);
    } catch (e) {
      console.error('Failed to send live chat message', e);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSaveName = (name: string) => {
    const trimmed = name.trim();
    if (trimmed) {
      setSenderName(trimmed);
      localStorage.setItem('photizo_chat_username', trimmed);
      setIsEditingName(false);
    }
  };

  const handleStartEdit = (msg: LiveChatMessage) => {
    if (!msg.id) return;
    setEditingMessageId(msg.id);
    setEditContent(msg.message);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (messageId: string) => {
    const trimmed = editContent.trim();
    if (!trimmed || isUpdatingEdit) return;

    setIsUpdatingEdit(true);
    try {
      await firebaseService.editLiveChatMessage(messageId, trimmed);
      setMessages(prev => prev.map(m => m.id === messageId ? {
        ...m,
        message: trimmed,
        isEdited: true,
        updatedAt: new Date().toISOString()
      } : m));
      setEditingMessageId(null);
      setEditContent('');
    } catch (e) {
      console.error('Failed to update live chat message', e);
    } finally {
      setIsUpdatingEdit(false);
    }
  };

  const handleDeleteMessage = async (id?: string) => {
    if (!id) return;
    try {
      await firebaseService.deleteLiveChatMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      console.error('Failed to delete message', e);
    }
  };

  return (
    <div className={`flex flex-col bg-zinc-950/95 backdrop-blur-md border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl h-full ${className}`}>
      {/* Chat Header with 24-Hour Sustenance Badge */}
      <div className="px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <MessageSquare className="w-4 h-4 text-gold" />
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute -top-0.5 -right-0.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate">
                Fellowship Chat
              </h4>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                LIVE
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1" title="Chats are sustained for 24 hours, then auto-cleared">
                <Clock size={9} />
                <span>24h Active</span>
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 truncate">
              {messages.length} {messages.length === 1 ? 'message' : 'messages'} &bull; Auto-cleans after 24 hrs
            </p>
          </div>
        </div>

        {/* User Identity Chip & Hide toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                defaultValue={senderName}
                placeholder="Your Name..."
                maxLength={40}
                onBlur={(e) => handleSaveName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName(e.currentTarget.value);
                }}
                autoFocus
                className="w-24 sm:w-28 px-2 py-1 text-xs bg-zinc-900 border border-gold/40 rounded-lg text-white outline-none"
              />
            </div>
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer"
              title="Click to change your display name"
            >
              <User size={11} className="text-gold" />
              <span className="max-w-[80px] sm:max-w-[100px] truncate">{senderName || 'Set Name'}</span>
            </button>
          )}

          {onHide && (
            <button
              type="button"
              onClick={onHide}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 text-[11px] font-medium transition-all cursor-pointer group"
              title="Hide live chat (Watch in full width theater mode)"
              aria-label="Hide live chat"
            >
              <EyeOff size={12} className="group-hover:text-red-400 transition-colors" />
              <span className="hidden sm:inline">Hide</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[300px] max-h-[480px] custom-scrollbar relative"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-gold opacity-60" />
            </div>
            <p className="text-xs font-semibold text-zinc-400">Welcome to Live Fellowship!</p>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
              Declare your praise, send your Amens, or share where you are joining from. Chats remain active for 24 hours.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSelf = Boolean(
              (msg.senderId && (msg.senderId === user?.uid || msg.senderId === chatUserId)) ||
              (senderName && msg.senderName.trim().toLowerCase() === senderName.trim().toLowerCase())
            );
            const isMsgAdmin = msg.role === 'admin' || msg.role === 'pastor';
            const isEditingThis = editingMessageId === msg.id;

            return (
              <motion.div
                key={msg.id || `${msg.senderName}-${msg.createdAt}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group flex items-start gap-2.5 text-xs ${isSelf ? 'justify-end' : 'justify-start'}`}
              >
                {!isSelf && (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 border ${
                    isMsgAdmin
                      ? 'bg-gold/20 text-gold border-gold/40 shadow-sm'
                      : 'bg-zinc-850 text-zinc-300 border-zinc-800'
                  }`}>
                    {msg.senderName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm transition-all relative ${
                  isSelf
                    ? 'bg-gradient-to-r from-amber-600/20 to-yellow-600/10 border border-gold/30 text-zinc-100'
                    : isMsgAdmin
                      ? 'bg-gold/10 border border-gold/40 text-gold-light'
                      : 'bg-zinc-900/90 border border-zinc-800/80 text-zinc-200'
                }`}>
                  {/* Sender & Timestamp Header */}
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`font-bold truncate text-[11px] ${isMsgAdmin ? 'text-gold' : 'text-zinc-300'}`}>
                        {msg.senderName}
                      </span>
                      {isMsgAdmin && (
                        <span className="flex items-center gap-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-gold text-zinc-950">
                          <Shield size={9} /> Leader
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-mono shrink-0">
                      <span>{formatMessageTime(msg.createdAt)}</span>
                      {msg.isEdited && (
                        <span className="text-[9px] text-gold/70 italic">(edited)</span>
                      )}
                    </div>
                  </div>

                  {/* Message Body or Inline Editor */}
                  {isEditingThis ? (
                    <div className="mt-1.5 space-y-2">
                      <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(msg.id!);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        maxLength={500}
                        autoFocus
                        className="w-full bg-zinc-950 border border-gold/60 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-gold"
                        placeholder="Edit your message..."
                      />
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] text-zinc-500">Press Enter to save, Esc to cancel</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-medium transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(msg.id!)}
                            disabled={!editContent.trim() || isUpdatingEdit}
                            className="px-2.5 py-1 rounded-lg bg-gold hover:brightness-110 text-zinc-950 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Check size={11} />
                            <span>{isUpdatingEdit ? 'Saving...' : 'Save'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs leading-relaxed break-words">
                      {msg.message}
                    </p>
                  )}

                  {/* Action Controls for Author (Edit & Delete) or Admin (Delete) */}
                  {!isEditingThis && (isSelf || isAdmin) && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 -right-2 flex items-center gap-1 z-10">
                      {isSelf && (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(msg)}
                          className="p-1 rounded-full bg-zinc-900 border border-gold/40 text-gold hover:bg-gold hover:text-zinc-950 cursor-pointer shadow-md transition-all"
                          title="Edit your chat"
                          aria-label="Edit chat"
                        >
                          <Edit2 size={11} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1 rounded-full bg-red-950 border border-red-500/40 text-red-400 hover:text-red-200 cursor-pointer shadow-md transition-all"
                        title={isAdmin ? "Moderate / Delete chat" : "Delete your chat"}
                        aria-label="Delete chat"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )}
                </div>

                {isSelf && (
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-gold border border-gold/40 flex items-center justify-center font-bold text-[11px] shrink-0">
                    {senderName ? senderName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom pill */}
      <AnimatePresence>
        {showScrollBottom && (
          <div className="relative">
            <button
              onClick={() => {
                setShowScrollBottom(false);
                scrollToBottom('smooth');
              }}
              className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900/95 border border-gold/40 text-gold text-[10px] font-semibold shadow-lg hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <span>Latest Messages</span>
              <ChevronDown size={12} />
            </button>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Praise & Reaction Carousel */}
      <div className="px-3 py-2 border-t border-zinc-900 bg-zinc-950/70 overflow-x-auto custom-scrollbar flex items-center gap-1.5">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest shrink-0 flex items-center gap-1 pl-1">
          <Flame size={12} className="text-gold" />
          <span>Quick:</span>
        </span>
        {QUICK_REACTIONS.map((reaction, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(reaction)}
            className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-gold/50 text-[11px] text-zinc-300 hover:text-white shrink-0 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            {reaction}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-900/70">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={senderName ? `Share with fellowship as ${senderName}...` : "Type a message or prayer response..."}
            maxLength={500}
            className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-full text-xs text-white placeholder:text-zinc-500 focus:border-gold/60 outline-none transition-all"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isSending}
            className="p-2.5 rounded-full bg-gold text-zinc-950 hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 transition-all cursor-pointer shadow-md shrink-0 flex items-center justify-center active:scale-95"
            title="Send Message"
            aria-label="Send Message"
          >
            <Send size={15} />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2 px-2 text-[10px] text-zinc-500">
          <span>Press Enter to send &bull; Sustained for 24h &bull; Edit anytime</span>
          <span>{inputText.length}/500</span>
        </div>
      </div>
    </div>
  );
}

function formatMessageTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Now';
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 0) return 'Just now';
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return '24h ago';
  } catch {
    return 'Now';
  }
}
