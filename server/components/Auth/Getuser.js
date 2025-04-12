import db from "../../dbConnection/db.js";

const getUser = (req, res) => {
    const id = req.user.id; // Get id from JWT payload via authenticateToken
  
    if (!id) {
      return res.status(400).json({ error: 'No user ID found in token.' });
    }
  
    const query = 'SELECT * FROM users WHERE id = ?';
    const values = [id];
  
    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error fetching user details:', err);
        return res.status(500).json({ error: 'Failed to fetch user details. Please try again.' });
      }
  
      if (result.length === 0) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      const user = result[0];
  
      // Parse the market field
      try {
        user.market = JSON.parse(user.market);
      } catch (error) {
        console.error("Failed to parse market JSON:", error);
        user.market = [];
      }
  
      return res.status(200).json(user);
    });
  };
  

export default getUser;