// Run with: npm run seed
// This clears existing posts and inserts 3 sample blog posts so you can test the site immediately.

require("dotenv").config();
const { pool, ensureSchema } = require("./db");

const samplePosts = [
  {
    title: "Getting Started with Modern Web Development",
    author: "Priya Sharma",
    category: "Programming",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
    excerpt: "A beginner-friendly walkthrough of HTML, CSS, and JavaScript fundamentals for building real websites.",
    content:
      "Web development can feel overwhelming at first, but breaking it down into HTML for structure, CSS for style, and JavaScript for behavior makes it manageable. In this post, we cover how these three technologies work together, why the DOM matters, and how to structure a simple project. We also look at how frameworks fit in once you're comfortable with the basics, and why understanding vanilla JavaScript first will make learning any framework much easier later on. Practice is key: build small projects, break things, and fix them.",
  },
  {
    title: "Java Programming: Understanding Object-Oriented Basics",
    author: "Arjun Mehta",
    category: "Programming",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    excerpt: "An introduction to classes, objects, inheritance, and polymorphism in Java for new programmers.",
    content:
      "Java remains one of the most widely used languages in enterprise software, and understanding object-oriented programming is essential to using it well. This post explains the four pillars of OOP: encapsulation, inheritance, polymorphism, and abstraction, using simple real-world analogies. We walk through creating a basic class, instantiating objects, and extending behavior through inheritance. By the end, you'll understand why Java's strict typing and OOP structure make large codebases easier to maintain over time.",
  },
  {
    title: "How Artificial Intelligence Is Changing Everyday Life",
    author: "Sneha Iyer",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    excerpt: "Exploring how AI tools are quietly reshaping the way we work, communicate, and make decisions.",
    content:
      "Artificial intelligence has moved from research labs into everyday tools, from recommendation systems to writing assistants. This post looks at practical examples of AI in daily life, including personalized content feeds, voice assistants, and predictive text. We also discuss the importance of understanding how these systems work at a basic level, so users can make informed decisions about the tools they rely on. Finally, we touch on the balance between convenience and privacy that comes with adopting AI-powered products.",
  },
];

const seedDatabase = async () => {
  try {
    await ensureSchema();
    console.log("Schema ready.");

    await pool.query("DELETE FROM posts");
    console.log("Existing posts cleared.");

    for (const post of samplePosts) {
      await pool.query(
        `INSERT INTO posts (title, author, category, image, excerpt, content)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [post.title, post.author, post.category, post.image, post.excerpt, post.content]
      );
    }

    console.log("3 sample posts inserted successfully.");
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
};

seedDatabase();
