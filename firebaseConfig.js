// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBI7rZSKSRaoGvbD5VyLxAkxHe31UbKnr0",
  authDomain: "thehavenstore.firebaseapp.com",
  projectId: "thehavenstore",
  storageBucket: "thehavenstore.firebasestorage.app",
  messagingSenderId: "811787206836",
  appId: "1:811787206836:web:5a2595bfde6f4f01d017e1",
  measurementId: "G-YPMDSC95XS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
