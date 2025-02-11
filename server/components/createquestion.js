import db from '../dbConnection/db.js';

const createquestion = (req, res) => {
  const { id,type, Question, checklistType } = req.body; // Extracting question type and text from the request body
  console.log(req.body)
  // Validate if both fields are provided
  if (!type || !Question) {
    return res.status(400).json({ error: 'Both type and text are required.' });
  }

  // Insert the new question into the database
  const query = `INSERT INTO questions (id,type, Question,checklistType) VALUES (?,?, ?,?)`;

  db.query(query, [id,type, Question, checklistType], (err, result) => {
    if (err) {
      console.error('Error inserting question into database:', err);
      return res.status(500).json({ error: 'Failed to create question. Please try again.' });
    }

    // Respond with success and the inserted question's ID (optional)
    return res.status(201).json({
      message: 'Question created successfully',
      question: {
        id:id, // Assuming the DB returns an insert ID for the new question
        type,
        checklistType,
        Question
      }
    });
  });
};

export default createquestion;
