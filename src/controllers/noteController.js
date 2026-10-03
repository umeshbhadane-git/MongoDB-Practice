const Note = require("../models/Note");

const createNote = async (req, res) => {
  try {
    const note = await Note.create(req.body);

    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

const getNotes = async (req, res) => {
  try {
    const notes = await Note.find();

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getNoteStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(
      sevenDaysAgo.getDate() - 7
    );

    const stats = await Note.aggregate([
      {
        $facet: {
          totalNotesPerUser: [
            {
              $group: {
                _id: "$userId",
                totalNotes: {
                  $sum: 1
                }
              }
            },
            {
              $sort: {
                totalNotes: -1
              }
            }
          ],

          topTags: [
            {
              $unwind: "$tags"
            },
            {
              $group: {
                _id: "$tags",
                count: {
                  $sum: 1
                }
              }
            },
            {
              $sort: {
                count: -1
              }
            },
            {
              $limit: 10
            }
          ],

          notesPerDay: [
            {
              $match: {
                createdAt: {
                  $gte: sevenDaysAgo
                }
              }
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                count: {
                  $sum: 1
                }
              }
            },
            {
              $sort: {
                _id: 1
              }
            }
          ]
        }
      }
    ]);

    res.status(200).json(stats[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteStats
};