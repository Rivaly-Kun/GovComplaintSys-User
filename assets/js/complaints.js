// complaints.js (Realtime DB version)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB2-1bdDytMmVsyl9_MlkDkhEb_UE38vY4",
  authDomain: "carrentalrentswift.firebaseapp.com",
  databaseURL: "https://carrentalrentswift-default-rtdb.asia-southeast1.firebasedatabase.app/", 
  projectId: "carrentalrentswift",
  storageBucket: "carrentalrentswift.appspot.com",
  messagingSenderId: "786783178278",
  appId: "1:786783178278:web:033b557e9591d35aaf20e7",
  measurementId: "G-KPZCMLPFQY"
};

// Initialize Firebase and Database
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
console.log("✅ Firebase and Realtime Database initialized.");

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded.");

  const form = document.getElementById("complaintForm");
  const nameInput = document.getElementById("name");
  const complaintInput = document.getElementById("complaint");

  if (!form || !nameInput || !complaintInput) {
    console.error("❌ Missing form elements. Check your HTML IDs.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("📨 Form submitted");

    const name = nameInput.value.trim() || "Anonymous";
    const complaint = complaintInput.value.trim();

    if (!complaint) {
      alert("⚠️ Please enter your complaint.");
      return;
    }

    try {
      const newComplaintRef = push(ref(db, "complaints"));
      await set(newComplaintRef, {
        name,
        complaint,
        timestamp: Date.now() // Since Realtime DB doesn't have serverTimestamp like Firestore
      });

      alert("✅ Complaint submitted!");
      form.reset();
      console.log("📄 Complaint added to Realtime Database.");
    } catch (err) {
      console.error("❌ Submission error:", err);
      alert("❌ Failed to submit complaint. Check console.");
    }
  });
});
