import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDOZwIJjuyuux6Z9OQ9x6LBvu3CuxMWfuE",
  authDomain: "quask-a9e1b.firebaseapp.com",
  projectId: "quask-a9e1b",
  storageBucket: "quask-a9e1b.firebasestorage.app",
  messagingSenderId: "726397658400",
  appId: "1:726397658400:web:cac926ec2cbffea890a345",
  measurementId: "G-RT218LJWLP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.firebaseReady = Promise.resolve({ auth, db });

export { auth, db };
