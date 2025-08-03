import { NullExpression } from "mongoose";
import { AuthService } from "../services/auth.service";
import { Request , Response , NextFunction } from "express";
import { generateToken } from "../middleware/protect.middleware";


export class AuthController{


    static async getIN(req: Request , res: Response , next : NextFunction){

        try {

            // console.log(req)
            const {walletAddress} = req.body;



            if(!walletAddress){
                res.status(400).json({ message: 'Wallet address is required' });
                return
            }

            const {nonce , user , isUpdated } = await AuthService.getIN(walletAddress);


            res.status(200).json({ 
                message: `Sign this message to authenticate with our application. Nonce: ${nonce}`,
                nonce,
                isUpdated
            });
            return

        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error instanceof Error ? error.message: 'Registration Failed'
            })
        }

    }

    static getME(req: Request , res: Response){
        try {

            if(!req.user){
                throw new Error
            }
            res.status(200).json({
                status: 'success',
                data: req.user
            })
        } catch (error) {
            res.status(400).json({
                status: 'failed',
                message: error
            })
        }
    }



    static async updateProfile(req: Request , res: Response , next: NextFunction) {

        try {
            const userId = req.params.userId || req.user?.id; // Get userId from params or authenticated user
            
            if (!userId) {
               res.status(400).json({ 
                success: false, 
                message: 'User ID is required' 
              });
            
            }
            
            // Extract profile data from request body
            const { firstName, lastName, email , referralCode } = req.body;
            
            // Call the service method to update the profile
            const updatedUser = await AuthService.updateProfile(userId, {
              firstName,
              lastName,
              email,
              referralCode
            });
            
            // If user not found
            if (!updatedUser) {
              res.status(404).json({
                success: false,
                message: 'User not found'
              });
              return
            }
            
            // Return success response with updated user data
             res.status(200).json({
              success: true,
              message: 'Profile updated successfully',
              data: {
                userId: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email
              }
            });
            return
          } catch (error: any) {
            next(error);
          }
        
    }

    static async verfiyWalletSignature(req: Request , res: Response  , next: NextFunction  ) {
        try {
            const {walletAddress , signature} = req.body;

            if (!walletAddress || !signature) {
                res.status(400).json({ 
                    message: 'Wallet address and signature are required' 
                });
                return
            }
            const {valid , user} = await AuthService.verifySignature(walletAddress, signature);

            if (!valid || !user) {
                 res.status(401).json({ message: 'Invalid signature' });
                 return
            }

            const token = generateToken(user);
            
             res.status(200).json({
                message: 'Authentication successful',
                token,
                user: {
                    id: user._id,
                    walletAddress: user.walletAddress,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    referralCode: user.referralCode,
                    role: user.role
                }
            });
            return
        } catch (error) {
            next(error)
        }
    }
}