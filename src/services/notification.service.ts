import Notification from "../models/notifications.model";

class NotificationService {
    static async fetchLast10Notifications(walletId: string){
        const notifications = await Notification.find({walletId}).sort({createdAt: -1}).limit(5);
        return notifications;
    }

    static async adminFetchAllNotifications(){
        const notifications = await Notification.find().sort({createdAt: -1}).limit(20);
        return notifications;
    }
}

export default NotificationService;