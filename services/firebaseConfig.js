import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB4rkB5NRsO4RGOtWCfUjyugKVEpa3xsCg",
  authDomain: "travelmateexpoapp.firebaseapp.com",
  databaseURL: "https://travelmateexpoapp-default-rtdb.firebaseio.com",
  projectId: "travelmateexpoapp",
  storageBucket: "travelmateexpoapp.firebasestorage.app",
  messagingSenderId: "388384578237",
  appId: "1:388384578237:web:bfac0ab7587c20be6c35d4",
  measurementId: "G-YWJS872BVQ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
