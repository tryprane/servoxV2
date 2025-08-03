import express from 'express';
import { NodeOrderController } from '../controllers/nodeOrder.controller';
import { authenticate } from '../middleware/protect.middleware';

const nodeOrder = express.Router();

// Create a new order
nodeOrder.post('/', authenticate, NodeOrderController.createOrder);

// Get orders for a specific user
nodeOrder.get('/user', authenticate, NodeOrderController.getUserOrders);

// Get a specific order by ID
nodeOrder.get('/:orderId', authenticate, NodeOrderController.getOrderById);

// Renew an order
nodeOrder.post('/:orderId/renew', authenticate, NodeOrderController.renewOrder);

// Renew an order with changes
nodeOrder.post('/:orderId/renew-with-changes', authenticate, NodeOrderController.renewOrderWithChanges);

// Renew an expired order
nodeOrder.post('/:orderId/renew-expired', authenticate, NodeOrderController.renewExpiredOrder);

// Get orders that are about to expire
nodeOrder.get('/expiring/soon', authenticate, NodeOrderController.getOrdersAboutToExpire);

// Bulk renew multiple orders
nodeOrder.post('/bulk-renew', authenticate, NodeOrderController.bulkRenewOrders);

export default nodeOrder;
