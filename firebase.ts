// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDE0McrzrJa8EdfmrEkQMRNmnYB76Lzmhw",
  authDomain: "buddyhelp-e830c.firebaseapp.com",
  projectId: "buddyhelp-e830c",
  storageBucket: "buddyhelp-e830c.firebasestorage.app",
  messagingSenderId: "228212965346",
  appId: "1:228212965346:web:e9616f6d820b69a2b443bb",
  measurementId: "G-SZGZY60E3B"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Firestore instance

export { db, collection, addDoc };