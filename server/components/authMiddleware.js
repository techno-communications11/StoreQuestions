import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];  // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'No token provided, access denied.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token.' });
    }
    req.user = user;  // Attach the user data to the request object
    next();
  });
};

export default authenticateToken;
