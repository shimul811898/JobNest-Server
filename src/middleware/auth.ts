import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JwtPayload } from '../types';

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jobnest-super-secret-key-2026') as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export const verifyTokenOptional = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jobnest-super-secret-key-2026') as JwtPayload;
      req.user = decoded;
    } catch (error) {
      // Ignore token decode errors for optional checks
    }
  }
  next();
};

export const verifyAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {

  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    return;
  }
  next();
};
