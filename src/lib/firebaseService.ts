import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebase';

export interface SiteSettings {
  ministryName: string;
  prophetName: string;
  pastorName: string;
  whatsapp: string;
  email: string;
}

export interface PageSection {
  id?: string;
  sectionId: string;
  title: string;
  subtitle?: string;
  content: string;
  order: number;
  imageUrl?: string;
}

export interface GivingSettings {
  options: string[];
}

export interface PrayerRequest {
  id?: string;
  name?: string;
  request: string;
  isAnonymous: boolean;
  timestamp: string;
  status: 'pending' | 'prayed' | 'archived';
}

export interface LiveStream {
  isLive: boolean;
  streamId: string;
  platform: 'youtube' | 'facebook' | 'vimeo';
  title?: string;
  hideChat?: boolean;
  defaultVideoId?: string; // YouTube video ID or link for existing replay when off-air
  defaultVideoTitle?: string;
  facebookUrl?: string; // Facebook Live URL or video embed
}

export interface LiveChatMessage {
  id?: string;
  senderName: string;
  message: string;
  createdAt: string;
  role?: 'member' | 'pastor' | 'admin';
  senderId?: string;
  updatedAt?: string;
  isEdited?: boolean;
  replyToId?: string;
  replyToSender?: string;
  replyToText?: string;
  reactions?: Record<string, string[]>; // emoji -> array of senderIds
}

export interface ChurchEvent {
  id?: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  category: string;
  imageUrl?: string;
}

export interface Sermon {
  id?: string;
  title: string;
  speaker: string;
  date: string; // YYYY-MM-DD
  audioUrl: string;
  description: string;
  category: string;
  duration?: string;
  videoUrl?: string; // Optional YouTube video or playlist link
}

export interface SermonVideo {
  id?: string;
  title: string;
  speaker: string;
  category: string;
  date?: string;
  description: string;
  duration?: string;
  videoOrPlaylistId: string; // Extracted YouTube video ID or playlist ID
  youtubeUrl?: string; // Full URL or user input
  isPlaylist?: boolean;
  order?: number;
  createdAt?: string;
}

export const INITIAL_SERMON_VIDEOS: Omit<SermonVideo, 'id'>[] = [
  {
    title: "Prophetic Clinic & Supernatural Impartation",
    category: "Prophetic Altar",
    speaker: "Prophet Japhet Tsukwas",
    date: "Service Replay",
    description: "Deep prophetic ministration, healing declarations, and opening of spiritual eyes for divine breakthroughs.",
    duration: "1:45:20",
    videoOrPlaylistId: "gYjT55c-k_A",
    youtubeUrl: "https://www.youtube.com/watch?v=gYjT55c-k_A",
    isPlaylist: false,
    order: 1
  },
  {
    title: "Hour of Divine Worship & Apostolic Glory",
    category: "Worship Atmosphere",
    speaker: "Photizo Assembly",
    date: "Worship Session",
    description: "Intense worship, apostolic prayers, and glorious presence of God at the Photizo Porch altar.",
    duration: "58:40",
    videoOrPlaylistId: "3JZ_D3ELwOQ",
    youtubeUrl: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ",
    isPlaylist: false,
    order: 2
  },
  {
    title: "The Mystery of Spiritual Discernment & Kingdom Culture",
    category: "Prophetic Word",
    speaker: "Prophet Japhet Tsukwas",
    date: "Midweek Encounter",
    description: "Understanding the spiritual senses, navigating life's choices with divine discernment, and staying aligned with the Spirit.",
    duration: "1:12:15",
    videoOrPlaylistId: "tgbNymZ7vqY",
    youtubeUrl: "https://www.youtube.com/watch?v=tgbNymZ7vqY",
    isPlaylist: false,
    order: 3
  },
  {
    title: "Communion of Power, Light & Healing Altar",
    category: "Divine Encounters",
    speaker: "Prophet Japhet Tsukwas",
    date: "Communion Service",
    description: "Releasing the supernatural life through the blood and body of Christ with testimonies of divine deliverance.",
    duration: "1:30:10",
    videoOrPlaylistId: "fJ9rUzIMcZQ",
    youtubeUrl: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
    isPlaylist: false,
    order: 4
  },
  {
    title: "Prophetic Declarations for Supernatural Advancement",
    category: "Prophetic Altar",
    speaker: "Prophet Japhet Tsukwas",
    date: "Prophetic Watch",
    description: "Apostolic decrees and prophetic blessings unlocking doors of elevation, peace, and spiritual authority.",
    duration: "48:30",
    videoOrPlaylistId: "kJQP7kiw5Fk",
    youtubeUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    isPlaylist: false,
    order: 5
  }
];

export interface Excerpt {
  id?: string;
  text: string;
  source: string;
  imageUrl: string;
  category?: string;
}

export interface BlogPost {
  id?: string;
  title: string;
  content: string;
  author: string;
  date: string; // YYYY-MM-DD
  imageUrl?: string;
  category?: string;
  summary?: string;
}

export interface Testimonial {
  id?: string;
  name: string;
  title: string;
  story: string;
  category: string;
  date: string; // YYYY-MM-DD
  location?: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export const INITIAL_TESTIMONIALS: Omit<Testimonial, 'id'>[] = [
  {
    name: "Sister Deborah O.",
    title: "Instant Healing from 4-Year Chronic Spine Affliction",
    story: "During the prophetic ministration with Prophet Japhet, a word of knowledge went forth concerning severe nerve pain in the spine. At that precise moment, fire surged through my back and the debilitating agony vanished completely! Doctors later verified full anatomical restoration. Praise the Lord of Photizo Porch!",
    category: "Healing & Restoration",
    date: "2026-03-24",
    location: "Abuja, Nigeria",
    status: "approved",
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString()
  },
  {
    name: "Brother Emmanuel T.",
    title: "Supernatural Business Contract & Complete Debt Liquidation",
    story: "We were facing severe legal foreclosure and financial dead-ends. Pastor Japhet prayed and declared a season of unprecedented light over my business. Within two weeks, a multinational entity reached out out of nowhere, approving a multi-million supply contract that wiped away all debt in a single day!",
    category: "Financial Breakthrough",
    date: "2026-04-02",
    location: "Lagos, Nigeria",
    status: "approved",
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
  },
  {
    name: "Sister Grace & Bro Michael M.",
    title: "Miracle Conception After 6 Years of Medical Impossibility",
    story: "Specialists in the UK told us conception was biologically impossible due to extensive scarring. We held on to the prophetic mantle at Photizo Porch, faithfully standing in prayer. Today, we hold our healthy baby boy, Elijah! What God cannot do does not exist.",
    category: "Divine Fruitfulness",
    date: "2026-04-18",
    location: "London, UK",
    status: "approved",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    name: "Minister David K.",
    title: "Supernatural Deliverance & Prophetic Calling Activated",
    story: "I had wrestled with recurring night oppression and heavy depression for years. Stepping into the atmosphere of worship at Photizo Porch broke the shackles instantly. A deep mantle of peace and prophetic clarity fell upon me, and my family has entered total liberty.",
    category: "Spiritual Deliverance",
    date: "2026-04-28",
    location: "Makurdi, Benue",
    status: "approved",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

// --- AUTHENTIC MINISTRY DEFAULT DATASETS (INSTANT 0MS FIRST PAINT) ---

export const DEFAULT_AUTHENTIC_EXCERPTS: Excerpt[] = [
  {
    text: "Hour of Divine Worship",
    source: "Photizo Assembly",
    category: "Worship Atmosphere",
    imageUrl: "/user_uploads/upload_0_Hour_of_worship.webp"
  },
  {
    text: "Deep Fellowship in His Presence",
    source: "Photizo Assembly",
    category: "Worship Atmosphere",
    imageUrl: "/user_uploads/upload_1_Hour_of_worship.webp"
  },
  {
    text: "Prayers of Intercession & Power",
    source: "Prophet Japhet Tsukwas",
    category: "Prophetic Altar",
    imageUrl: "/user_uploads/upload_2_Prayers___.webp"
  },
  {
    text: "Atmosphere of Intense Praise & Honor",
    source: "Photizo Assembly",
    category: "Worship Atmosphere",
    imageUrl: "/user_uploads/upload_3_Worship.webp"
  },
  {
    text: "Worship in the Beauty of Holiness",
    source: "Photizo Assembly",
    category: "Worship Atmosphere",
    imageUrl: "/user_uploads/upload_4_Worship.webp"
  },
  {
    text: "Lifting Holy Hands in Adoration",
    source: "Photizo Assembly",
    category: "Worship Atmosphere",
    imageUrl: "/user_uploads/upload_5_Worship.webp"
  },
  {
    text: "Engrossed in the Glory of His Presence",
    source: "Prophet Japhet Tsukwas",
    category: "Prophetic Word",
    imageUrl: "/user_uploads/upload_6_Engrossed_in_worship.webp"
  },
  {
    text: "Apostolic Impartation & Prayers",
    source: "Prophet Japhet Tsukwas",
    category: "Prophetic Altar",
    imageUrl: "/user_uploads/upload_7_Hour_of_worship.webp"
  },
  {
    text: "Supernatural Encounters at the Altar",
    source: "Prophet Japhet Tsukwas",
    category: "Prophetic Altar",
    imageUrl: "/user_uploads/upload_8_Hour_of_worship.webp"
  },
  {
    text: "Humanitarian Outreach & Welfare Service",
    source: "Photizo Outreach Team",
    category: "Love in Action",
    imageUrl: "/user_uploads/upload_9_Humanitarian_service.webp"
  },
  {
    text: "Hands of Honor: Serving Our Community",
    source: "Photizo Outreach Team",
    category: "Love in Action",
    imageUrl: "/user_uploads/upload_10_Humanitarian_service.webp"
  },
  {
    text: "Empowering Families with Essential Care",
    source: "Photizo Outreach Team",
    category: "Love in Action",
    imageUrl: "/user_uploads/upload_11_Humanitarian_service.webp"
  },
  {
    text: "Joyful Giving & Practical Kingdom Love",
    source: "Photizo Outreach Team",
    category: "Love in Action",
    imageUrl: "/user_uploads/upload_12_Humanitarian_service.webp"
  },
  {
    text: "Compassion in Action: Reaching the Needy",
    source: "Photizo Outreach Team",
    category: "Love in Action",
    imageUrl: "/user_uploads/upload_13_Humanitarian_service.webp"
  },
  {
    text: "Spreading Christ's Love to All People",
    source: "Photizo Outreach Team",
    category: "Love in Action",
    imageUrl: "/user_uploads/upload_14_Humanitarian_service.webp"
  },
  {
    text: "Ministering to the Widows & Vulnerable",
    source: "Photizo Outreach Team",
    category: "Love in Action",
    imageUrl: "/user_uploads/upload_15_Humanitarian_service.webp"
  },
  {
    text: "Extending the Light of Hope Everywhere",
    source: "Photizo Outreach Team",
    category: "Love in Action",
    imageUrl: "/user_uploads/upload_16_Humanitarian_service.webp"
  }
];

export const DEFAULT_STREAM: LiveStream = {
  isLive: false,
  streamId: 'gYjT55c-k_A',
  platform: 'youtube',
  title: 'Photizo Porch Divine Service Broadcast',
  hideChat: false,
  defaultVideoId: 'gYjT55c-k_A',
  defaultVideoTitle: 'Hour of Divine Worship & Apostolic Glory',
  facebookUrl: 'https://www.facebook.com/share/1BagLykc5j/'
};

export const DEFAULT_SECTIONS: PageSection[] = [
  { 
    sectionId: 'hero', 
    title: "Redefining the destinies of men through His Glorious Light", 
    subtitle: "An oasis of revelation led by Prophet Japhet Tsukwas and Mrs. Regina Japheth.",
    content: "Through your giving, we are able to reach the world with the message of illumination and excellence. Your seed is a testimony of your faith.",
    order: 0,
    imageUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=75&w=1280&auto=format&fit=crop"
  },
  {
    sectionId: 'about',
    title: 'Our Divine Mandate',
    subtitle: 'Enlightening hearts with the knowledge of God\'s glory.',
    content: "Photizo Porch Christian Assembly is more than a church; it is a portal of divine illumination. Our name, derived from the Greek 'Photizo,' signifies our sacred mandate to enlighten hearts and manifest kingdom excellence.\n\nUnder the leadership of Prophet Japeth Tsukwas, we are building a global community dedicated to supernatural manifestations and purposeful living.",
    order: 1,
    imageUrl: "/user_uploads/upload_6_Engrossed_in_worship.webp"
  }
];

export const DEFAULT_CHURCH_EVENTS: ChurchEvent[] = [
  {
    id: "evt_1",
    title: "Sunday Illumination Service",
    category: "Sunday Service",
    date: "2026-07-05",
    time: "09:00 AM WAT",
    location: "Main Sanctuary, Photizo Porch Christian Assembly",
    description: "Atmosphere of divine praise, prophetic declarations, and deeper revelation in the word led by Prophet Japhet Tsukwas.",
    imageUrl: "/user_uploads/upload_0_Hour_of_worship.webp"
  },
  {
    id: "evt_2",
    title: "Midweek Prophetic Communion Service",
    category: "Communion Service",
    date: "2026-07-08",
    time: "05:00 PM WAT",
    location: "Main Sanctuary & Online Broadcast",
    description: "Partaking in the mystery of the communion table with healing, divine restoration, and prophetic impartation.",
    imageUrl: "/user_uploads/upload_2_Prayers___.webp"
  },
  {
    id: "evt_3",
    title: "Night of Apostolic Glory & Wonders",
    category: "Miracle & Healing",
    date: "2026-07-17",
    time: "10:00 PM WAT",
    location: "Sanctuary Auditorium",
    description: "An extraordinary night vigil of unhindered prayer, prophetic ministry, and supernatural manifestations.",
    imageUrl: "/user_uploads/upload_3_Worship.webp"
  }
];

export const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: "post_1",
    title: "Walking in the Illumination of the Spirit",
    author: "Prophet Japhet Tsukwas",
    date: "2026-07-01",
    category: "Devotional",
    summary: "Discover how spiritual understanding dispels darkness and anchors your steps in perpetual victory.",
    content: "The entrance of Thy words giveth light; it giveth understanding unto the simple (Psalm 119:130).\n\nWhen light dawns upon your spirit, struggle terminates. Illumination is not merely intellectual comprehension; it is the spiritual reality where God's truth becomes your operating frequency. As sons and daughters of light, we are called to shine brighter and brighter unto the perfect day.",
    imageUrl: "/user_uploads/upload_0_Hour_of_worship.webp"
  },
  {
    id: "post_2",
    title: "The Power of Prophetic Intercession",
    author: "Prophet Japhet Tsukwas",
    date: "2026-06-24",
    category: "Prophetic Word",
    summary: "Birthing destinies on the altar of fervent, Spirit-led prayer and apostolic decrees.",
    content: "True prophetic prayer does not beg; it aligns heaven's decrees with earthly realities. When we intercede under the unction of the Holy Ghost, barriers crumble and gates of iron are broken in sunder.\n\nLearn to build a persistent altar where revelation translates into visible victories for your family, ministry, and generation.",
    imageUrl: "/user_uploads/upload_2_Prayers___.webp"
  },
  {
    id: "post_3",
    title: "Manifesting Kingdom Excellence in Every Sphere",
    author: "Mrs. Regina Japheth",
    date: "2026-06-18",
    category: "Teaching",
    summary: "Cultivating honor, integrity, and divine excellence in your everyday calling and community impact.",
    content: "Excellence is not an option for believers; it is our royal nature. When the Queen of Sheba observed the order and excellence in Solomon's court, there was no more spirit left in her.\n\nWhatever your hands find to do, execute it with supernatural skill and Christ-like grace that glorifies our Father.",
    imageUrl: "/user_uploads/upload_9_Humanitarian_service.webp"
  }
];

export const DEFAULT_SERMONS: Sermon[] = [
  {
    id: "sermon_1",
    title: "Establishing Your Prophetic Season",
    speaker: "Prophet Japhet Tsukwas",
    date: "2026-06-28",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    category: "Prophetic Word",
    description: "An atmospheric message detailing how to identify, align, and cooperatively run with the prophetic instructions of God for your current season.",
    duration: "12:34"
  },
  {
    id: "sermon_2",
    title: "The Supernatural Dimension of Faith",
    speaker: "Prophet Japhet Tsukwas",
    date: "2026-06-21",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    category: "Teaching",
    description: "Understanding the exact laws of divine faith, supernatural confessions, and stepping beyond intellectual limits to tap into the divine treasury.",
    duration: "07:05"
  },
  {
    id: "sermon_3",
    title: "Walking in Divine Authority & Dominion",
    speaker: "Prophet Japhet Tsukwas",
    date: "2026-06-14",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    category: "Sunday Message",
    description: "Exercising your spiritual rights in Christ Jesus and enforcing victory over every contrary circumstance.",
    duration: "15:20"
  }
];

// Local cache helper to ensure 0ms instantaneous initial render
function getLocalCache<T>(key: string, fallback: T): T {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('photizo_' + key);
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return fallback;
}

function setLocalCache(key: string, data: any) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('photizo_' + key, JSON.stringify(data));
    }
  } catch {}
}

export const firebaseService = {
  // Site Settings
  async getSiteSettings(): Promise<SiteSettings | null> {
    const path = 'settings/global';
    try {
      const snap = await getDoc(doc(db, path));
      return snap.exists() ? snap.data() as SiteSettings : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async updateSiteSettings(settings: SiteSettings) {
    const path = 'settings/global';
    try {
      await setDoc(doc(db, path), settings);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Sections
  subscribeSections(callback: (sections: PageSection[]) => void) {
    const path = 'sections';
    callback(getLocalCache('sections', DEFAULT_SECTIONS));

    try {
      const q = query(collection(db, path), orderBy('order', 'asc'));
      return onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const sections = snap.docs.map(d => ({ id: d.id, ...d.data() } as PageSection));
          setLocalCache('sections', sections);
          callback(sections);
        } else {
          callback(DEFAULT_SECTIONS);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
    } catch {
      return () => {};
    }
  },

  async upsertSection(section: PageSection) {
    const path = `sections/${section.sectionId}`;
    try {
      const current = getLocalCache('sections', DEFAULT_SECTIONS);
      const updated = current.some(s => s.sectionId === section.sectionId)
        ? current.map(s => s.sectionId === section.sectionId ? section : s)
        : [...current, section];
      setLocalCache('sections', updated);

      await setDoc(doc(db, 'sections', section.sectionId), section);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteSection(sectionId: string) {
    const path = `sections/${sectionId}`;
    try {
      const current = getLocalCache('sections', DEFAULT_SECTIONS);
      setLocalCache('sections', current.filter(s => s.sectionId !== sectionId));
      await deleteDoc(doc(db, 'sections', sectionId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Giving
  async getGivingSettings(): Promise<GivingSettings | null> {
    const path = 'settings/giving';
    try {
      const snap = await getDoc(doc(db, path));
      return snap.exists() ? snap.data() as GivingSettings : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async updateGivingSettings(settings: GivingSettings) {
    const path = 'settings/giving';
    try {
      await setDoc(doc(db, path), settings);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Prayer Requests
  async submitPrayerRequest(req: Omit<PrayerRequest, 'id'>) {
    const path = `prayerRequests/${Date.now()}`;
    try {
      await setDoc(doc(db, 'prayerRequests', `${Date.now()}`), req);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  subscribePrayerRequests(callback: (requests: PrayerRequest[]) => void) {
    const path = 'prayerRequests';
    const q = query(collection(db, path), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snap) => {
      const requests = snap.docs.map(d => ({ id: d.id, ...d.data() } as PrayerRequest));
      callback(requests);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async updatePrayerStatus(id: string, status: PrayerRequest['status']) {
    const path = `prayerRequests/${id}`;
    try {
      await updateDoc(doc(db, 'prayerRequests', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Live Stream
  subscribeStream(callback: (stream: LiveStream | null) => void) {
    const path = 'settings/stream';
    callback(getLocalCache('stream', DEFAULT_STREAM));

    try {
      return onSnapshot(doc(db, path), (snap) => {
        if (snap.exists()) {
          const data = snap.data() as LiveStream;
          setLocalCache('stream', data);
          callback(data);
        } else {
          callback(DEFAULT_STREAM);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      });
    } catch {
      return () => {};
    }
  },

  async updateStream(stream: LiveStream) {
    const path = 'settings/stream';
    try {
      setLocalCache('stream', stream);
      await setDoc(doc(db, path), stream);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async setLiveStatus(isLive: boolean) {
    const path = 'settings/stream';
    try {
      const current = getLocalCache('stream', DEFAULT_STREAM);
      const updated = { ...current, isLive };
      setLocalCache('stream', updated);

      const snap = await getDoc(doc(db, path));
      if (snap.exists()) {
        const existing = snap.data() as LiveStream;
        await setDoc(doc(db, path), {
          ...existing,
          isLive
        });
      } else {
        await setDoc(doc(db, path), updated);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Real-Time Live Stream Chat (Sustained strictly for 24 hours, auto-deleting older messages)
  subscribeLiveChat(callback: (messages: LiveChatMessage[]) => void) {
    const path = 'liveChatMessages';
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
    
    // Provide cached messages from last 24h
    const cached = getLocalCache<LiveChatMessage[]>('liveChatMessages', []);
    const initialCutoff = Date.now() - TWENTY_FOUR_HOURS_MS;
    const initialFiltered = cached.filter(m => {
      const t = new Date(m.createdAt).getTime();
      return !isNaN(t) && t >= initialCutoff;
    });
    callback(initialFiltered);

    try {
      const q = query(collection(db, path), orderBy('createdAt', 'asc'), limit(250));
      return onSnapshot(q, (snap) => {
        const now = Date.now();
        const cutoff = now - TWENTY_FOUR_HOURS_MS;
        const validMessages: LiveChatMessage[] = [];
        const expiredDocIds: string[] = [];

        snap.docs.forEach(d => {
          const data = d.data() as LiveChatMessage;
          const msgTime = new Date(data.createdAt).getTime();
          if (!isNaN(msgTime) && msgTime < cutoff) {
            expiredDocIds.push(d.id);
          } else {
            validMessages.push({ id: d.id, ...data });
          }
        });

        // Background auto-delete: purge all messages older than 24 hours from Firestore
        if (expiredDocIds.length > 0) {
          expiredDocIds.forEach(id => {
            deleteDoc(doc(db, 'liveChatMessages', id)).catch(() => {});
          });
        }

        setLocalCache('liveChatMessages', validMessages);
        callback(validMessages);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
    } catch {
      return () => {};
    }
  },

  async sendLiveChatMessage(msg: Omit<LiveChatMessage, 'id'>) {
    const messageId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const path = `liveChatMessages/${messageId}`;
    try {
      await setDoc(doc(db, 'liveChatMessages', messageId), msg);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async editLiveChatMessage(messageId: string, newMessage: string) {
    const path = `liveChatMessages/${messageId}`;
    try {
      const snap = await getDoc(doc(db, 'liveChatMessages', messageId));
      if (snap.exists()) {
        const existing = snap.data() as LiveChatMessage;
        const updated: LiveChatMessage = {
          ...existing,
          message: newMessage.trim(),
          updatedAt: new Date().toISOString(),
          isEdited: true
        };
        await setDoc(doc(db, 'liveChatMessages', messageId), updated);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteLiveChatMessage(messageId: string) {
    const path = `liveChatMessages/${messageId}`;
    try {
      await deleteDoc(doc(db, 'liveChatMessages', messageId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async toggleMessageReaction(messageId: string, emoji: string, senderId: string) {
    const path = `liveChatMessages/${messageId}`;
    try {
      const snap = await getDoc(doc(db, 'liveChatMessages', messageId));
      if (snap.exists()) {
        const existing = snap.data() as LiveChatMessage;
        const reactions: Record<string, string[]> = existing.reactions ? { ...existing.reactions } : {};
        const currentUsers = Array.isArray(reactions[emoji]) ? [...reactions[emoji]] : [];
        const hasReacted = currentUsers.includes(senderId);

        if (hasReacted) {
          const filtered = currentUsers.filter(id => id !== senderId);
          if (filtered.length > 0) {
            reactions[emoji] = filtered;
          } else {
            delete reactions[emoji];
          }
        } else {
          reactions[emoji] = [...currentUsers, senderId];
        }

        const updated: LiveChatMessage = {
          ...existing,
          reactions
        };
        await setDoc(doc(db, 'liveChatMessages', messageId), updated);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Events
  subscribeEvents(callback: (events: ChurchEvent[]) => void) {
    const path = 'events';
    callback(getLocalCache('events', DEFAULT_CHURCH_EVENTS));

    try {
      const q = query(collection(db, path), orderBy('date', 'asc'));
      return onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const events = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChurchEvent));
          setLocalCache('events', events);
          callback(events);
        } else {
          callback(DEFAULT_CHURCH_EVENTS);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
    } catch {
      return () => {};
    }
  },

  async upsertEvent(event: ChurchEvent) {
    const eventId = event.id || `${Date.now()}`;
    const path = `events/${eventId}`;
    const { id, ...data } = event;
    try {
      const current = getLocalCache('events', DEFAULT_CHURCH_EVENTS);
      const updated = current.some(e => e.id === eventId)
        ? current.map(e => e.id === eventId ? event : e)
        : [...current, { ...event, id: eventId }];
      setLocalCache('events', updated);

      await setDoc(doc(db, 'events', eventId), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteEvent(eventId: string) {
    const path = `events/${eventId}`;
    try {
      const current = getLocalCache('events', DEFAULT_CHURCH_EVENTS);
      setLocalCache('events', current.filter(e => e.id !== eventId));
      await deleteDoc(doc(db, 'events', eventId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Sermons / Podcasts
  subscribeSermons(callback: (sermons: Sermon[]) => void) {
    const path = 'sermons';
    callback(getLocalCache('sermons', DEFAULT_SERMONS));

    try {
      const q = query(collection(db, path), orderBy('date', 'desc'));
      return onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const sermons = snap.docs.map(d => ({ id: d.id, ...d.data() } as Sermon));
          setLocalCache('sermons', sermons);
          callback(sermons);
        } else {
          callback(DEFAULT_SERMONS);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
    } catch {
      return () => {};
    }
  },

  async upsertSermon(sermon: Sermon) {
    const sermonId = sermon.id || `${Date.now()}`;
    const path = `sermons/${sermonId}`;
    const { id, ...data } = sermon;
    try {
      const current = getLocalCache('sermons', DEFAULT_SERMONS);
      const updated = current.some(s => s.id === sermonId)
        ? current.map(s => s.id === sermonId ? sermon : s)
        : [...current, { ...sermon, id: sermonId }];
      setLocalCache('sermons', updated);

      await setDoc(doc(db, 'sermons', sermonId), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteSermon(sermonId: string) {
    const path = `sermons/${sermonId}`;
    try {
      const current = getLocalCache('sermons', DEFAULT_SERMONS);
      setLocalCache('sermons', current.filter(s => s.id !== sermonId));
      await deleteDoc(doc(db, 'sermons', sermonId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Excerpts & Gallery
  subscribeExcerpts(callback: (excerpts: Excerpt[]) => void) {
    const path = 'excerpts';
    callback(getLocalCache('excerpts', DEFAULT_AUTHENTIC_EXCERPTS));

    try {
      const q = query(collection(db, path));
      return onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const excerpts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Excerpt));
          setLocalCache('excerpts', excerpts);
          callback(excerpts);
        } else {
          callback(DEFAULT_AUTHENTIC_EXCERPTS);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
    } catch {
      return () => {};
    }
  },

  async upsertExcerpt(excerpt: Excerpt) {
    const excerptId = excerpt.id || `${Date.now()}`;
    const path = `excerpts/${excerptId}`;
    const { id, ...data } = excerpt;
    try {
      const current = getLocalCache('excerpts', DEFAULT_AUTHENTIC_EXCERPTS);
      const updated = current.some(e => e.id === excerptId)
        ? current.map(e => e.id === excerptId ? excerpt : e)
        : [{ ...excerpt, id: excerptId }, ...current];
      setLocalCache('excerpts', updated);

      await setDoc(doc(db, 'excerpts', excerptId), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteExcerpt(excerptId: string) {
    const path = `excerpts/${excerptId}`;
    try {
      const current = getLocalCache('excerpts', DEFAULT_AUTHENTIC_EXCERPTS);
      setLocalCache('excerpts', current.filter(e => e.id !== excerptId));
      await deleteDoc(doc(db, 'excerpts', excerptId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Blog Posts
  subscribeBlogPosts(callback: (posts: BlogPost[]) => void) {
    const path = 'blogPosts';
    callback(getLocalCache('blogPosts', DEFAULT_BLOG_POSTS));

    try {
      const q = query(collection(db, path), orderBy('date', 'desc'));
      return onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const posts = snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
          setLocalCache('blogPosts', posts);
          callback(posts);
        } else {
          callback(DEFAULT_BLOG_POSTS);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
    } catch {
      return () => {};
    }
  },

  async upsertBlogPost(post: BlogPost) {
    const postId = post.id || `${Date.now()}`;
    const path = `blogPosts/${postId}`;
    const { id, ...data } = post;
    
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    try {
      const current = getLocalCache('blogPosts', DEFAULT_BLOG_POSTS);
      const updated = current.some(p => p.id === postId)
        ? current.map(p => p.id === postId ? post : p)
        : [{ ...post, id: postId }, ...current];
      setLocalCache('blogPosts', updated);

      await setDoc(doc(db, 'blogPosts', postId), cleanData);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteBlogPost(postId: string) {
    const path = `blogPosts/${postId}`;
    try {
      const current = getLocalCache('blogPosts', DEFAULT_BLOG_POSTS);
      setLocalCache('blogPosts', current.filter(p => p.id !== postId));
      await deleteDoc(doc(db, 'blogPosts', postId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Testimonials
  subscribeTestimonials(callback: (testimonials: Testimonial[]) => void) {
    const path = 'testimonials';
    const q = query(collection(db, path));
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Testimonial));
      // Sort newest created first
      items.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
      callback(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async submitTestimonial(testimonial: Omit<Testimonial, 'id'>): Promise<string> {
    const testimonialId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const path = `testimonials/${testimonialId}`;
    try {
      const cleanData = Object.fromEntries(
        Object.entries(testimonial).filter(([_, v]) => v !== undefined)
      );
      await setDoc(doc(db, 'testimonials', testimonialId), cleanData);
      return testimonialId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  async updateTestimonialStatus(id: string, status: Testimonial['status']) {
    const path = `testimonials/${id}`;
    try {
      await updateDoc(doc(db, 'testimonials', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async upsertTestimonial(testimonial: Testimonial) {
    const testimonialId = testimonial.id || `test_${Date.now()}`;
    const path = `testimonials/${testimonialId}`;
    const { id, ...data } = testimonial;
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );
      await setDoc(doc(db, 'testimonials', testimonialId), cleanData);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteTestimonial(testimonialId: string) {
    const path = `testimonials/${testimonialId}`;
    try {
      await deleteDoc(doc(db, 'testimonials', testimonialId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async seedInitialTestimonials() {
    try {
      const snap = await getDocs(collection(db, 'testimonials'));
      if (snap.empty) {
        for (const item of INITIAL_TESTIMONIALS) {
          const id = `seed_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          await setDoc(doc(db, 'testimonials', id), item);
        }
      }
    } catch (error) {
      // Non-blocking fallback handled gracefully
      console.warn("Testimonial seeding note:", error);
    }
  },

  // Sermon Existing Videos & Playlists
  subscribeSermonVideos(callback: (videos: SermonVideo[]) => void) {
    const path = 'sermonVideos';
    const q = query(collection(db, path), orderBy('order', 'asc'));
    return onSnapshot(q, (snap) => {
      const videos = snap.docs.map(d => ({ id: d.id, ...d.data() } as SermonVideo));
      callback(videos);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async upsertSermonVideo(video: SermonVideo) {
    const videoId = video.id || `video_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const path = `sermonVideos/${videoId}`;
    const { id, ...data } = video;
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );
      await setDoc(doc(db, 'sermonVideos', videoId), cleanData);
      return videoId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  async deleteSermonVideo(videoId: string) {
    const path = `sermonVideos/${videoId}`;
    try {
      await deleteDoc(doc(db, 'sermonVideos', videoId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      throw error;
    }
  },

  async seedInitialSermonVideos() {
    try {
      const snap = await getDocs(collection(db, 'sermonVideos'));
      if (snap.empty) {
        for (let i = 0; i < INITIAL_SERMON_VIDEOS.length; i++) {
          const item = INITIAL_SERMON_VIDEOS[i];
          const id = `seed_vid_${i + 1}`;
          await setDoc(doc(db, 'sermonVideos', id), {
            ...item,
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.warn("Sermon videos initial seed notice:", error);
    }
  }
};
