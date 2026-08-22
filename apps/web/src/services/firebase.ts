import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCoQ8wEUNlkiPvGCsBtp_Ph-X_zQBtSmco",
  authDomain: "safespeak-ea004.firebaseapp.com",
  projectId: "safespeak-ea004",
  storageBucket: "safespeak-ea004.firebasestorage.app",
  messagingSenderId: "1008587300754",
  appId: "1:1008587300754:web:37ef003cc5371b741f2b4b",
  measurementId: "G-J1KC58MSRR"
}

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const db = getFirestore(app)
