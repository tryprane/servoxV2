import { Request, Response, NextFunction } from 'express';
import { ReferralService } from '../services/referral.service';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';

export class ReferralController {
    static async validateReferralCode(req: Request, res: Response, next: NextFunction) {
        try {
            const { referralCode } = req.params;

            if (!referralCode) {
                throw new AppError('Referral code is required', 400);
            }

            const referrer = await ReferralService.validateReferralCode(referralCode);
            res.status(200).json({
                status: 'success',
                data: referrer
            });
        } catch (error) {
            next(error);
        }
    }

    

    

    static async getReferralStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;

            if (!userId) {
                throw new AppError('User ID is required', 400);
            }

            const stats = await ReferralService.getReferralStats(userId);
            res.status(200).json({
                status: 'success',
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
} 