import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA1ZCZI_sJV62kBSZzrnBMa0ZKGSZR0BLg",
  authDomain: "grandproject-58195.firebaseapp.com",
  projectId: "grandproject-58195",
  storageBucket: "grandproject-58195.firebasestorage.app",
  messagingSenderId: "16277392282",
  appId: "1:16277392282:web:fb557a918f8b945bebc823",
  measurementId: "G-J7NDN9MSTJ"
};

// Initialize Firebase only once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };

