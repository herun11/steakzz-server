import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getMenu = async (req: Request, res: Response) => {
  const menu = await prisma.menuItem.findMany();
  res.json(menu);
};

export const createMenuItem = async (req: Request, res: Response) => {
  const { name, price, description, category } = req.body;
  try {
    const item = await prisma.menuItem.create({
      data: { name, price, description, category },
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Error creating menu item' });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price, description, category } = req.body;
  try {
    const item = await prisma.menuItem.update({
      where: { id: parseInt(id) },
      data: { name, price, description, category },
    });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: 'Error updating menu item' });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.menuItem.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: 'Error deleting menu item' });
  }
};