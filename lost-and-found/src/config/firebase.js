// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAl1xwUoTHT2RvNcLgIOKRhMwUxnn7oP-M",
  authDomain: "lostandfound-937c4.firebaseapp.com",
  projectId: "lostandfound-937c4",
  storageBucket: "lostandfound-937c4.firebasestorage.app",
  messagingSenderId: "229158569301",
  appId: "1:229158569301:web:59686ed79da84e139f1bdc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;