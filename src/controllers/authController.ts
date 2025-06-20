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
      where: { id: req.user?.userId },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};

export const initializeManager = async (req: Request, res: Response) => {
  try {
    // Check if any manager exists
    const existingManager = await prisma.user.findFirst({
      where: { role: 'Manager' }
    });

    if (existingManager) {
      return res.status(400).json({ 
        message: 'A manager already exists' 
      });
    }

    const { username, password, name } = req.body;

    // Basic validation
    if (!username || !password || !name) {
      return res.status(400).json({ 
        message: 'Username, password, and name are required' 
      });
    }

    // Check if username already exists
    const existingUser = await prisma.user.findFirst({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username or email already in use' 
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create manager user
    const manager = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role: 'Manager'
      }
    });

    // Don't send back the password hash
    const { password: _, ...userWithoutPassword } = manager;

    res.status(201).json({ 
      message: 'Manager created successfully',
      user: userWithoutPassword 
    });
  } catch (error: any) {
    console.error('Error initializing manager:', error);
    res.status(500).json({ 
      message: 'Error creating manager',
      error: error.message
    });
  }
};