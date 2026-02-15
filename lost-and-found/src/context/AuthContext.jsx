import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate Full Sail email
  // endsWith catches all subdomains: student.fullsail.edu, faculty.fullsail.edu, etc.
  const isValidSchoolEmail = (email) => {
    return email.endsWith('fullsail.edu') || email.endsWith('fullsail.com');
  };

  // ─── SIGNUP ────────────────────────────────────────────────────────────────
  // Now accepts firstName + lastName in addition to email/password
  const signup = async (email, password, firstName, lastName) => {
    if (!isValidSchoolEmail(email)) {
      throw new Error('Please use a Full Sail University email address (@fullsail.edu or @fullsail.com)');
    }

    try {
      // Step 1: Create the auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 2: Save full name to Firebase Auth displayName
      // This means currentUser.displayName works anywhere without a DB query
      await updateProfile(user, {
        displayName: `${firstName.trim()} ${lastName.trim()}`
      });

      // Step 3: Create user document in Firestore users collection
      // Document ID = user's uid (unique ID from Firebase Auth)
      // This is the standard pattern - fast lookups, no duplicates
      await setDoc(doc(db, 'users', user.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: `${firstName.trim()} ${lastName.trim()}`,
        email: email.toLowerCase(),
        uid: user.uid,
        createdAt: serverTimestamp(), // Firebase server time, not client clock
      });

      // Step 4: Send verification email
      await sendEmailVerification(user);

      return user;
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please login instead.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      }
      throw error;
    }
  };

  // ─── LOGIN ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
      }

      return userCredential.user;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email. Please sign up first.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      }
      throw error;
    }
  };

  // ─── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error('Failed to log out. Please try again.');
    }
  };

  // ─── RESET PASSWORD ────────────────────────────────────────────────────────
  const resetPassword = async (email) => {
    if (!isValidSchoolEmail(email)) {
      throw new Error('Please use a Full Sail University email address');
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email.');
      }
      throw error;
    }
  };

  // ─── RESEND VERIFICATION ───────────────────────────────────────────────────
  const resendVerificationEmail = async () => {
    if (!currentUser) throw new Error('No user logged in');
    try {
      await sendEmailVerification(currentUser);
    } catch (error) {
      throw new Error('Failed to send verification email. Please try again.');
    }
  };

  // ─── AUTH STATE LISTENER ───────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    resendVerificationEmail,
    isValidSchoolEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};