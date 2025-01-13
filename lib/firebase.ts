// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAwFM-NiZqEAOt433nHhz8XE8cbf7PgrKg',
  authDomain: 'shoi-24cca.firebaseapp.com',
  projectId: 'shoi-24cca',
  storageBucket: 'shoi-24cca.firebasestorage.app',
  messagingSenderId: '385778620756',
  appId: '1:385778620756:web:bcb8b324f149ed1b2f50c1',
  measurementId: 'G-Y7N0WGPEW6',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Realtime Database instance
const database = getFirestore(app);

export default database;
