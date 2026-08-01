// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  auth,
  db,
  googleProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  doc,
  getDoc,
  setDoc,
  isAdminEmail,
} from "../firebase/config";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function mapAuthError(error) {
  const code = error?.code || "";
  const messages = {
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid email or password. Please try again.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/popup-closed-by-user": "Sign-in popup was closed before completing.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };
  return (
    messages[code] || error?.message || "Something went wrong. Please try again."
  );
}

async function ensureUserDocument(user, extra = {}) {
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return userDoc.data();
  }

  const newUserData = {
    uid: user.uid,
    email: user.email,
    displayName:
      extra.displayName ||
      user.displayName ||
      user.email?.split("@")[0] ||
      "Customer",
    createdAt: new Date().toISOString(),
    // Firestore data is never used as the source of admin authority. The
    // Firestore rules and isAdmin below use the signed-in Firebase Auth email.
    role: "user",
    cart: [],
    orders: [],
    wishlist: [],
    ...extra,
  };

  await setDoc(userRef, newUserData);
  return newUserData;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const data = await ensureUserDocument(user);
          setUserData(data);
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Still allow session if Firestore is blocked; derive admin from email
          setUserData({
            email: user.email,
            role: isAdminEmail(user.email) ? "admin" : "user",
          });
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, displayName) => {
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (displayName?.trim()) {
        await updateProfile(user, { displayName: displayName.trim() });
      }

      const data = await ensureUserDocument(user, {
        displayName: displayName?.trim() || user.email?.split("@")[0],
      });
      setUserData(data);
      return { user, error: null };
    } catch (error) {
      return { user: null, error: mapAuthError(error) };
    }
  };

  const login = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const data = await ensureUserDocument(user);
      setUserData(data);
      return { user, error: null, isAdmin: data?.role === "admin" || isAdminEmail(user.email) };
    } catch (error) {
      return { user: null, error: mapAuthError(error), isAdmin: false };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      const data = await ensureUserDocument(user);
      setUserData(data);
      return {
        user,
        error: null,
        isAdmin: data?.role === "admin" || isAdminEmail(user.email),
      };
    } catch (error) {
      return { user: null, error: mapAuthError(error), isAdmin: false };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error) {
      return { error: mapAuthError(error) };
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error) {
      return { error: mapAuthError(error) };
    }
  };

  const isAdmin = useMemo(() => {
    if (!currentUser) return false;
    return isAdminEmail(currentUser.email);
  }, [currentUser]);

  const value = {
    currentUser,
    userData,
    loading,
    isAdmin,
    setUserData,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="auth-boot-loader" aria-label="Loading">
          <div className="auth-boot-spinner" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
