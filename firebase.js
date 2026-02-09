// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7JEJgCv8s8r3OM18puSLAqA4-W7vmE5Y",
  authDomain: "mr-driver-admin.firebaseapp.com",
  projectId: "mr-driver-admin",
  storageBucket: "mr-driver-admin.firebasestorage.app",
  messagingSenderId: "841436137028",
  appId: "1:841436137028:web:70f7a49e4d024682b7de11"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
