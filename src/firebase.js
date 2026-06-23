import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDFXziGY_mxg8JyuRa2QOIVRkXwfC_Noak",
  authDomain: "glass-grimoire.firebaseapp.com",
  projectId: "glass-grimoire",
  storageBucket: "glass-grimoire.firebasestorage.app",
  messagingSenderId: "85114039909",
  appId: "1:85114039909:web:759451519982595e63208c",
  measurementId: "G-2FNHPSK1X5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
