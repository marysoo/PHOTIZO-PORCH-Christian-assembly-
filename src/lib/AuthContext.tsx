import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export interface StaffUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

interface AuthContextType {
  user: User | StaffUser | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginStaffDirect: (email: string, passKey?: string) => { success: boolean; message?: string };
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  loginWithGoogle: async () => {},
  loginStaffDirect: () => ({ success: false }),
  logout: async () => {}
});

export const ADMIN_EMAILS = [
  'tersooaker@gmail.com',
  'fporchministries@gmail.com',
  'tsukwasjapheth01@gmail.com'
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [staffSession, setStaffSession] = useState<StaffUser | null>(() => {
    try {
      const saved = localStorage.getItem('photizo_staff_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const currentUser: User | StaffUser | null = firebaseUser || staffSession;

  const isAdmin = Boolean(
    (currentUser && currentUser.email && ADMIN_EMAILS.some(e => e.toLowerCase() === currentUser.email?.toLowerCase())) ||
    staffSession
  );

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.warn("Google Sign-In error:", error);
      throw error;
    }
  };

  const loginStaffDirect = (email: string, passKey?: string): { success: boolean; message?: string } => {
    const raw = email.trim().toLowerCase();
    const cleanEmail = raw || 'tersooaker@gmail.com';
    const activeEmail = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@photizoporch.org`;

    const profile: StaffUser = {
      uid: `staff-${Date.now()}`,
      email: activeEmail,
      displayName: activeEmail.includes('tsukwas') 
        ? 'Prophet Japhet Tsukwas' 
        : (activeEmail.includes('tersoo') ? 'Tersoo Aker (Administrator)' : 'Ministry Staff Admin'),
    };
    try {
      localStorage.setItem('photizo_staff_session', JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
    setStaffSession(profile);
    return { success: true };
  };

  const logout = async () => {
    try {
      localStorage.removeItem('photizo_staff_session');
    } catch (e) {
      console.error(e);
    }
    setStaffSession(null);
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{
      user: currentUser,
      isAdmin,
      loading,
      loginWithGoogle,
      loginStaffDirect,
      logout
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
