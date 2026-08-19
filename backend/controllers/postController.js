const { pool } = require("../db");

const ALLOWED_CATEGORIES = ["Technology", "Education", "Lifestyle", "Travel", "Programming", "Other"];

// Converts a DB row (snake_case) into the shape the frontend expects (camelCase)
function toApiShape(row) {
  return {
    _id: row.id,
    title: row.title,
    author: row.author,
    category: row.category,
    image: row.image,
    excerpt: row.excerpt,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET /api/posts  — supports ?search=keyword&category=Technology
const getPosts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const conditions = [];
    const values = [];

    if (category && category !== "All") {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      const idx = values.length;
      conditions.push(`(title ILIKE $${idx} OR author ILIKE $${idx} OR category ILIKE $${idx})`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT * FROM posts ${whereClause} ORDER BY created_at DESC`,
      values
    );

    res.status(200).json({ success: true, count: result.rows.length, data: result.rows.map(toApiShape) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch posts", error: error.message });
  }
};

// GET /api/posts/:id
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ success: false, message: "Invalid post ID" });
    }

    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    res.status(200).json({ success: true, data: toApiShape(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch post", error: error.message });
  }
};

// POST /api/posts
const createPost = async (req, res) => {
  try {
    const { title, author, category, image, excerpt, content } = req.body;

    if (!title || !author || !category || !excerpt || !content) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields" });
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }

    if (excerpt.length > 200) {
      return res.status(400).json({ success: false, message: "Excerpt must be 200 characters or fewer" });
    }

    const result = await pool.query(
      `INSERT INTO posts (title, author, category, image, excerpt, content)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, author, category, image || undefined, excerpt, content]
    );

    res.status(201).json({ success: true, data: toApiShape(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create post", error: error.message });
  }
};

// PUT /api/posts/:id
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ success: false, message: "Invalid post ID" });
    }

    const { title, author, category, image, excerpt, content } = req.body;

    if (!title || !author || !category || !excerpt || !content) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields" });
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }

    const result = await pool.query(
      `UPDATE posts SET title = $1, author = $2, category = $3, image = $4, excerpt = $5, content = $6
       WHERE id = $7 RETURNING *`,
      [title, author, category, image, excerpt, content, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    res.status(200).json({ success: true, data: toApiShape(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update post", error: error.message });
  }
};

// DELETE /api/posts/:id
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ success: false, message: "Invalid post ID" });
    }

    const result = await pool.query("DELETE FROM posts WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    res.status(200).json({ success: true, message: "Post deleted successfully", data: toApiShape(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete post", error: error.message });
  }
};

module.exports = { getPosts, getPostById, createPost, updatePost, deletePost };
