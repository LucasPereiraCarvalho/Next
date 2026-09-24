// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPyfw1l1AocuI8Lr5tnFnNsRl214LZoRg",
  authDomain: "next-tarefas-curso.firebaseapp.com",
  projectId: "next-tarefas-curso",
  storageBucket: "next-tarefas-curso.firebasestorage.app",
  messagingSenderId: "49857797667",
  appId: "1:49857797667:web:cb5ef74ea2500b904bdb96",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

export { db };

