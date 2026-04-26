import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBGV74kc3Y04YCabXo-Y6wnV4cdm81m6E4",
  authDomain: "do-it-tracker-001.firebaseapp.com",
  projectId: "do-it-tracker-001",
  storageBucket: "do-it-tracker-001.firebasestorage.app",
  messagingSenderId: "365766282377",
  appId: "1:365766282377:web:032c1982a0eec95b858a58"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);