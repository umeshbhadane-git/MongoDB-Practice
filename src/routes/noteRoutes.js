const express = require("express");

const {
  createNote,
  getNotes,
  getNoteStats
} = require("../controllers/noteController");

const router = express.Router();

router.get("/stats", getNoteStats);

router.post("/", createNote);
router.get("/", getNotes);

module.exports = router;