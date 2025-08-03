import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/protect.middleware';

const auth = express.Router();

// Initiate authentication with wallet address
auth.post('/get-in', AuthController.getIN);

auth.put("/update-profile" ,authenticate, AuthController.updateProfile)

auth.get("/getMe" , authenticate, AuthController.getME)



// Verify wallet signature and complete authentication
auth.post('/verify', AuthController.verfiyWalletSignature);

export default auth;
