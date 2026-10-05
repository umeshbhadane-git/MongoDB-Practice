const { z } = require("zod");

const Note = require("../models/Note");
const AppError = require("../errors/AppError");

const createNoteSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required"),

    content: z
        .string()
        .min(1, "Content is required"),

    tags: z
        .array(z.string())
        .optional()
});

const updateNoteSchema = z.object({
    title: z
        .string()
        .min(1, "Title cannot be empty")
        .optional(),

    content: z
        .string()
        .min(1, "Content cannot be empty")
        .optional(),

    tags: z
        .array(z.string())
        .optional()
});


// GET /notes
const getNotes = async (req, res, next) => {
    try {
        const limit = Number(req.query.limit) || 10;
        const offset = Number(req.query.offset) || 0;

        // Validate pagination
        if (
            !Number.isInteger(limit) ||
            !Number.isInteger(offset) ||
            limit <= 0 ||
            offset < 0
        ) {
            return next(
                new AppError(
                    "Invalid pagination parameters",
                    400
                )
            );
        }

        const userId = req.user.userId;

        /*
         * IMPORTANT:
         * Only retrieve notes belonging to
         * the logged-in user.
         */
        const filter = {
            owner: userId
        };

        const [notes, total] = await Promise.all([
            Note.find(filter)
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit),

            Note.countDocuments(filter)
        ]);

        res.json({
            success: true,

            data: notes,

            pagination: {
                limit,
                offset,
                total
            }
        });
    } catch (error) {
        next(error);
    }
};


// GET /notes/:id
const getNoteById = async (req, res, next) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,

            // Security check
            owner: req.user.userId
        });

        if (!note) {
            return next(
                new AppError("Note not found", 404)
            );
        }

        res.json({
            success: true,
            data: note
        });
    } catch (error) {
        next(error);
    }
};


// POST /notes
const createNote = async (req, res, next) => {
    try {
        const result = createNoteSchema.safeParse(req.body);

        if (!result.success) {
            return next(
                new AppError(
                    result.error.issues[0].message,
                    400
                )
            );
        }

        const newNote = await Note.create({
            title: result.data.title,

            content: result.data.content,

            tags: result.data.tags || [],

            // NEVER take owner from request body
            owner: req.user.userId 
        });

        res.status(201).json({
            success: true,
            data: newNote
        });
    } catch (error) {
        next(error);
    }
};


// PATCH /notes/:id
const updateNote = async (req, res, next) => {
    try {
        const result = updateNoteSchema.safeParse(req.body);

        if (!result.success) {
            return next(
                new AppError(
                    result.error.issues[0].message,
                    400
                )
            );
        }

        /*
         * Find the note using BOTH:
         *
         * 1. Note ID
         * 2. Logged-in user's ID
         *
         * This prevents users from editing
         * somebody else's note.
         */
        const note = await Note.findOne({
            _id: req.params.id,
            owner: req.user.userId
        });

        if (!note) {
            return next(
                new AppError("Note not found", 404)
            );
        }

        if (result.data.title !== undefined) {
            note.title = result.data.title;
        }

        if (result.data.content !== undefined) {
            note.content = result.data.content;
        }

        if (result.data.tags !== undefined) {
            note.tags = result.data.tags;
        }

        /*
         * save() is intentional.
         *
         * This triggers the pre('save') hook
         * in Note.js.
         */
        await note.save();

        res.json({
            success: true,
            data: note
        });
    } catch (error) {
        next(error);
    }
};


// DELETE /notes/:id
const deleteNote = async (req, res, next) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            owner: req.user.userId
        });

        if (!note) {
            return next(
                new AppError("Note not found", 404)
            );
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote
};