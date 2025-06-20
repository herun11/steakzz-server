import { RequestWithUser, JwtPayload } from '../types';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user as JwtPayload;
    next();
  });
};

export const authorizeRole = (requiredRoles: string[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    console.log("userRole", userRole);
    if (!userRole || !requiredRoles.includes(userRole)) {
      res.status(403).json({ message: 'Access denied' });
    } else {
      next();
    }
  };
};