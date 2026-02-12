import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext({});

// Custom hook to use auth context - use this in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate Full Sail email - checks if email ends with fullsail.edu or fullsail.com
  // This catches student.fullsail.edu, faculty.fullsail.edu, etc.
  const isValidSchoolEmail = (email) => {
    return email.endsWith('fullsail.edu') || email.endsWith('fullsail.com');
  };

  // Sign up new user
  const signup = async (email, password) => {
    // Validate email domain BEFORE creating account
    if (!isValidSchoolEmail(email)) {
      throw new Error('Please use a Full Sail University email address (@fullsail.edu or @fullsail.com)');
    }

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Automatically send verification email
      await sendEmailVerification(userCredential.user);
      
      return userCredential.user;
    } catch (error) {
      // Firebase error codes - make them user-friendly
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

  // Sign in existing user
  const login = async (email, password) => {
    try {
      // Set persistence to LOCAL - keeps user logged in even after browser closes
      // This is what makes users stay logged in for weeks/months!
      await setPersistence(auth, browserLocalPersistence);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified - security requirement
      if (!userCredential.user.emailVerified) {
        // Sign them out if not verified
        await signOut(auth);
        throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
      }
      
      return userCredential.user;
    } catch (error) {
      // Firebase error codes
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

  // Sign out user
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error('Failed to log out. Please try again.');
    }
  };

  // Reset password - sends email with reset link
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

  // Resend verification email - if user didn't receive it
  const resendVerificationEmail = async () => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      await sendEmailVerification(currentUser);
    } catch (error) {
      throw new Error('Failed to send verification email. Please try again.');
    }
  };

  // Listen for auth state changes - runs automatically
  // This detects when user logs in/out and updates currentUser
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Stop loading once we know auth state
    });

    // Cleanup listener on unmount
    return unsubscribe;
  }, []);

  // Values available to all components
  const value = {
    currentUser,           // Current logged-in user object (or null)
    loading,              // True while checking auth state
    signup,               // Function to create account
    login,                // Function to log in
    logout,               // Function to log out
    resetPassword,        // Function to reset password
    resendVerificationEmail, // Function to resend verification
    isValidSchoolEmail    // Function to validate email
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};