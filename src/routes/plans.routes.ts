import { PlanController } from "../controllers/plans.controller";
import { Router } from "express";

const plansRouter = Router();

plansRouter.get('/available' , PlanController.getAvaialblePlans);
plansRouter.get('/upcoming' , PlanController.getUpcomingPlans)
plansRouter.get('/expired' , PlanController.getExpiredPlans)
plansRouter.get('/counting' , PlanController.getPlanCounting)

export default plansRouter;