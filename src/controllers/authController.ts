import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { RequestWithUser } from '../types';

export const signup = async (req: Request, res: Response) => {
  const { username, password, name, role } = req.body;
  if (!username || !password || !name || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, name, role },
    });
    res.status(201).json({ message: 'User created', user: { id: user.id, username, role } });
  } catch (error: any) {
    res.status(400).json({ message: 'Error creating user', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });
    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const getMe = async (req: RequestWithUser, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { name: true, username: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user information' });
  }
};