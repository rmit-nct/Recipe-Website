import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ 
      error: { code: 'UNAUTHENTICATED', message: 'No valid session token provided' } 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ 
      error: { code: 'UNAUTHENTICATED', message: 'Invalid or expired token' } 
    });
  }
};