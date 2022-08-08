// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAByYRpgjWbVlJ2ffugAblbKex9FtYxICc",
  authDomain: "creative-demo-69142.firebaseapp.com",
  databaseURL: "https://creative-demo-69142-default-rtdb.firebaseio.com",
  projectId: "creative-demo-69142",
  storageBucket: "creative-demo-69142.appspot.com",
  messagingSenderId: "892840106001",
  appId: "1:892840106001:web:75e89864643fe4f3f739b0",
  measurementId: "G-ZX8KGNX4M1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
