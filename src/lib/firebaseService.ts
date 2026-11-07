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
  platform: 'youtube' | 'vimeo';
  title?: string;
  hideChat?: boolean;
  defaultVideoId?: string; // YouTube video ID or link for existing replay when off-air
  defaultVideoTitle?: string;
}

export interface LiveChatMessage {
  id?: string;
  senderName: string;
  message: string;
  createdAt: string;
  role?: 'member' | 'pastor' | 'admin';
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
}

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
    const q = query(collection(db, path), orderBy('order', 'asc'));
    return onSnapshot(q, (snap) => {
      const sections = snap.docs.map(d => ({ id: d.id, ...d.data() } as PageSection));
      callback(sections);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async upsertSection(section: PageSection) {
    const path = `sections/${section.sectionId}`;
    try {
      await setDoc(doc(db, 'sections', section.sectionId), section);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteSection(sectionId: string) {
    const path = `sections/${sectionId}`;
    try {
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
    return onSnapshot(doc(db, path), (snap) => {
      callback(snap.exists() ? snap.data() as LiveStream : null);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  async updateStream(stream: LiveStream) {
    const path = 'settings/stream';
    try {
      await setDoc(doc(db, path), stream);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async setLiveStatus(isLive: boolean) {
    const path = 'settings/stream';
    try {
      const snap = await getDoc(doc(db, path));
      if (snap.exists()) {
        const existing = snap.data() as LiveStream;
        await setDoc(doc(db, path), {
          ...existing,
          isLive
        });
      } else {
        await setDoc(doc(db, path), {
          isLive,
          streamId: '',
          platform: 'youtube',
          title: 'Photizo Porch Divine Service'
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Real-Time Live Stream Chat
  subscribeLiveChat(callback: (messages: LiveChatMessage[]) => void) {
    const path = 'liveChatMessages';
    const q = query(collection(db, path), orderBy('createdAt', 'asc'), limit(150));
    return onSnapshot(q, (snap) => {
      const messages = snap.docs.map(d => ({ id: d.id, ...d.data() } as LiveChatMessage));
      callback(messages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
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

  async deleteLiveChatMessage(messageId: string) {
    const path = `liveChatMessages/${messageId}`;
    try {
      await deleteDoc(doc(db, 'liveChatMessages', messageId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Events
  subscribeEvents(callback: (events: ChurchEvent[]) => void) {
    const path = 'events';
    const q = query(collection(db, path), orderBy('date', 'asc'));
    return onSnapshot(q, (snap) => {
      const events = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChurchEvent));
      callback(events);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async upsertEvent(event: ChurchEvent) {
    const eventId = event.id || `${Date.now()}`;
    const path = `events/${eventId}`;
    const { id, ...data } = event;
    try {
      await setDoc(doc(db, 'events', eventId), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteEvent(eventId: string) {
    const path = `events/${eventId}`;
    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Sermons / Podcasts
  subscribeSermons(callback: (sermons: Sermon[]) => void) {
    const path = 'sermons';
    const q = query(collection(db, path), orderBy('date', 'desc')); // Newer sermons first
    return onSnapshot(q, (snap) => {
      const sermons = snap.docs.map(d => ({ id: d.id, ...d.data() } as Sermon));
      callback(sermons);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async upsertSermon(sermon: Sermon) {
    const sermonId = sermon.id || `${Date.now()}`;
    const path = `sermons/${sermonId}`;
    const { id, ...data } = sermon;
    try {
      await setDoc(doc(db, 'sermons', sermonId), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteSermon(sermonId: string) {
    const path = `sermons/${sermonId}`;
    try {
      await deleteDoc(doc(db, 'sermons', sermonId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Excerpts & Gallery
  subscribeExcerpts(callback: (excerpts: Excerpt[]) => void) {
    const path = 'excerpts';
    const q = query(collection(db, path));
    return onSnapshot(q, (snap) => {
      const excerpts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Excerpt));
      callback(excerpts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async upsertExcerpt(excerpt: Excerpt) {
    const excerptId = excerpt.id || `${Date.now()}`;
    const path = `excerpts/${excerptId}`;
    const { id, ...data } = excerpt;
    try {
      await setDoc(doc(db, 'excerpts', excerptId), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteExcerpt(excerptId: string) {
    const path = `excerpts/${excerptId}`;
    try {
      await deleteDoc(doc(db, 'excerpts', excerptId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Blog Posts
  subscribeBlogPosts(callback: (posts: BlogPost[]) => void) {
    const path = 'blogPosts';
    const q = query(collection(db, path), orderBy('date', 'desc'));
    return onSnapshot(q, (snap) => {
      const posts = snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
      callback(posts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async upsertBlogPost(post: BlogPost) {
    const postId = post.id || `${Date.now()}`;
    const path = `blogPosts/${postId}`;
    const { id, ...data } = post;
    
    // Filter out undefined properties to prevent Firestore setDoc failures
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    try {
      await setDoc(doc(db, 'blogPosts', postId), cleanData);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteBlogPost(postId: string) {
    const path = `blogPosts/${postId}`;
    try {
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
  }
};
