import winston from "winston";
import path from "path";
import fs from "fs";


const logDir = 'logs';

if(!fs.existsSync(logDir)){
    fs.mkdirSync(logDir);
}

const errorStackFormat = winston.format(info => {
    if(info.level === 'error' && info.error instanceof Error){
        return Object.assign({} , info, {
            stack: info.error.stack,
            message: info.error.message
        })
    }

    return info;
    
})

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      errorStackFormat(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    ),
    defaultMeta: { service: 'your-service-name' }, // Add your service name here
    transports: [
      new winston.transports.File({ 
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }),
      new winston.transports.File({ 
        filename: path.join(logDir, 'combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    ],
    exitOnError: false
  });
  
  // Add console transport for non-production environments
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
        )
      )
    }));
  }