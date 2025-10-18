// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { getDatabase, ref, set, get, child, remove } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCy1r8BXbe-W9UBsCrFDFgkHy-j7lYFwYg",
  authDomain: "mmpublicschoolmundeshwar-233a4.firebaseapp.com",
  databaseURL: "https://mmpublicschoolmundeshwar-233a4-default-rtdb.firebaseio.com",
  projectId: "mmpublicschoolmundeshwar-233a4",
  storageBucket: "mmpublicschoolmundeshwar-233a4.firebasestorage.app",
  messagingSenderId: "34014305665",
  appId: "1:34014305665:web:543d0aed6c75d6d8549c80",
  measurementId: "G-XZZ5335QF0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// Make database available globally
window.firebaseDatabase = database;