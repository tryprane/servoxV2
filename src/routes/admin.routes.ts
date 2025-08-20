import express from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/protect.middleware';

const admin = express.Router();

// Apply authentication and admin check to all routes
admin.use(authenticate, requireAdmin);

// Post a new plan
admin.post('/plans', AdminController.postPlan);

// Get all posted plans
admin.get('/plans', AdminController.getPostedPlan);

// Change node availability
admin.patch('/nodes/:nodeId/availability', AdminController.changeAvailability);

// Update order status
admin.patch('/orders/:orderId/status', AdminController.updateOrderStatus);

// Get orders by status with filtering and pagination
admin.get('/orders', AdminController.getOrdersByStatus);

// Get admin data
admin.get('/admin-data', AdminController.getAdminData);

// Update order output data
admin.patch('/orders/:orderId/output', AdminController.updateOrderOutputData);

// List all users
admin.get('/users', AdminController.listAllUsers);

// List all orders
admin.get('/orders', AdminController.listofOrders);

// Delete a user
admin.delete('/users/:userId', AdminController.deleteUser);

admin.delete('/plan/:planId' , AdminController.deletePlan);

export default admin;
