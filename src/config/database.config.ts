import mongoose from  'mongoose';
import {logger } from '../utils/logger';
import dotenv from 'dotenv';
import path from 'path';
import { AppError } from '../utils/appError';


export const connectDB = async() : Promise<void> => {


    try {

        const uri = process.env.MONGODB_URI;

        if(!uri){
            throw new Error('Mango DB is not defined in ENV')
        }
        
        const conn = await mongoose.connect(uri , {
            maxPoolSize:100,
            minPoolSize: 10, 
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
        })

        logger.info(`MONGO DB connected ${conn.connection.host}`);
    } catch (error) {
        logger.error('Mongo DB error: ' , error);
        process.exit(1);
    }
}