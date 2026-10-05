const express = require("express");

const requireAuth = require("../middleware/requireAuth");

const {
    getPosts,
    getPostById,
    createPost,
    addComment
} = require("../controllers/postController");

const router = express.Router();


// Create post
router.post("/", requireAuth, createPost);


// Get all posts
router.get("/", getPosts);


// Get single post
router.get("/:id", getPostById);


// Add comment
router.post(
    "/:id/comments",
    requireAuth,
    addComment
);

module.exports = router;