import { RequestWithUser } from '../types';
import { Response } from 'express';
import prisma from '../lib/prisma';
import { Request } from 'express';

export const createOrder = async (req: RequestWithUser, res: Response) => {
  const { items, total } = req.body;
  try {
    const order = await prisma.order.create({
      data: { customerId: req.user!.userId, items, total, status: 'Pending' },
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Error creating order' });
  }
};

export const getOrders = async (req: RequestWithUser, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { customer: { select: { name: true } } },
    });
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching orders' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
    });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Error updating order status' });
  }
};

export const getDailySales = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sales = await prisma.order.aggregate({
      where: { status: 'Completed', createdAt: { gte: today } },
      _sum: { total: true },
    });
    res.json({ totalSales: (sales._sum?.total ?? 0) });
  } catch (error) {
    res.status(400).json({ message: 'Error fetching sales' });
  }
};