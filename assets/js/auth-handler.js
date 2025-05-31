// auth-handler.js
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  set,
  push,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// 🔐 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB2-1bdDytMmVsyl9_MlkDkhEb_UE38vY4",
  authDomain: "carrentalrentswift.firebaseapp.com",
  databaseURL: "https://carrentalrentswift-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "carrentalrentswift",
  storageBucket: "carrentalrentswift.appspot.com",
  messagingSenderId: "786783178278",
  appId: "1:786783178278:web:033b557e9591d35aaf20e7",
  measurementId: "G-KPZCMLPFQY"
};

// 🔁 Initialize Firebase once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getDatabase(app);

// ✅ Helper to log to DB
async function logUserAction(uid, action, email) {
  const logRef = push(ref(db, `userLogs/${uid}`));
  await set(logRef, {
    action,
    email,
    timestamp: Date.now()
  });
}

// ✅ Login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await logUserAction(user.uid, "login", email);

      alert("✅ Logged in successfully");
      bootstrap.Modal.getInstance(document.getElementById("authModal")).hide();
    } catch (error) {
      alert("❌ Login failed: " + error.message);
    }
  });
}

// ✅ Register
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user profile
      await set(ref(db, `users/${user.uid}`), {
        email,
        createdAt: Date.now()
      });

      await logUserAction(user.uid, "register", email);

      alert("✅ Registered successfully!");
      bootstrap.Modal.getInstance(document.getElementById("authModal")).hide();
    } catch (error) {
      alert("❌ Registration failed: " + error.message);
    }
  });
}

// ✅ Forgot Password
const forgotForm = document.getElementById("forgotForm");
if (forgotForm) {
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("forgotEmail").value.trim();

    try {
      await sendPasswordResetEmail(auth, email);
      alert("✅ Password reset email sent!");
    } catch (error) {
      alert("❌ Failed to send reset email: " + error.message);
    }
  });
}
