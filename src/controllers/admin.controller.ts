import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';

export class AdminController {
    static async postPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const planData = req.body;
            const result = await AdminService.postPlan(planData);
            
            res.status(201).json({
                status: 'success',
                data: result
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

    static async listAllUsers(req: Request, res: Response, next: NextFunction) {
        try{
            const users = await AdminService.listOfUsers();
            res.status(200).json({
                status: 'success',
                data: users});
        }catch(error){
            next(error);
        }
    }

    static async listofOrders(req: Request, res: Response, next: NextFunction) {
        try{
            const orders = await AdminService.listOfOrders();
            res.status(200).json({
                status: 'success',
                data: orders
            });
        }catch(error){
            next(error);
        }
    }

    static async getAdminData(req: Request, res: Response, next: NextFunction) {
        try{
            const adminData = await AdminService.getAdminData();
            res.status(200).json({
                status: 'success',
                data: adminData
            });
        }catch(error){
            next(error);
        }
    }
    static async deleteUser(req: Request, res: Response, next: NextFunction) {  
        try{
            const {userId} = req.params;
            const user = await AdminService.deleteUser(userId);
            res.status(200).json({
                status: 'success',
                data: user
            });
        }catch(error){
            next(error);
        }
    }

    static async changeAvailability(req: Request, res: Response, next: NextFunction) {
        try {
            const { nodeId } = req.params;
            const { availability } = req.body;

         

            const updatedNode = await AdminService.changeAvailability(nodeId, availability);
            
            res.status(200).json({
                status: 'success',
                data: updatedNode
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { orderId } = req.params;
            const { status, deployDate, expiryDate } = req.body;

            const updatedOrder = await AdminService.updateOrderStatus(
                orderId,
                status,
                deployDate,
                expiryDate
            );
            
            res.status(200).json({
                status: 'success',
                data: updatedOrder
            });
        } catch (error) {
            next(error);
        }
    }

    static async getOrdersByStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                status,
                page = 1,
                limit = 10,
                sortBy = 'orderDate',
                sortOrder = 'desc',
                startDate,
                endDate
            } = req.query;

            const result = await AdminService.getOrdersByStatus(
                status as string,
                parseInt(page as string),
                parseInt(limit as string),
                sortBy as string,
                sortOrder as string,
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined
            );
            
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateOrderOutputData(req: Request, res: Response, next: NextFunction) {
        try {
            const { orderId } = req.params;
            const { outputData } = req.body;

            const updatedOrder = await AdminService.updateOrderOutputData(
                orderId,
                outputData
            );
            
            res.status(200).json({
                status: 'success',
                data: updatedOrder
            });
        } catch (error) {
            next(error);
        }
    }
} 