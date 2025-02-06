import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../dbConnection/db.js';
import dotenv from 'dotenv';

dotenv.config();

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password.' });
  }

  try {
    // Query the database for the user by email
    db.execute('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
      if (err) {
        console.error('Database error:', err.message || err);
        return res.status(500).json({ message: 'Database error. Please try again.' });
      }

      if (result.length === 0) {
        return res.status(400).json({ message: 'User not found.' });
      }

      // Compare the password with the hashed password from the database
      const isMatch = await bcrypt.compare(password, result[0].password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials.' });
      }

      // Create a JWT token for the user
      const token = jwt.sign(
        {
          id: result[0].id,
          market:result[0].market,
         name:result[0].name,
          role: result[0].role,
        },

        process.env.JWT_SECRET,
        { expiresIn: '1h' }  // Token will expire in 1 hour
      );

      res.status(200).json({
        message: 'Login successful!',
        token,
      });
    });
  } catch (err) {
    console.error('Error during login:', err.message || err);
    res.status(500).json({ message: 'Internal server error, please try again later.' });
  }
};

export default login;
