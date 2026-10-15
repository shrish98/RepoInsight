import { verifyToken } from '../config/auth.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Authorization denied.' });
  }

  try {
    req.user = verifyToken(authHeader.slice('Bearer '.length)); // { userId }
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
