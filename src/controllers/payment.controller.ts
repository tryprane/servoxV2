import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';

export class PaymentController {
    static async initiatePayment(req: Request, res: Response, next: NextFunction) {
        try {
            const { orderId,  amount } = req.body;
            const walletAddress = req.user.walletAddress;
            const userId = req.user.id;

            console.log(walletAddress , orderId , amount);

            if (!orderId || !walletAddress || !amount) {
                throw new AppError('Missing required fields', 400);
            }

            const payment = await PaymentService.initiatePayment(userId, orderId, walletAddress, amount);
            res.status(200).json({
                status: 'success',
                data: payment
            });
        } catch (error) {
            next(error);
        }
    }

    static async handleWebhook(req: Request, res: Response, next: NextFunction) {
        try {
            const payload = req.body;
            const payment = await PaymentService.handleWebhook(payload);
            
            if (!payment) {
                res.status(200).json({
                    status: 'success',
                    message: 'Webhook processed but no payment found'
                });
                return
            }

            res.status(200).json({
                status: 'success',
                data: payment
            });
        } catch (error) {
            next(error);
        }
    }
} 