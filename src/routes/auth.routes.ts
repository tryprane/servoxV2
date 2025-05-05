import express from 'express';
import { AuthController } from '../controllers/auth.controller';

const auth = express.Router();

// Initiate authentication with wallet address
auth.post('/login', AuthController.getIN);

// Verify wallet signature and complete authentication
auth.post('/verify', AuthController.verfiyWalletSignature);

export default auth;
