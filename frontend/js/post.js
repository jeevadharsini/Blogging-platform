// ==========================================================================
// post.js — fetches and displays a single blog post by ID
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
const errorState = document.getElementById("errorState");
const postArticle = document.getElementById("postArticle");

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

async function loadPost() {
  if (!postId) {
    loadingState.hidden = true;
    errorState.hidden = false;
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/${postId}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Post not found");
    }

    const post = result.data;

    document.getElementById("pageTitle").textContent = `${post.title} — BlogSpace`;
    document.getElementById("postCategory").textContent = post.category;
    document.getElementById("postTitle").textContent = post.title;
    document.getElementById("postAuthor").textContent = `By ${post.author}`;
    document.getElementById("postDate").textContent = formatDate(post.createdAt);
    document.getElementById("postContent").textContent = post.content;

    const img = document.getElementById("postImage");
    img.src = post.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80";
    img.alt = post.title;
    img.onerror = () => { img.src = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80"; };

    loadingState.hidden = true;
    postArticle.hidden = false;
  } catch (error) {
    loadingState.hidden = true;
    errorState.hidden = false;
  }
}

loadPost();
