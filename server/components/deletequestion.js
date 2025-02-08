import db from "../dbConnection/db.js";

const deleteQuestion = (req, res) => {
  const { id } = req.params;  // Getting id from request params (URL)
  console.log(req.params)

  // Query to delete the question from the database by its id
  const query = 'DELETE FROM questions WHERE id = ?';
  const values = [id];

  // Execute the query
  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error deleting question from database:', err);
      return res.status(500).json({ error: 'Failed to delete question. Please try again.' });
    }

    if (result.affectedRows === 0) {
      // If no rows were affected, the id was not found
      return res.status(404).json({ error: 'Question not found.' });
    }

    // Respond with success message
    return res.status(200).json({
      message: 'Question deleted successfully',
      id: id,
    });
  });
};

export default deleteQuestion;
