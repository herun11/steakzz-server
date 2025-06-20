import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import { getMe, login, signup } from './controllers/authController';
import { createInventoryItem, getInventory, updateInventory } from './controllers/inventoryController';
import { createMenuItem, deleteMenuItem, getMenu, updateMenuItem } from './controllers/menuController';
import { createOrder, getDailySales, getOrders, updateOrderStatus } from './controllers/orderController';
import { createUser, getUsers } from './controllers/userController';
import prisma from './lib/prisma';
import { authenticateToken, authorizeRole } from './middleware/authMiddleware';

dotenv.config();
const app = express();

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'https://steakzz-frontend.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

app.post('/auth/signup', signup as express.RequestHandler);
app.post('/auth/login', login as express.RequestHandler);
app.get('/menu', getMenu as express.RequestHandler);

app.use(authenticateToken as express.RequestHandler);
app.get('/auth/me', getMe as express.RequestHandler);
app.post('/menu', authorizeRole(['Manager']), createMenuItem as express.RequestHandler);
app.put('/menu/:id', authorizeRole(['Manager']), updateMenuItem as express.RequestHandler);
app.delete('/menu/:id', authorizeRole(['Manager']), deleteMenuItem as express.RequestHandler);
app.post('/orders', authorizeRole(['Waiter']), createOrder as express.RequestHandler);
app.get('/orders', authorizeRole(['Cashier','Chef','Waiter']), getOrders as express.RequestHandler);
app.put('/orders/:id/status', authorizeRole(['Cashier','Chef','Waiter']), updateOrderStatus as express.RequestHandler);
app.get('/sales', authorizeRole(['Cashier']), getDailySales as express.RequestHandler);
app.get('/inventory', authorizeRole(['Chef', 'Manager']), getInventory as express.RequestHandler);
app.post('/inventory', authorizeRole(['Manager']), createInventoryItem as express.RequestHandler);
app.put('/inventory/:id', authorizeRole(['Manager']), updateInventory as express.RequestHandler);
app.post('/users', authorizeRole(['Manager']), createUser as express.RequestHandler);
app.get('/users', authorizeRole(['Manager']), getUsers as express.RequestHandler);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
