import { initializeApp, getApps } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD0pKWntX64z-68dmO3nWJmwk1Sb3f1iCE',
  authDomain: 'letterplace-c103c.firebaseapp.com',
  projectId: 'letterplace-c103c',
  storageBucket: 'letterplace-c103c.appspot.com',
  messagingSenderId: '658174549550',
  appId: '1:658174549550:web:d3c99b2be934379b6209bf',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// experimentalForceLongPolling avoids gRPC-web transport issues in React Native
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
