import mongoose, { Document, Schema } from "mongoose";
import { BlobLike, ethers } from "ethers";
import { generateReferralCode } from '../utils/referral';

interface IReferralEarning {
    amount: number;
    fromUser: Schema.Types.ObjectId;
    purchaseAmount: number;
    earnedAt: Date;
}

export interface IUser extends Document {
    walletAddress: string;
    firstName: string;
    lastName: string;
    email?: string; // Optional email instead of required
    referralCode: string;
    referredBy?: Schema.Types.ObjectId;
    referralCount: number;
    commissionBalance: number;
    totalCommissionEarned: number;
    totalReferralEarnings: number;
    nonce: string; // Used for wallet signature verification
    role: 'user' | 'admin';
    isActive: boolean;
    isUpdated: boolean;
    createdAt: Date;
    updatedAt: Date;
    verifySignature(signature: string, message: string): Promise<boolean>;
    refreshNonce():Promise<IUser>;
}

const userSchema = new Schema({
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        validate: {
            validator: async function(value) {
                if (!value) return true; // Allow empty/null values
                
                // Check for duplicates only if email is provided
                const existingUser = await this.constructor.findOne({ 
                    email: value, 
                    _id: { $ne: this._id } 
                });
                return !existingUser;
            },
            message: 'Email already exists'
        }
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    referralCode: {
        type: String,
        unique: true
    },
    nonce: {
        type: String,
        default: () => Math.floor(Math.random() * 1000000).toString() // Random nonce for authentication
    },
    referredBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    referralCount: {
        type: Number,
        default: 0
    },
    commissionBalance: {
        type: Number,
        default: 0
    },
    totalCommissionEarned: {
        type: Number,
        default: 0
    },
    totalReferralEarnings: {
        type: Number,
        default: 0
    },
    isUpdated:{
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Generate referral code if it doesn't exist
userSchema.pre('save', async function(next) {
    if (this.referralCode) {
        return next();
    }
    
    // Generate a unique referral code
    this.referralCode = await generateReferralCode();
    next();
});

// Update total referral earnings when referralEarnings changes


// Regenerate nonce after each successful authentication
userSchema.methods.refreshNonce = function() {
    this.nonce = Math.floor(Math.random() * 1000000).toString();
    return this.save();
};

// Method to verify wallet signature
userSchema.methods.verifySignature = async function(signature: string, message: string): Promise<boolean> {
  
    try {
        // Verify that the message was signed by the wallet owner
        const recoveredAddress = ethers.verifyMessage(message, signature);
        return recoveredAddress.toLowerCase() === this.walletAddress.toLowerCase();
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
};

export const User = mongoose.model<IUser>('User', userSchema);