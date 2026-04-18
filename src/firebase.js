// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAusDhCC33A5Qf8NrCW_2QWEqG4s7zUn5Q",
  authDomain: "ethicly-123.firebaseapp.com",
  projectId: "ethicly-123",
  storageBucket: "ethicly-123.firebasestorage.app",
  messagingSenderId: "113177736107",
  appId: "1:113177736107:web:8ee7f7fdd6b8ad751a58ee",
  measurementId: "G-1XD9M98CQJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
