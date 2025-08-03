import express from 'express';

import cors from 'cors';
import commpression from 'compression'
import morgan from 'morgan';
import helmet from 'helmet';

import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

export const configureExpress = (app : express.Application): void => {
    app.use(helmet());

    if(process.env.NODE_ENV === 'production') {
        app.set('trust proxy' , 1);
    }
    app.use(cors ({
        origin: process.env.CORS_ORIGIN?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Request-ID'],
    credentials: true,
    maxAge: 86400 // 24 hours
    }))

    app.use(mongoSanitize());
    const limiter = rateLimit({
        windowMs: 15*60*1000,
        max: 100, 
        message: 'TOO Many request from a particular IP'
    })

    app.use('/api' , limiter)

    app.use(commpression());

    app.use(express.json({
        limit: '10kb'
    }));
    app.use(express.urlencoded({
        extended: true,
        limit: '10kb'
    }))

    if(process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    }
}