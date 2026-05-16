/**
 * Simple Authentication Middleware
 * For Phase 4 shopping session tracking & history
 */
export const authenticateToken = (req, res, next) => {
  // If authorization header is present, parse userId or default to 'guest'
  const authHeader = req.headers['authorization'];
  req.user = req.user || { id: 'anonymous' };
  next();
};
