import { Router } from "express";
import NotificationController from "../controllers/notification.controller";
import { authenticate, requireAdmin } from "../middleware/protect.middleware";
const notificationRouter = Router();

notificationRouter.get('/:walletId', authenticate, NotificationController.fetchLast10Notifications);

notificationRouter.get('/admin/all', authenticate, requireAdmin, NotificationController.adminFetchAllNotifications);

export default notificationRouter;
