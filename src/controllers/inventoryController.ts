import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getInventory = async (req: Request, res: Response) => {
  const inventory = await prisma.inventory.findMany();
  res.json(inventory);
};

export const updateInventory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { itemName, quantity } = req.body;
  try {
    const item = await prisma.inventory.update({
      where: { id: parseInt(id) },
      data: { itemName, quantity, lastUpdated: new Date() },
    });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: 'Error updating inventory' });
  }
};

export const createInventoryItem = async (req: Request, res: Response) => {
  const { itemName, quantity } = req.body;
  try {
    const item = await prisma.inventory.create({
      data: { itemName, quantity },
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Error creating inventory item' });
  }
};