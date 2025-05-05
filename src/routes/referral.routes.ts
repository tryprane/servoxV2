import express from "express";
import { ReferralController } from "../controllers/referral.controller";
import { authenticate } from "../middleware/protect.middleware";

const referRouter = express.Router();

referRouter.post('/validate' , ReferralController.validateReferralCode);
referRouter.get('/stats' , authenticate , ReferralController.getReferralStats);