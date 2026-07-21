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
  orderBy
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
  }
};
