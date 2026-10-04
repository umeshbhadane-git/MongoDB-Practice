require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const noteRoutes = require("./routes/noteRoutes");

const app = express();

connectDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Notes API is running"
  });
});

app.use("/notes", noteRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});