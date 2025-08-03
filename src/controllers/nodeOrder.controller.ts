import { Request, Response, NextFunction } from 'express';
import { NodeOrderService } from '../services/nodeOrder.service';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';
import { AdminService } from '../services/admin.service';

export class NodeOrderController {
    static async createOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const orderData = req.body;
            const order = await NodeOrderService.createOrder(orderData);
            
            res.status(201).json({
                status: 'success',
                data: order
            });
        } catch (error) {
            next(error);
        }
    }

    static async getUserOrders(req: Request, res: Response, next: NextFunction) {
        try {
            const walletId  = req.user.walletAddress;
            if (!walletId){
                throw new Error('No wallet Id is avialable')
            }
            const orders = await NodeOrderService.getUserOrders(walletId);
  
            res.status(200).json({
                status: 'success',
                data: orders
            });
        } catch (error) {
            next(error);
        }
    }

    static async getOrderById(req: Request, res: Response, next: NextFunction) {
        try {
            const { orderId } = req.params;
            const order = await NodeOrderService.getOrderById(orderId);
            
            if (!order) {
                throw new AppError('Order not found', 404);
            }

            res.status(200).json({
                status: 'success',
                data: order
            });
        } catch (error) {
            next(error);
        }
    }

    static async renewOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const { orderId } = req.params;
            const renewedOrder = await NodeOrderService.renewOrder(orderId);
            
            res.status(200).json({
                status: 'success',
                data: renewedOrder
            });
        } catch (error) {
            next(error);
        }
    }

    static async renewOrderWithChanges(req: Request, res: Response, next: NextFunction) {
        try {
            const { orderId } = req.params;
            const changes = req.body;
            const renewedOrder = await NodeOrderService.renewOrderWithChanges(orderId, changes);
            
            res.status(200).json({
                status: 'success',
                data: renewedOrder
            });
        } catch (error) {
            next(error);
        }
    }

    static async renewExpiredOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const { orderId } = req.params;
            const renewedOrder = await NodeOrderService.renewExpiredOrder(orderId);
            
            res.status(200).json({
                status: 'success',
                data: renewedOrder
            });
        } catch (error) {
            next(error);
        }
    }

    static async getOrdersAboutToExpire(req: Request, res: Response, next: NextFunction) {
        try {
            const { daysThreshold } = req.query;
            const threshold = daysThreshold ? parseInt(daysThreshold as string) : 7;
            const orders = await NodeOrderService.getOrdersAboutToExpire(threshold);
            
            res.status(200).json({
                status: 'success',
                data: orders
            });
        } catch (error) {
            next(error);
        }
    }

    static async getPostedPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const plans = await AdminService.getPostedPlan();
            
            res.status(200).json({
                status: 'success',
                data: plans
            });
        } catch (error) {
            next(error);
        }
    }

    static async bulkRenewOrders(req: Request, res: Response, next: NextFunction) {
        try {
            const { orderIds } = req.body;
            if (!Array.isArray(orderIds)) {
                throw new AppError('orderIds must be an array', 400);
            }

            const result = await NodeOrderService.bulkRenewOrders(orderIds);
            
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
} 