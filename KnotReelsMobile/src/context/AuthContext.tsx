// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import LogoLoader from '../../components/LogoLoader';

interface ExtendedUser extends FirebaseUser {
  username: string;
  avatar: string;
  role:    string;
  tips:    number;
  boosts:  number;
  bio:     string;
}

interface AuthContextType {
  user:    ExtendedUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]     = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userRef = doc(db, 'users', fbUser.uid);
        const snap    = await getDoc(userRef);

        let profileData;
        if (!snap.exists()) {
          // No user doc yet → create one with defaults
          profileData = {
            username:  `user_${fbUser.uid.slice(-6)}`,
            avatar:    '/default-avatar.png',
            role:      'Creator',
            tips:      0,
            boosts:    0,
            bio:       '',
            createdAt: serverTimestamp()
          };
          await setDoc(userRef, profileData);
        } else {
          profileData = snap.data();
        }

        // Merge FirebaseUser + our profileData
        setUser({
          ...fbUser,
          username: profileData.username,
          avatar:   profileData.avatar,
          role:     profileData.role,
          tips:     profileData.tips,
          boosts:   profileData.boosts,
          bio:      profileData.bio,
        } as ExtendedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LogoLoader />;
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
