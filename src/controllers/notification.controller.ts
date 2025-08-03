import { User } from "../models/user.model";
import NotificationService from "../services/notification.service";
import { Request, Response } from "express";

class NotificationController {
    static async fetchLast10Notifications(req: Request, res: Response){
        try{
            const {walletId} = req.params;
            const notifications = await NotificationService.fetchLast10Notifications(walletId);
            res.status(200).json(
                {
                    status: 'success',
                    data: notifications
                }
            );
        }catch(error){
            res.status(500).json({error: (error as Error).message});
        }
    }

    static async adminFetchAllNotifications(req: Request, res: Response){
        try{
           

            const notifications = await NotificationService.adminFetchAllNotifications();
            res.status(200).json({
                status: 'success',
                data: notifications
            });
        }catch(error){
            res.status(500).json({error: (error as Error).message});
        }
    }
}
export default NotificationController;