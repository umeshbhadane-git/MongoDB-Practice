const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            minlength: [1, "Title cannot be empty"],
            maxlength: [200, "Title cannot exceed 200 characters"]
        },

        content: {
            type: String,
            required: [true, "Content is required"],
            minlength: [1, "Content cannot be empty"]
        },

        tags: {
            type: [String],
            default: []
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Owner is required"]
        }
    },
    {
        timestamps: true
    }
);

// Pre-save hook
noteSchema.pre("save", function () {             // Trim the spaces from the title before saving
    if (this.title) {
        this.title = this.title.trim();
    }

});


const Note = mongoose.model("Note", noteSchema);

module.exports = Note;