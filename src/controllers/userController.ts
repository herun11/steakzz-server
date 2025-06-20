import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { hashPassword } from '../utils/hash';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export const createUser = async (req: Request, res: Response) => {
  const { username, name, role, email } = req.body;
  try {
    const generatedPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await hashPassword(generatedPassword);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, name, role },
    });

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Account Password',
      text: `Hello ${name},\n\nYour account has been created. Your username is: ${username} and your password is: ${generatedPassword}\n\nPlease change your password after logging in.`,
    };

    transporter.sendMail(mailOptions, (error: Error | null, info: nodemailer.SentMessageInfo) => {
      if (error) {
        return res.status(500).json({ message: 'Error sending email', error: error.message });
      }
      res.status(201).json({ message: 'User created and email sent', user: { id: user.id, username, role } });
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating user' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, username: true, role: true, name: true } });
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching users' });
  }
};