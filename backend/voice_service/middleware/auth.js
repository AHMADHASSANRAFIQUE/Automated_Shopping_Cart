import jwt from 'jsonwebtoken';

/**
 * Authentication Middleware
 * Parses JWT token or assigns default valid ObjectId for anonymous/guest sessions
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token && token !== 'null') {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here');
      req.user = decoded;
      return next();
    } catch (err) {
      console.warn("Invalid or expired JWT token, defaulting to guest session");
    }
  }

  // Default to dummy valid Mongoose ObjectId for guest/anonymous sessions
  req.user = { id: '000000000000000000000000' };
  next();
};
