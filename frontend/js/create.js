// ==========================================================================
// create.js — handles the "Create Post" form: validation + API submission
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

const form = document.getElementById("createForm");
const publishBtn = document.getElementById("publishBtn");
const formStatus = document.getElementById("formStatus");

const fields = {
  title: document.getElementById("title"),
  author: document.getElementById("author"),
  category: document.getElementById("category"),
  image: document.getElementById("image"),
  excerpt: document.getElementById("excerpt"),
  content: document.getElementById("content"),
};

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

  if (!fields.title.value.trim()) {
    showFieldError("title", "Title is required.");
    isValid = false;
  } else {
    showFieldError("title", "");
  }

  if (!fields.author.value.trim()) {
    showFieldError("author", "Author name is required.");
    isValid = false;
  } else {
    showFieldError("author", "");
  }

  if (!fields.category.value) {
    showFieldError("category", "Please select a category.");
    isValid = false;
  } else {
    showFieldError("category", "");
  }

  if (!fields.excerpt.value.trim()) {
    showFieldError("excerpt", "A short description is required.");
    isValid = false;
  } else if (fields.excerpt.value.trim().length > 200) {
    showFieldError("excerpt", "Keep the description under 200 characters.");
    isValid = false;
  } else {
    showFieldError("excerpt", "");
  }

  if (!fields.content.value.trim()) {
    showFieldError("content", "Blog content is required.");
    isValid = false;
  } else {
    showFieldError("content", "");
  }

  return isValid;
}

function showFormStatus(message, type = "error") {
  formStatus.textContent = message;
  formStatus.className = `status-message ${type}`;
  formStatus.hidden = false;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formStatus.hidden = true;

  if (!validateForm()) {
    showFormStatus("Please fix the errors below before publishing.");
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

  publishBtn.disabled = true;
  publishBtn.textContent = "Publishing…";

  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to publish post");
    }

    sessionStorage.setItem("blogspace_flash", "Post published successfully!");
    window.location.href = "index.html";
  } catch (error) {
    showFormStatus(`Could not publish post: ${error.message}`);
    publishBtn.disabled = false;
    publishBtn.textContent = "Publish post";
  }
});
