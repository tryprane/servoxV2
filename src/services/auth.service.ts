import { ethers } from "ethers";
import { User , IUser } from "../models/user.model";
import { logger } from "../utils/logger";


export class AuthService{

    static async getIN(walletAddress:string):Promise<{nonce : string , user: IUser| null , isUpdated: boolean}>{
    
       const checkSum = ethers.getAddress(walletAddress);
    
       let user = await User.findOne({
        walletAddress: checkSum.toLowerCase()
       });
    
       if(!user) {
        user = new User({
            walletAddress: checkSum.toLowerCase(),
            firstName: 'Anonymous' ,
            lastName: 'User'
        })
    
        await user.save();
       }
    
       return {
        nonce: user.nonce,
        user,
        isUpdated: user.isUpdated
       }
    }
    
    static  async verifySignature (walletAddress: string , signature: string): Promise<{valid: boolean , user: IUser | null}>{
    
        const user = await User.findOne({
            walletAddress: walletAddress.toLowerCase()
        })
    
        if(!user) {
            return {valid: false , user: null};
        }
    
        const message = `Sign this message to authenticate with our application. Nonce: ${user.nonce}`;
        
        // Verify signature
        const isValid = await user.verifySignature(signature, message);
        
        if (isValid) {
          // Update nonce for next login
          await user.refreshNonce();
        }
        
        return { valid: isValid, user };
      }

      static async updateProfile(
        userId: string,
        profileData: {
            firstName?:string;
            lastName?:string;
            email?: string;
        }) {
        
        try {
             const user = await User.findById(userId);

        if(!user ){
            return null;
        }

        if(user.isUpdated){
            return null
        }


        if(profileData.firstName !== undefined){
            user.firstName = profileData.firstName;
        }

        if(profileData.lastName !== undefined){
            user.lastName = profileData.lastName
        }

        if (profileData.email !== undefined) {
            // Optional validation for email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (profileData.email && !emailRegex.test(profileData.email)) {
                throw new Error('Invalid email format');
            }
            user.email = profileData.email;
        }
        

        user.isUpdated = true;
        // Save the updated user

        await user.save();

        
        
        return user;

        } catch (error) {
            logger.error('Error Updating the profile' , error);
            throw error;
        }

       

      }
      
    }