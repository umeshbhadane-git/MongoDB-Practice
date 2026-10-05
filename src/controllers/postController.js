const { z } = require("zod");

const Post = require("../models/Post");
const AppError = require("../errors/AppError");

const createPostSchema = z.object({
    title: z
        .string()
        .min(1, "Post title is required")
        .max(200, "Title cannot exceed 200 characters"),

    body: z
        .string()
        .min(1, "Post body is required")
});

const createCommentSchema = z.object({
    body: z
        .string()
        .min(1, "Comment body is required")
        .max(1000, "Comment cannot exceed 1000 characters")
});


// GET /posts
const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find()
            .populate("author", "name")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: posts
        });
    } catch (error) {
        next(error);
    }
};

// POST /posts
const createPost = async (req, res, next) => {
    try {
        const result = createPostSchema.safeParse(req.body);

        if (!result.success) {
            return next(
                new AppError(
                    result.error.issues[0].message,
                    400
                )
            );
        }

        const post = await Post.create({
            title: result.data.title,
            body: result.data.body,

            // Get author from JWT
            // Do NOT accept author from request body
            author: req.user.userId
        });

        await post.populate("author", "name");

        res.status(201).json({
            success: true,
            data: post
        });
    } catch (error) {
        next(error);
    }
};

// GET /posts/:id
const getPostById = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("author", "name")
            .populate("comments.author", "name");

        if (!post) {
            return next(
                new AppError("Post not found", 404)
            );
        }

        res.json({
            success: true,
            data: post
        });
    } catch (error) {
        next(error);
    }
};


// POST /posts/:id/comments
const addComment = async (req, res, next) => {
    try {
        const result = createCommentSchema.safeParse(req.body);

        if (!result.success) {
            return next(
                new AppError(
                    result.error.issues[0].message,
                    400
                )
            );
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return next(
                new AppError("Post not found", 404)
            );
        }

        post.comments.push({
            author: req.user.userId,
            body: result.data.body
        });

        await post.save();

        await post.populate("author", "name");
        await post.populate("comments.author", "name");

        res.status(201).json({
            success: true,
            data: post
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getPosts,
    getPostById,
    createPost,
    addComment
};