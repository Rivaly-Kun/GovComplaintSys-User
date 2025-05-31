// complaint.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";

// ✅ Firebase Configuration
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

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);
console.log("✅ Firebase initialized");

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded");

  const fab = document.getElementById("fab");
  const likeBtn = document.querySelector(".btn-link.text-primary");
  const commentBtn = document.querySelector(".btn-link.text-secondary");
  const reportBtn = document.querySelector(".btn-sm.position-absolute.top-0.end-0");
  const complaintFormContainer = document.getElementById("complaint-form");

  const form = document.getElementById("complaintForm");
  const nameInput = document.getElementById("name");
  const complaintInput = document.getElementById("complaint");

  // 🔒 Auth Check and Modal Trigger
  function checkAuthAndPrompt(event, onSuccess = null) {
    event.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      const modal = new bootstrap.Modal(document.getElementById("authModal"));
      modal.show();
    } else if (onSuccess) {
      onSuccess();
    }
  }

  // 👁️ Toggle complaint form only if authenticated
  if (fab) {
    fab.addEventListener("click", (e) => {
      checkAuthAndPrompt(e, () => {
        if (complaintFormContainer) {
          const visible = complaintFormContainer.style.display !== "none";
          complaintFormContainer.style.display = visible ? "none" : "block";
        }
      });
    });
  }

  // 🚫 Not logged in => show modal
  if (likeBtn) likeBtn.addEventListener("click", checkAuthAndPrompt);
  if (commentBtn) commentBtn.addEventListener("click", checkAuthAndPrompt);
  if (reportBtn) reportBtn.addEventListener("click", checkAuthAndPrompt);

  // 📝 Complaint Submission
  if (form && nameInput && complaintInput) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("📨 Complaint form submitted");

      const name = nameInput.value.trim() || "Anonymous";
      const complaint = complaintInput.value.trim();
      const imageFile = document.getElementById("image").files[0];
      const addToThread = document.getElementById("addToThread").checked;

      if (!complaint) {
        alert("⚠️ Please enter your complaint.");
        return;
      }

      try {
        const complaintRef = push(ref(db, "complaints"));
        const complaintId = complaintRef.key;
        let imageUrl = null;

        // ⬆️ Upload image if exists
        if (imageFile) {
          const imgRef = storageRef(storage, `complaint_images/${complaintId}_${imageFile.name}`);  
          const uploadResult = await uploadBytes(imgRef, imageFile);
          imageUrl = await getDownloadURL(uploadResult.ref);
          console.log("🖼️ Image uploaded:", imageUrl);
        }

        // 📝 Save complaint
        await set(complaintRef, {
          name,
          complaint,
          timestamp: Date.now(),
          imageUrl: imageUrl || null,
          addToThread
        });

        alert("✅ Complaint submitted!");
        form.reset();
        complaintFormContainer.style.display = "none";
      } catch (err) {
        console.error("❌ Failed to submit complaint:", err);
        alert("❌ Could not submit. Check console for error.");
      }
    });
  } else {
    console.warn("⚠️ Complaint form elements missing. Check IDs.");
  }

  // Hide form initially
  if (complaintFormContainer) {
    complaintFormContainer.style.display = "none";
  }
});
