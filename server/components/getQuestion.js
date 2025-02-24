import db from "../dbConnection/db.js";

const getQuestion = (req, res) => {
  // Query to fetch all questions from the database
  const query = 'SELECT * FROM questions';

  // Execute the query
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching questions from database:', err);
      return res.status(500).json({ error: 'Failed to retrieve questions. Please try again.' });
    }
    // Respond with the list of questions
    return res.status(200).json({
      message: 'Questions retrieved successfully',
      questions: result,
    });
  });
};

export default getQuestion;