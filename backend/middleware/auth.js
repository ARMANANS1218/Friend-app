// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization') 
    ? req.header('Authorization').replace('Bearer ', '') 
    : null;
    
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Example payload: { id: userId }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
