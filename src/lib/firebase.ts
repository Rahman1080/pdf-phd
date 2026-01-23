// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
    getAuth,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged,
    type User
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyCgDY_MLJv5i10oIqvtEbbj8wlLKidXhXA",
    authDomain: "pdf-phd.firebaseapp.com",
    projectId: "pdf-phd",
    storageBucket: "pdf-phd.firebasestorage.app",
    messagingSenderId: "226550784061",
    appId: "1:226550784061:web:8a42ee7a117ca5d4060a54",
    measurementId: "G-QYHP5ENCZF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser)
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Auth Functions
export async function signInWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
    }
    return userCredential;
}

export async function signInWithGoogle() {
    return signInWithPopup(auth, googleProvider);
}

export async function signInWithGithub() {
    return signInWithPopup(auth, githubProvider);
}

export async function logOut() {
    return signOut(auth);
}

export async function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
}

export { onAuthStateChanged, type User };
export { app, analytics };
export default app;
