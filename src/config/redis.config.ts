import {Redis } from 'ioredis'
import {logger } from '../utils/logger'

import dotenv from 'dotenv'
import { error } from 'console';

dotenv.config();

console.log("Environment Variables loaded");
// console.log("REDIS_HOST: ", process.env.REDIS_HOST);

const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: 3 , 
    retryStrategy(times ){
        const delay = Math.min(times * 50 , 2000);
        return delay;
    }
  




})

redisClient.on('error' , (error) => {
    logger.error('Redis Connection error :' , error);
})

redisClient.on('connect' , () => {
    logger.info("Redis Connected Succesfully");
})


export {redisClient};