import { User, IUser } from "../models/user.model";
import { AppError } from "../utils/appError";
import { Schema } from "mongoose";

import {logger } from "../utils/logger"

export class ReferralService{

    private static COMMISSION_RATE = 0.05;


    static async validateReferralCode(referralCode: string): Promise<IUser>{

        const referrer = await User.findOne({referralCode});

        if(!referrer){

            throw new AppError('Invalid referral code' , 400);
        }

        return referrer;
    }

    static async processNewUserReferral(userId: string , referralCode: string):Promise<void>{

        const [user, referrer] = await Promise.all([
            User.findById(userId),
            User.findOne({
                referralCode
            })
        ]);

        if(!user || !referrer) {

            throw new AppError('Invalid User or referral code' , 400);
        }

        user.referredBy = referrer._id as Schema.Types.ObjectId;
        await user.save();

        await User.findByIdAndUpdate(referrer._id, {
            $inc: {referralCount: 1}
        })

        logger.info(`New referral processed: ${referrer.email} referred ${user.email}`);


    }

    static calculateCommission(amount: number): number {
        return amount * this.COMMISSION_RATE;
    }

    static async processReferralCommission(userId:string , purchaseAmount: number):Promise<void>{
        const user = await User.findById(userId).populate('referredBy');
        if(!user || !user.referredBy) return;

        try{
            const referrer = await User.findById(user.referredBy);
            if(!referrer){
                throw new AppError('Referrer not found', 400);  
            }

            const commissionAmount = this.calculateCommission(purchaseAmount);
            
            // Update referrer's commission balance
            await User.findByIdAndUpdate(referrer._id, {
                $inc: { 
                    commissionBalance: commissionAmount,
                    totalCommissionEarned: commissionAmount
                }
            });

            logger.info(`Commission processed: ${commissionAmount} for referrer ${referrer.email}`);
        } catch (error) {
            logger.error(`Error processing commission: ${error}`);
            throw error;
        }
    }

    static async getReferralStats(userId: string): Promise<{
        referralCount: number;
        commissionBalance: number;
        totalCommissionEarned: number;
        referredUsers: IUser[];
    }> {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Get all users referred by this user
        const referredUsers = await User.find({ referredBy: user._id })
            .select('walletAddress createdAt')
            .sort({ createdAt: -1 });

        return {
            referralCount: user.referralCount || 0,
            commissionBalance: user.commissionBalance || 0,
            totalCommissionEarned: user.totalCommissionEarned || 0,
            referredUsers
        };
    }

}