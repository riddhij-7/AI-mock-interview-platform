// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAKPpz8EuXUWis8ESYzp13XyMCw6-dj8jo",
    authDomain: "prepwise-dbb46.firebaseapp.com",
    projectId: "prepwise-dbb46",
    storageBucket: "prepwise-dbb46.firebasestorage.app",
    messagingSenderId: "503130680780",
    appId: "1:503130680780:web:b5bc1bbb90ec76dc908169",
    measurementId: "G-FXDWE9V17L"
};

// Initialize Firebase
const app = !getApps.length? initializeApp(firebaseConfig): getApps();

export const auth = getAuth(app);
export const db = getFirestore(app)