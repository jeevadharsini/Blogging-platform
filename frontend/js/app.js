// ==========================================================================
// app.js — powers the home page: fetching, rendering, search, filter, delete
// Also runs the shared mobile navigation on every page.
// ==========================================================================

const API_BASE = "/api/posts";

// ---------- Mobile navigation (runs on every page) ----------
function initNav() {
  const hamburger = document.getElementById("hamburgerBtn");
  const navLinks = document.getElementById("navLinks");
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
  });
}
initNav();

// ---------- Home page logic (only runs if #blogGrid exists) ----------
const blogGrid = document.getElementById("blogGrid");

if (blogGrid) {
  const loadingState = document.getElementById("loadingState");
  const emptyState = document.getElementById("emptyState");
  const statusMessage = document.getElementById("statusMessage");
  const searchInput = document.getElementById("searchInput");
  const filterRow = document.getElementById("filterRow");
  const deleteModal = document.getElementById("deleteModal");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

  let currentCategory = "All";
  let currentSearch = "";
  let searchDebounceTimer = null;
  let postIdPendingDelete = null;

  const categoryClasses = {
    Technology: "cat-technology",
    Education: "cat-education",
    Lifestyle: "cat-lifestyle",
    Travel: "cat-travel",
    Programming: "cat-programming",
    Other: "cat-other",
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function escapeHtml(str = "") {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function showStatus(message, type = "success") {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.hidden = false;
  statusMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });

  // Fade in on the next frame (so the transition actually plays)
  requestAnimationFrame(() => statusMessage.classList.add("visible"));

  setTimeout(() => {
    statusMessage.classList.remove("visible");
    setTimeout(() => { statusMessage.hidden = true; }, 250); // wait for fade-out to finish
  }, 3500);
}

  function renderPosts(posts) {
    blogGrid.innerHTML = "";

    if (!posts || posts.length === 0) {
      emptyState.hidden = false;
      blogGrid.hidden = true;
      return;
    }

    emptyState.hidden = true;
    blogGrid.hidden = false;

    posts.forEach((post) => {
      const card = document.createElement("article");
      card.className = "blog-card";
      card.innerHTML = `
        <div class="card-img-wrap">
          <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" loading="lazy"
               onerror="this.src='https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80'" />
          <span class="category-stamp">${escapeHtml(post.category)}</span>
        </div>
        <div class="card-body">
          <h3>${escapeHtml(post.title)}</h3>
          <p class="card-excerpt">${escapeHtml(post.excerpt)}</p>
          <div class="card-meta">
            <span>${escapeHtml(post.author)}</span>
            <span class="dot">&middot;</span>
            <span>${formatDate(post.createdAt)}</span>
          </div>
          <div class="card-actions">
            <a href="post.html?id=${post._id}" class="btn btn-primary">Read More</a>
            <a href="edit.html?id=${post._id}" class="icon-btn edit-btn" title="Edit post" aria-label="Edit post">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </a>
            <button class="icon-btn delete-btn" title="Delete post" aria-label="Delete post" data-id="${post._id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      `;
      blogGrid.appendChild(card);
    });

    // Wire up delete buttons for the freshly rendered cards
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        postIdPendingDelete = btn.dataset.id;
        deleteModal.hidden = false;
      });
    });
  }

  async function fetchPosts() {
    loadingState.hidden = false;
    blogGrid.hidden = true;
    emptyState.hidden = true;

    try {
      const params = new URLSearchParams();
      if (currentCategory !== "All") params.set("category", currentCategory);
      if (currentSearch.trim()) params.set("search", currentSearch.trim());

      const response = await fetch(`${API_BASE}?${params.toString()}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load posts");
      }

      renderPosts(result.data);
    } catch (error) {
      showStatus(`Could not load posts: ${error.message}. Is the backend/MongoDB running?`, "error");
      renderPosts([]);
    } finally {
      loadingState.hidden = true;
    }
  }

  // ---------- Search (debounced so it doesn't hit the API on every keystroke) ----------
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value;
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(fetchPosts, 350);
  });

  // ---------- Category filter chips ----------
  filterRow.addEventListener("click", (e) => {
    const chip = e.target.closest(".filter-chip");
    if (!chip) return;
    document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    currentCategory = chip.dataset.category;
    fetchPosts();
  });

  // ---------- Delete confirmation modal ----------
  cancelDeleteBtn.addEventListener("click", () => {
    deleteModal.hidden = true;
    postIdPendingDelete = null;
  });

  confirmDeleteBtn.addEventListener("click", async () => {
    if (!postIdPendingDelete) return;
    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.textContent = "Deleting…";

    try {
      const response = await fetch(`${API_BASE}/${postIdPendingDelete}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete post");
      }

      deleteModal.hidden = true;
      showStatus("Post deleted successfully.", "success");
      fetchPosts();
    } catch (error) {
      showStatus(`Delete failed: ${error.message}`, "error");
    } finally {
      confirmDeleteBtn.disabled = false;
      confirmDeleteBtn.textContent = "Delete post";
      postIdPendingDelete = null;
    }
  });

  // If we just created/updated a post, show a success message passed via sessionStorage
  const flashMessage = sessionStorage.getItem("blogspace_flash");
  if (flashMessage) {
    showStatus(flashMessage, "success");
    sessionStorage.removeItem("blogspace_flash");
  }

  fetchPosts();
}
