const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Comment author is required"]
        },

        body: {
            type: String,
            required: [true, "Comment body is required"],
            minlength: [1, "Comment cannot be empty"],
            maxlength: [1000, "Comment cannot exceed 1000 characters"],
            trim: true
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    }
);

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Post title is required"],
            minlength: [1, "Title cannot be empty"],
            maxlength: [200, "Title cannot exceed 200 characters"],
            trim: true
        },

        body: {
            type: String,
            required: [true, "Post body is required"],
            minlength: [1, "Post body cannot be empty"]
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Post author is required"]
        },

        comments: {
            type: [commentSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;