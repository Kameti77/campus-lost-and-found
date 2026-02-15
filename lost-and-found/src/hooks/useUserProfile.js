import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

// Custom hook that fetches the current user's Firestore profile
// Returns { profile, loading, error }
//
// WHY a hook instead of fetching in each component?
// → Single source of truth — both Navbar and Profile use same data
// → onSnapshot = real-time listener, profile updates instantly everywhere
// → Keeps components clean — no Firestore logic scattered around
//
// HOW to use in any component:
//   const { profile, loading } = useUserProfile();
//   profile.firstName, profile.lastName, profile.displayName, etc.

const useUserProfile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // No user logged in — nothing to fetch
    if (!currentUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // onSnapshot = real-time listener
    // Fires immediately with current data, then again on any change
    // This means if a user updates their name later, it reflects everywhere instantly
    const userDocRef = doc(db, 'users', currentUser.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setProfile(docSnapshot.data());
        } else {
          // Document doesn't exist yet (edge case)
          setProfile(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching user profile:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup: unsubscribe from listener when component unmounts
    return () => unsubscribe();
  }, [currentUser]);

  // Helper: get initials from profile (JD for John Doe)
  const getInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
    }
    if (profile?.firstName) {
      return profile.firstName.charAt(0).toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  return { profile, loading, error, getInitials };
};

export default useUserProfile;