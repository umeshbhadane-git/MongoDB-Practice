require("dotenv").config();

const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

const Note = require("../src/models/Note");

const MONGODB_URI = process.env.MONGODB_URI;

const seedNotes = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB connected");

    const notes = [];

    for (let i = 0; i < 10000; i++) {
      notes.push({
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(2),
        userId: `user${faker.number.int({ min: 1, max: 100 })}`,
        tags: faker.helpers.arrayElements(
          [
            "mongodb",
            "nodejs",
            "express",
            "javascript",
            "backend",
            "database",
            "api",
            "coding"
          ],
          {
            min: 1,
            max: 4
          }
        )
      });
    }

    await Note.insertMany(notes);

    console.log("10,000 notes inserted successfully");

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedNotes();