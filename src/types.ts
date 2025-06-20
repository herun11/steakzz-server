import { Request } from 'express';

export interface JwtPayload {
  userId: number;
  role: string;
}

export interface RequestWithUser extends Request {
  user?: JwtPayload;
}