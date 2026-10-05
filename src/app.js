const express = require("express");

const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const postRoutes = require("./routes/postRoutes");

const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);

app.use("/notes", noteRoutes);

app.use("/posts", postRoutes);


// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: "Route not found"
        }
    });
});


// Central error handler
app.use(errorHandler);

module.exports = app;