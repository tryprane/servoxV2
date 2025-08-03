
import express ,{Request , Response , NextFunction} from 'express';
import { PlanService } from '../services/plan.service';
interface Counting {
    available: number,
    upcoming: number,
    expired: number
}

export class PlanController{
    static async getAvaialblePlans(req: Request, res: Response, next : NextFunction){

        try {
        //code for getting plans
        const availablePlans = await PlanService.getAvailablePlans();

        res.status(200).json({
            status:'success',
            data: availablePlans
        });}
        catch (error) {
            next(error);
        }
    }

    static async getPlanCounting(req: Request , res: Response){

        try {

            const counting:Counting = await PlanService.getPlanCounting();

            res.status(200).json({
                status: 'success',
                data: counting 
            })
            
        } catch (error) {
            res.status(400).json(
                {
                    status: 'failed'
                }
            )
        }
    }

    static async getUpcomingPlans(req: Request, res: Response, next : NextFunction){
        try {
        //code for getting plans
        const upcomingPlans = PlanService.getUpcomingPlans();
        res.status(200).json({
            status:'success',
            data: upcomingPlans
        });}
        catch (error) {
            next(error);
        }
    }

    static async getExpiredPlans(req: Request, res: Response, next : NextFunction){
        try {
        //code for getting plans
        const expiredPlans = PlanService.getExpiredPlans();
        res.status(200).json({
            status:'success',
            data: expiredPlans
        });}
        catch (error) {
            next(error);
        }
    }
}