import express from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/protect.middleware';

const paymentRouter = express.Router();

paymentRouter.post('/initiate' , authenticate , PaymentController.initiatePayment);
paymentRouter.post('/webhook' , PaymentController.handleWebhook)
