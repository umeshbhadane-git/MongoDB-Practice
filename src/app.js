const express = require("express");

const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");

const errorHandler = require("./middleware/errorHandler");

const app = express();


// Parse JSON request bodies
app.use(express.json());


// Routes
app.use("/auth", authRoutes);

app.use("/notes", noteRoutes);


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