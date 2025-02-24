import db from "../dbConnection/db.js";

const toggleQuestionStatus = (req, res) => {
  const { id } = req.params;
  const { isEnabled } = req.body;

  // Query to update the question status in the database
  const query = 'UPDATE questions SET isEnabled = ? WHERE id = ?';
  const values = [isEnabled, id];

  // Execute the query
  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error toggling question status:', err);
      return res.status(500).json({ error: 'Failed to toggle question status. Please try again.' });
    }

    if (result.affectedRows === 0) {
      // If no rows were affected, the id was not found
      return res.status(404).json({ error: 'Question not found.' });
    }

    // Respond with success message
    return res.status(200).json({
      message: `Question ${isEnabled ? 'enabled' : 'disabled'} successfully`,
      id: id,
      isEnabled: isEnabled,
    });
  });
};

export default toggleQuestionStatus;