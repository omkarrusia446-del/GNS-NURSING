const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Auth Error: No token provided' });

  try {
    const splitToken = token.split(' ')[1]; // Expecting "Bearer <token>"
    const decoded = jwt.verify(splitToken || token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (e) {
    res.status(500).json({ message: 'Invalid Token' });
  }
};
