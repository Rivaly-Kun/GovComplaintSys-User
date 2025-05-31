import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  onValue,
  set,
  remove
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

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
const auth = getAuth(app);

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

document.addEventListener("DOMContentLoaded", () => {
 function createThreadComplaintHTML(id, { name, complaint, timestamp, imageUrl, likes }, uid) {
  const uniqueId = `image-collapse-${timestamp}`;
  const likeCount = likes ? Object.keys(likes).length : 0;
  const isLiked = likes && likes[uid];

  return `
    <div class="position-relative bg-light p-3 shadow-sm mb-4" style="border-radius: 15px;" data-id="${id}">
<button class="btn btn-sm position-absolute top-0 end-0 text-muted report-btn" title="Report" style="z-index: 1;" data-id="${id}">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
    <path fill="#000" d="M12 17q.425 0 .713-.288T13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17m0-4q.425 0 .713-.288T13 12V8q0-.425-.288-.712T12 7t-.712.288T11 8v4q0 .425.288.713T12 13m-2.925 8q-.4 0-.762-.15t-.638-.425l-4.1-4.1q-.275-.275-.425-.638T3 14.926v-5.85q0-.4.15-.762t.425-.638l4.1-4.1q.275-.275.638-.425T9.075 3h5.85q.4 0 .763.15t.637.425l4.1 4.1q.275.275.425.638t.15.762v5.85q0 .4-.15.763t-.425.637l-4.1 4.1q-.275.275-.638.425t-.762.15z"/>
  </svg>
</button>


      <div class="mb-1">
        <h6 class="mb-0"><strong>${name || "Anonymous"}</strong></h6>
        <small class="text-muted">${formatTimestamp(timestamp)}</small>
      </div>

      <p class="mt-2 mb-3">${complaint}</p>

      ${imageUrl ? `
        <div id="${uniqueId}" class="collapse">
          <img src="${imageUrl}" alt="Complaint Image" class="img-fluid mb-2" style="border-radius: 10px;">
        </div>
        <button class="btn btn-sm btn-outline-primary mt-1 mb-2 toggle-btn" data-bs-toggle="collapse" data-bs-target="#${uniqueId}">
          Show Image
        </button>` : ''}

      <div class="d-flex justify-content-around align-items-center border-top pt-2 mt-2" style="border-radius: 0 0 15px 15px;">
        <button class="btn btn-link p-0 d-flex align-items-center gap-1 like-btn ${isLiked ? 'text-primary' : 'text-muted'}">
          <i class="fas fa-thumbs-up"></i> <span>Like</span> <span class="ms-1">(${likeCount})</span>
        </button>
        <button class="btn btn-link text-secondary p-0 d-flex align-items-center gap-1 comment-btn">
          <i class="fas fa-comment"></i> <span>Comment</span>
        </button>
      </div>
    </div>
  `;
}


  document.body.addEventListener("shown.bs.collapse", function (event) {
    const toggleBtn = document.querySelector(`[data-bs-target="#${event.target.id}"]`);
    if (toggleBtn && event.target.id.startsWith("image-collapse-")) toggleBtn.textContent = "Hide Image";
  });

  document.body.addEventListener("hidden.bs.collapse", function (event) {
    const toggleBtn = document.querySelector(`[data-bs-target="#${event.target.id}"]`);
    if (toggleBtn && event.target.id.startsWith("image-collapse-")) toggleBtn.textContent = "Show Image";
  });

  const threadContainer = document.getElementById("threadContainer");
  const complaintsRef = ref(db, "complaints");

onValue(complaintsRef, (snapshot) => {
  const user = auth.currentUser;
  const uid = user?.uid || "guest";

  if (threadContainer) threadContainer.innerHTML = "";

  let hasThreadComplaints = false;

  snapshot.forEach(child => {
    const id = child.key;
    const data = child.val();
    if (data.addToThread) {
      hasThreadComplaints = true;
      const html = createThreadComplaintHTML(id, data, uid);
      threadContainer.innerHTML += html;
    }
  });

  if (!hasThreadComplaints) {
    threadContainer.innerHTML = `
      <div class="text-center text-muted py-4">
        <p class="mb-0">No complaints added to thread yet.</p>
      </div>
    `;
  }

  attachLikeHandlers();
  attachCommentHandlers();
  attachReportHandlers();
});

});

function attachLikeHandlers() {
  document.querySelectorAll(".like-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const user = auth.currentUser;
      if (!user) return alert("Login required");

      const card = btn.closest("[data-id]");
      const id = card.getAttribute("data-id");
      const likeRef = ref(db, `complaints/${id}/likes/${user.uid}`);

      onValue(likeRef, snapshot => {
        if (snapshot.exists()) {
          remove(likeRef); // Unlike
        } else {
          set(likeRef, true); // Like
        }
      }, { onlyOnce: true });
    });
  });
}

function attachCommentHandlers() {
  document.querySelectorAll(".comment-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest("[data-id]");
      const id = card.getAttribute("data-id");
      const commentsRef = ref(db, `complaints/${id}/comments`);
      const container = document.getElementById("modalCommentsContainer");
      const form = document.getElementById("commentForm");
      const input = document.getElementById("commentInput");

      container.innerHTML = "<p>Loading comments...</p>";

      const commentModal = new bootstrap.Modal(document.getElementById("commentModal"));
      commentModal.show();
function renderComment(c, key, postId, isReply = false, parentCommentId = null) {
  const isAdmin = c.user === "admin" || c.type === "admin";
  const likedByAdmin = c.likes && c.likes.admin;
  const likeCount = c.likes ? Object.keys(c.likes).length : 0;

  return `
    <div class="mb-3 pb-2 ${isAdmin ? 'bg-warning-subtle p-2 rounded' : ''}" data-comment-id="${key}" ${isReply ? `data-reply="true" data-parent="${parentCommentId}"` : ''}>
      <strong>${c.user || "Anonymous"} ${isAdmin ? '<span class="badge bg-danger ms-2">Admin</span>' : ''}</strong>
      <p class="mb-1">${c.text}</p>
      <small class="text-muted">${formatTimestamp(c.timestamp)}</small>
      ${likedByAdmin ? `<span class="ms-2" title="Admin liked this">❤️</span>` : ''}

      <div class="d-flex gap-2 mt-1">
        <button class="btn btn-sm btn-outline-primary like-comment-btn" data-id="${key}" data-is-reply="${isReply}" data-parent="${parentCommentId || ''}">Like (${likeCount})</button>
        ${!isReply ? `<button class="btn btn-sm btn-outline-secondary reply-btn" data-id="${key}">Reply</button>` : ""}
      </div>

      ${!isReply ? `
        <div class="reply-form mt-2 d-none" id="reply-form-${key}">
          <textarea class="form-control mb-1 reply-input" rows="2" placeholder="Write a reply..."></textarea>
          <button class="btn btn-sm btn-success send-reply-btn" data-id="${key}">Send</button>
        </div>` : ""}
    </div>
  `;
}


      // Render nested replies
      function renderReplies(replies, parentId) {
        let html = '';
        if (replies) {
          html += '<div class="ms-4 mt-2 border-start ps-3">';
          for (const replyId in replies) {
            html += renderComment(replies[replyId], replyId, id, true, parentId);
          }
          html += '</div>';
        }
        return html;
      }

      // Load and display all comments with replies
      onValue(commentsRef, snapshot => {
        if (!snapshot.exists()) {
          container.innerHTML = "<p>No comments yet.</p>";
          return;
        }

        let html = "";
        snapshot.forEach(child => {
          const c = child.val();
          html += renderComment(c, child.key, id);
          html += renderReplies(c.replies, child.key);
        });

        container.innerHTML = html;

        // Like buttons
        document.querySelectorAll(".like-comment-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            const user = auth.currentUser;
            if (!user) return alert("Login required");

            const commentId = btn.getAttribute("data-id");
            const isReply = btn.getAttribute("data-is-reply") === "true";
            const parentId = btn.getAttribute("data-parent");
            const likeRef = isReply
              ? ref(db, `complaints/${id}/comments/${parentId}/replies/${commentId}/likes/${user.uid}`)
              : ref(db, `complaints/${id}/comments/${commentId}/likes/${user.uid}`);

            onValue(likeRef, snap => {
              if (snap.exists()) {
                remove(likeRef);
              } else {
                set(likeRef, true);
              }
            }, { onlyOnce: true });
          });
        });

        // Reply buttons
        document.querySelectorAll(".reply-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            const cid = btn.getAttribute("data-id");
            const form = document.getElementById(`reply-form-${cid}`);
            form.classList.toggle("d-none");
          });
        });

        // Send reply buttons
        document.querySelectorAll(".send-reply-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            const commentId = btn.getAttribute("data-id");
            const input = document.querySelector(`#reply-form-${commentId} .reply-input`);
            const text = input.value.trim();

            const user = auth.currentUser;
            if (!user) return alert("Login required to reply");
            if (!text) return alert("Reply cannot be empty");

            const newReplyRef = ref(db, `complaints/${id}/comments/${commentId}/replies/${Date.now()}`);
            const replyData = {
              user: user.displayName || "Anonymous",
              text: text,
              timestamp: Date.now()
            };

            set(newReplyRef, replyData)
              .then(() => {
                input.value = "";
                document.getElementById(`reply-form-${commentId}`).classList.add("d-none");
              })
              .catch(err => {
                console.error("Error posting reply:", err);
                alert("Failed to send reply");
              });
          });
        });
      });

      // Clear comment input
      input.value = "";

      // Add new top-level comment
      form.onsubmit = (e) => {
        e.preventDefault();

        const user = auth.currentUser;
        if (!user) {
          alert("Login required to comment");
          return;
        }

        const text = input.value.trim();
        if (!text) {
          alert("Comment cannot be empty");
          return;
        }

        const newCommentRef = ref(db, `complaints/${id}/comments/${Date.now()}`);
        const commentData = {
          user: user.displayName || "Anonymous",
          text: text,
          timestamp: Date.now()
        };

        set(newCommentRef, commentData)
          .then(() => {
            input.value = "";
          })
          .catch(error => {
            console.error("Error submitting comment:", error);
            alert("Failed to submit comment.");
          });
      };
    });
  });
}


function attachReportHandlers() {
  document.querySelectorAll(".report-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const user = auth.currentUser;
      if (!user) return alert("Login required to report posts");

      const postId = btn.getAttribute("data-id");

      const confirmReport = confirm("Are you sure you want to report this post?");
      if (!confirmReport) return;

      // Reference to the complaint being reported
      const complaintRef = ref(db, `complaints/${postId}`);

      // Get the complaint data first
      get(complaintRef).then(snapshot => {
        if (!snapshot.exists()) {
          alert("Post not found.");
          return;
        }

        const complaintData = snapshot.val();

        // Prepare the report entry
        const reportData = {
          timestamp: Date.now(),
          user: user.displayName || user.email || "Anonymous",
          complaint: complaintData.complaint || "",
          name: complaintData.name || "",
          imageUrl: complaintData.imageUrl || "",
          uid: postId
        };

        // Store report under reports/{postId}/{userId}
        const reportRef = ref(db, `reports/${postId}/${user.uid}`);

        set(reportRef, reportData)
          .then(() => alert("Report submitted."))
          .catch(error => {
            console.error("Error reporting post:", error);
            alert("Failed to report post.");
          });

      }).catch(error => {
        console.error("Failed to fetch complaint data:", error);
        alert("Error retrieving post.");
      });
    });
  });
}
