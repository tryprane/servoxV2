import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model";

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

const JWT_SECRET = process.env.JWT_SECRET || 'key';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                message: 'Authentication Required, No token Provided'
            });
            return;
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({ message: 'Authentication required. Invalid token format.' });
            return;
        }

        const decoded: any = jwt.verify(token, JWT_SECRET);
         
        const user = await User.findById(decoded.id);
        
        if (!user) {
            res.status(401).json({ message: 'User not found.' });
            return;
        }

        req.user = {
            id: user._id,
            walletAddress: user.walletAddress,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        };
        
        next();
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({
                message: 'Invalid Token'
            });
            return;
        }
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Token expired.' });
            return;
        }
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Server error' });
        return;
    }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({
            message: 'Authentication Required.'
        });
        return;
    }

    if (req.user.role !== 'admin') {
        res.status(403).json({
            message: 'Admin access Required'
        });
        return;
    }
    
    // Don't forget to call next() if the user is an admin
    next();
};

export const generateToken = (user: any): string => {
    return jwt.sign(
        { 
            id: user._id, 
            walletAddress: user.walletAddress,
            role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' } // Token expires in 24 hours
    );
};