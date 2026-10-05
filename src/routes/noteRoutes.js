const express = require("express");

const requireAuth = require("../middleware/requireAuth");

const {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote
} = require("../controllers/noteController");

const router = express.Router();

// All note routes require authentication
router.use(requireAuth);

router.get("/", getNotes); 

router.get("/:id", getNoteById);

router.post("/", createNote);

router.patch("/:id", updateNote);

router.delete("/:id", deleteNote);

module.exports = router;