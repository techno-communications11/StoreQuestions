import db from '../../dbConnection/db.js';
import bcrypt from 'bcrypt';

const register = async (req, res) => {
  // Validate input using express-validator
  

  const { email, password, role, confirmPassword, name, market } = req.body;

  // Basic validation
  if (!email || !password || !confirmPassword || !name) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  // Validate role
  const validRoles = ['district_manager', 'market_manager', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }

  // Market validation for market managers
  if (role === 'market_manager') {
    if (!market || (Array.isArray(market) && market.length === 0)) {
      return res.status(400).json({ message: 'Market managers must select at least one market' });
    }
  }

  try {
    // Check if user exists
    const userCheckQuery = 'SELECT id FROM users WHERE email = ?';
    const [existingUser] = await new Promise((resolve, reject) => {
      db.query(userCheckQuery, [email], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Prepare market data
    let marketData = null;
    if (market) {
      marketData = Array.isArray(market) ? JSON.stringify(market) : market;
    }

    // Insert user
    const insertQuery = `
      INSERT INTO users (email, password, role, market, name) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const insertResult = await new Promise((resolve, reject) => {
      db.query(
        insertQuery,
        [email, hashedPassword, role, marketData, name],
        (err, results) => {
          if (err) {
            console.error('Database insertion error:', err);
            return reject(err);
          }
          resolve(results);
        }
      );
    });

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: insertResult.insertId,
        email,
        role,
        name
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Registration failed due to server error',
      ...(process.env.NODE_ENV === 'development' && {
        error: {
          message: error.message,
          code: error.code,
          sqlState: error.sqlState
        }
      })
    });
  }
};

export default register;