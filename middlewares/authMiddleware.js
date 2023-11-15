const jwt = require('jsonwebtoken');
const config = require('../config/jwtConfig');

const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    jwt.verify(token, config.jwtSecret);
    next(); // Move on to the next middleware or route
  } catch (error) {
    res.status(401).json({ message: 'Access denied. Invalid token.' });
  }
};

module.exports = authMiddleware;
