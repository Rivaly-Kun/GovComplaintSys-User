import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  update,
  push
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";


const firebaseConfig = {
  apiKey: "AIzaSyB2-1bdDytMmVsyl9_MlkDkhEb_UE38vY4",
  authDomain: "carrentalrentswift.firebaseapp.com",
  databaseURL: "https://carrentalrentswift-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "carrentalrentswift",
  storageBucket: "gs://carrentalrentswift.firebasestorage.app",
  messagingSenderId: "786783178278",
  appId: "1:786783178278:web:033b557e9591d35aaf20e7",
  measurementId: "G-KPZCMLPFQY"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const currentUserId = "user123"; // Replace with actual user ID from auth

  // Collapse image toggle
  document.body.addEventListener("shown.bs.collapse", (event) => {
    const toggleBtn = document.querySelector(`[data-bs-target="#${event.target.id}"]`);
    if (toggleBtn) toggleBtn.textContent = "Hide Image";
  });
  document.body.addEventListener("hidden.bs.collapse", (event) => {
    const toggleBtn = document.querySelector(`[data-bs-target="#${event.target.id}"]`);
    if (toggleBtn) toggleBtn.textContent = "Show Image";
  });
