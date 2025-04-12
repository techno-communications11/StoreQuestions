import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token; // Match the cookie name set in login.js
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded; // { id, market, name, role }
    next();
  });
};

export default authenticateToken;