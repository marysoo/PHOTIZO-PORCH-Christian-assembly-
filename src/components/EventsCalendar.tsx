import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Tag, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Check, 
  X, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { firebaseService, ChurchEvent } from '../lib/firebaseService';

// Pre-defined categories
const CATEGORIES = [
  "Sunday Service",
  "Midweek Service",
  "Prayer Meeting",
  "Special Event",
  "Youth & Teen"
];

const CATEGORY_COLORS: { [key: string]: { text: string; bg: string; border: string } } = {
  "Sunday Service": { text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-500/20" },
  "Midweek Service": { text: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-500/20" },
  "Prayer Meeting": { text: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-500/20" },
  "Special Event": { text: "text-red-400", bg: "bg-red-400/10", border: "border-red-500/20" },
  "Youth & Teen": { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-500/20" }
};

interface EventsCalendarProps {
  isAdmin: boolean;
}

export default function EventsCalendar({ isAdmin }: EventsCalendarProps) {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDay, setSelectedDay] = useState<string | null>(null); // YYYY-MM-DD
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 6, 2)); // Defaulting to July 2026 based on local metadata year
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);
  
  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('2026-07-02');
  const [formTime, setFormTime] = useState('09:00 AM');
  const [formLocation, setFormLocation] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formImageUrl, setFormImageUrl] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch events from Firestore
  useEffect(() => {
    const unsubscribe = firebaseService.subscribeEvents((data) => {
      setEvents(data);
      
      // Auto-bootstrap if empty and admin is viewing, or just trigger initial events
      if (data.length === 0 && isAdmin) {
        const initialEvents: ChurchEvent[] = [
          {
            title: "Sunday Illumination Service",
            category: "Sunday Service",
            date: "2026-07-05",
            time: "09:00 AM",
            location: "Main Sanctuary & Online",
            description: "An atmospheric service of praise, worship, and deeper prophetic revelations of God's Word with Prophet Japeth Tsukwas.",
            imageUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=600"
          },
          {
            title: "Midweek Prophetic Revelation",
            category: "Midweek Service",
            date: "2026-07-08",
            time: "05:30 PM",
            location: "Main Sanctuary & YouTube Live",
            description: "Our weekly check-point of divine teachings, prophetic instructions, and intense prayers.",
            imageUrl: "https://images.unsplash.com/photo-1444464666168-49d633b86747?q=80&w=600"
          },
          {
            title: "Atmosphere of Miracles",
            category: "Special Event",
            date: "2026-07-19",
            time: "04:00 PM",
            location: "Photizo Dome",
            description: "A special monthly prophetic gathering with healing ministrations, miracles, and specialized spiritual guidance.",
            imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=600"
          },
          {
            title: "All-Night Prophetic Vigil",
            category: "Prayer Meeting",
            date: "2026-07-31",
            time: "10:00 PM",
            location: "Main Sanctuary",
            description: "A power-packed night of intense prayers and prophetic utterances as we birth and establish the coming month.",
            imageUrl: "https://images.unsplash.com/photo-1510531704581-5b2870972060?q=80&w=600"
          }
        ];
        
        // Auto-bootstrap initial events if list is empty
        initialEvents.forEach(evt => {
          firebaseService.upsertEvent(evt);
        });
      }
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Set default form values when editing
  const openAddModal = () => {
    setEditingEvent(null);
    setFormTitle('');
    setFormDescription('');
    setFormDate(selectedDay || '2026-07-02');
    setFormTime('09:00 AM');
    setFormLocation('Main Sanctuary');
    setFormCategory(CATEGORIES[0]);
    setFormImageUrl('');
    setFormError('');
    setShowFormModal(true);
  };

  const openEditModal = (event: ChurchEvent) => {
    setEditingEvent(event);
    setFormTitle(event.title);
    setFormDescription(event.description);
    setFormDate(event.date);
    setFormTime(event.time);
    setFormLocation(event.location);
    setFormCategory(event.category);
    setFormImageUrl(event.imageUrl || '');
    setFormError('');
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim() || !formDate || !formTime || !formLocation) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const eventPayload: ChurchEvent = {
      ...(editingEvent?.id ? { id: editingEvent.id } : {}),
      title: formTitle.trim(),
      description: formDescription.trim(),
      date: formDate,
      time: formTime.trim(),
      location: formLocation.trim(),
      category: formCategory,
      imageUrl: formImageUrl.trim() || undefined
    };

    try {
      await firebaseService.upsertEvent(eventPayload);
      setShowFormModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save event. Check rules permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await firebaseService.deleteEvent(eventId);
        if (selectedDay) {
          // If the day was selected and had only this event, it might now have none
        }
      } catch (err) {
        alert('Failed to delete event.');
      }
    }
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper to format date string to YYYY-MM-DD
  const formatDateString = (dayNum: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Get filtered list of events
  const filteredEvents = events.filter(evt => {
    const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory;
    const matchesDay = !selectedDay || evt.date === selectedDay;
    return matchesCategory && matchesDay;
  });

  // Check if a calendar day has events
  const getEventsForDay = (dayNum: number) => {
    const formattedStr = formatDateString(dayNum);
    return events.filter(evt => evt.date === formattedStr);
  };

  // Group events by month/year just to sort out list of all events
  const formatFriendlyDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch (e) {}
    return dateStr;
  };

  return (
    <section id="calendar" className="py-24 px-6 border-b border-zinc-900 bg-zinc-950/20 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="text-left">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-[0.25em] block mb-2">Activities & Gatherings</span>
            <h2 className="text-4xl md:text-5xl font-serif text-white glow-text">Events Calendar</h2>
            <p className="text-zinc-400 text-sm mt-2 max-w-lg">
              Synchronize with our upcoming church activities, specialized revelations, and corporate services.
            </p>
          </div>
          
          <div className="flex items-center gap-3 self-start md:self-end">
            {isAdmin && (
              <button 
                onClick={openAddModal}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-bold px-5 py-3 rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all text-xs uppercase tracking-wider"
              >
                <Plus size={16} /> Add New Event
              </button>
            )}
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex flex-wrap gap-2 mb-10 pb-2 border-b border-zinc-900 overflow-x-auto">
          <button
            onClick={() => { setSelectedCategory('All'); setSelectedDay(null); }}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              selectedCategory === 'All' && !selectedDay
                ? 'bg-amber-400 text-zinc-950 font-bold shadow-lg shadow-amber-400/10'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            All Events
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setSelectedDay(null); }}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === cat && !selectedDay
                  ? 'bg-amber-400 text-zinc-950 font-bold shadow-lg shadow-amber-400/10'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Interface: Side-by-Side Calendar + Event Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Calendar Widget Column (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.02] rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-serif text-lg text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-400" />
                <span>{monthNames[month]} {year}</span>
              </h3>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={handlePrevMonth}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-y-2 text-center mb-4">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                <span key={idx} className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{d}</span>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-y-3 gap-x-1.5 text-center">
              {/* Offset Days */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`offset-${idx}`} className="aspect-square opacity-0 pointer-events-none" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const formattedDateStr = formatDateString(dayNum);
                const dayEvents = getEventsForDay(dayNum);
                const hasEvents = dayEvents.length > 0;
                const isSelected = selectedDay === formattedDateStr;
                const isToday = new Date().toDateString() === new Date(year, month, dayNum).toDateString();

                return (
                  <button
                    key={dayNum}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDay(null); // toggle off filter
                      } else {
                        setSelectedDay(formattedDateStr);
                      }
                    }}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all group border ${
                      isSelected
                        ? 'bg-amber-400 text-zinc-950 font-bold border-amber-400 shadow-md shadow-amber-400/20 scale-105'
                        : isToday
                          ? 'bg-zinc-800/80 border-amber-500/50 text-white'
                          : 'bg-zinc-950/40 border-zinc-900/50 hover:border-zinc-700/60 text-zinc-300'
                    }`}
                  >
                    <span className="text-xs">{dayNum}</span>
                    {hasEvents && (
                      <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${
                        isSelected ? 'bg-zinc-950' : 'bg-amber-400 animate-pulse'
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend/Details */}
            <div className="mt-8 border-t border-zinc-800/60 pt-6 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span>Has Service/Event</span>
              </span>
              {selectedDay && (
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="text-amber-400 font-medium hover:underline text-xs"
                >
                  Clear Date Filter
                </button>
              )}
            </div>
          </div>

          {/* Events Listings Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Context/Filter description */}
            <div className="flex items-center justify-between bg-zinc-900/30 border border-zinc-900 px-6 py-4 rounded-2xl text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-amber-400" />
                <span>
                  Showing {filteredEvents.length} events {selectedCategory !== 'All' ? `categorized in "${selectedCategory}"` : ''} 
                  {selectedDay ? ` scheduled for ${formatFriendlyDate(selectedDay)}` : ''}.
                </span>
              </div>
              {(selectedCategory !== 'All' || selectedDay) && (
                <button
                  onClick={() => { setSelectedCategory('All'); setSelectedDay(null); }}
                  className="text-amber-400 hover:text-white font-bold uppercase tracking-wider text-[10px] transition-colors"
                >
                  Show All
                </button>
              )}
            </div>

            {/* List of Cards */}
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {filteredEvents.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-12 text-center border border-dashed border-zinc-800 rounded-3xl"
                  >
                    <AlertTriangle className="w-8 h-8 text-zinc-600 mx-auto mb-4" />
                    <p className="text-sm text-zinc-400 font-medium mb-1">No activities found</p>
                    <p className="text-xs text-zinc-500">There are no matching services or activities listed for this category or day.</p>
                  </motion.div>
                ) : (
                  filteredEvents.map(evt => {
                    const colors = CATEGORY_COLORS[evt.category] || { text: "text-zinc-400", bg: "bg-zinc-800/40", border: "border-zinc-800" };
                    return (
                      <motion.div
                        key={evt.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-900 hover:border-zinc-800/80 p-5 sm:p-6 rounded-3xl transition-all duration-300 relative group flex flex-col md:flex-row gap-6 shadow-md"
                      >
                        {/* Event Left Date Block */}
                        <div className="flex md:flex-col items-center justify-between md:justify-center md:w-24 px-4 py-3 bg-zinc-900/60 rounded-2xl border border-zinc-800/50 h-fit text-center">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                            {evt.date ? new Date(evt.date).toLocaleDateString('en-US', { month: 'short' }) : ''}
                          </span>
                          <span className="text-3xl font-serif text-white font-bold md:my-1">
                            {evt.date ? evt.date.split('-')[2] : ''}
                          </span>
                          <span className="text-[10px] uppercase font-medium tracking-wide text-zinc-400">
                            {evt.date ? new Date(evt.date).toLocaleDateString('en-US', { weekday: 'short' }) : ''}
                          </span>
                        </div>

                        {/* Event Content Block */}
                        <div className="flex-1 text-left flex flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2.5">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                                {evt.category}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                                <Clock size={11} className="text-zinc-600" /> {evt.time}
                              </span>
                            </div>
                            
                            <h4 className="text-lg font-serif text-white font-medium group-hover:text-amber-400 transition-colors mb-2">
                              {evt.title}
                            </h4>
                            <p className="text-zinc-400 text-xs leading-relaxed mb-4">
                              {evt.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-zinc-900/80 pt-4 mt-auto">
                            <span className="text-[10px] text-zinc-500 flex items-center gap-1.5 truncate">
                              <MapPin size={12} className="text-zinc-600 shrink-0" /> {evt.location}
                            </span>
                            
                            {isAdmin && (
                              <div className="flex items-center gap-2 shrink-0 ml-3">
                                <button
                                  onClick={() => openEditModal(evt)}
                                  className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all"
                                  title="Edit Event"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(evt.id!)}
                                  className="p-2 bg-zinc-900/80 hover:bg-red-900/30 text-zinc-500 hover:text-red-400 rounded-lg transition-all"
                                  title="Delete Event"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Optional Side Banner Image */}
                        {evt.imageUrl && (
                          <div className="hidden sm:block md:w-32 aspect-square md:aspect-auto rounded-2xl overflow-hidden shrink-0 bg-zinc-900 border border-zinc-800">
                            <img 
                              src={evt.imageUrl} 
                              alt={evt.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>

      {/* Events Form Modal (Add / Edit) */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFormModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-amber-400 w-5 h-5 animate-pulse" />
                  <h3 className="text-xl font-serif text-white font-bold">
                    {editingEvent ? 'Edit Gathering' : 'Schedule New Gathering'}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowFormModal(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {formError && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-5">
                
                {/* Title */}
                <div className="text-left">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-1.5">Event Title *</label>
                  <input 
                    type="text" 
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Sunday Revelations Service"
                    className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="text-left">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-1.5">Category *</label>
                    <select 
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-3 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 transition-colors appearance-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div className="text-left">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-1.5">Date *</label>
                    <input 
                      type="date" 
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Time */}
                  <div className="text-left">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-1.5">Time *</label>
                    <input 
                      type="text" 
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      placeholder="e.g. 09:00 AM"
                      className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 transition-colors"
                      required
                    />
                  </div>

                  {/* Location */}
                  <div className="text-left">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-1.5">Location *</label>
                    <input 
                      type="text" 
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="e.g. Main Sanctuary"
                      className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="text-left">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-1.5">Description *</label>
                  <textarea 
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Enter details about this gathering, scripture coordinates, or prayer points..."
                    className="w-full h-24 bg-zinc-900 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                    required
                  />
                </div>

                {/* Optional Image URL */}
                <div className="text-left">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-1.5">Image URL (Optional)</label>
                  <input 
                    type="url" 
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                {/* Submits */}
                <div className="flex gap-3 pt-4 border-t border-zinc-900">
                  <button 
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="flex-1 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold rounded-xl transition-all text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-zinc-950 font-bold rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Saving...' : (editingEvent ? 'Save Changes' : 'Publish Event')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
