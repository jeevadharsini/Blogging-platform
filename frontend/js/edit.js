// ==========================================================================
// edit.js — loads an existing post into the form and submits updates
// ==========================================================================

const API_BASE = "/api/posts";

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

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

const loadingState = document.getElementById("loadingState");
const editForm = document.getElementById("editForm");
const formStatus = document.getElementById("formStatus");
const updateBtn = document.getElementById("updateBtn");

const fields = {
  title: document.getElementById("title"),
  author: document.getElementById("author"),
  category: document.getElementById("category"),
  image: document.getElementById("image"),
  excerpt: document.getElementById("excerpt"),
  content: document.getElementById("content"),
};

function showFormStatus(message, type = "error") {
  formStatus.textContent = message;
  formStatus.className = `status-message ${type}`;
  formStatus.hidden = false;
}

function showFieldError(fieldName, message) {
  const input = fields[fieldName];
  const errorEl = document.getElementById(`${fieldName}Error`);
  if (message) {
    input.classList.add("invalid");
    errorEl.textContent = message;
  } else {
    input.classList.remove("invalid");
    errorEl.textContent = "";
  }
}

function validateForm() {
  let isValid = true;
  if (!fields.title.value.trim()) { showFieldError("title", "Title is required."); isValid = false; } else showFieldError("title", "");
  if (!fields.author.value.trim()) { showFieldError("author", "Author name is required."); isValid = false; } else showFieldError("author", "");
  if (!fields.category.value) { showFieldError("category", "Please select a category."); isValid = false; } else showFieldError("category", "");
  if (!fields.excerpt.value.trim()) { showFieldError("excerpt", "A short description is required."); isValid = false; } else showFieldError("excerpt", "");
  if (!fields.content.value.trim()) { showFieldError("content", "Blog content is required."); isValid = false; } else showFieldError("content", "");
  return isValid;
}

async function loadPost() {
  if (!postId) {
    showFormStatus("No post ID was provided.");
    loadingState.hidden = true;
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/${postId}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Post not found");
    }

    const post = result.data;
    fields.title.value = post.title;
    fields.author.value = post.author;
    fields.category.value = post.category;
    fields.image.value = post.image || "";
    fields.excerpt.value = post.excerpt;
    fields.content.value = post.content;

    loadingState.hidden = true;
    editForm.hidden = false;
  } catch (error) {
    loadingState.hidden = true;
    showFormStatus(`Could not load post: ${error.message}`);
  }
}

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formStatus.hidden = true;

  if (!validateForm()) {
    showFormStatus("Please fix the errors below before updating.");
    return;
  }

  const payload = {
    title: fields.title.value.trim(),
    author: fields.author.value.trim(),
    category: fields.category.value,
    image: fields.image.value.trim() || undefined,
    excerpt: fields.excerpt.value.trim(),
    content: fields.content.value.trim(),
  };

  updateBtn.disabled = true;
  updateBtn.textContent = "Updating…";

  try {
    const response = await fetch(`${API_BASE}/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to update post");
    }

    sessionStorage.setItem("blogspace_flash", "Post updated successfully!");
    window.location.href = "index.html";
  } catch (error) {
    showFormStatus(`Could not update post: ${error.message}`);
    updateBtn.disabled = false;
    updateBtn.textContent = "Update post";
  }
});

loadPost();
