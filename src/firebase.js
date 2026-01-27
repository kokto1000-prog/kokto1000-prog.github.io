import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyClcGMb3R2bbjb1Dhb41hxJX20dy_W4kdk",
    authDomain: "maksapp-ec5ef.firebaseapp.com",
    projectId: "maksapp-ec5ef",
    storageBucket: "maksapp-ec5ef.firebasestorage.app",
    messagingSenderId: "1097500517413",
    appId: "1:1097500517413:web:dffac6e88a75d90f3b8bcc"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
