'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import LogoLoader from '@/components/LogoLoader'; // ← import your loader

interface ExtendedUser extends FirebaseUser {
  username?: string;
  avatar?: string;
  role?: string;
  tips?: number;
  boosts?: number;
  bio?: string;
}

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setUser({
              ...firebaseUser,
              username: data.username,
              avatar: data.avatar,
              role: data.role,
              tips: data.tips,
              boosts: data.boosts,
              bio: data.bio || '',
            });
          } else {
            setUser(firebaseUser as ExtendedUser);
          }
        } catch (err) {
          console.error('🔥 Auth merge error:', err);
          setUser(firebaseUser as ExtendedUser);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ← block rendering your app until auth is ready
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <LogoLoader />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
