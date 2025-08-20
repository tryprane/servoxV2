import express , {Request , Response} from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from "./config/database.config";
import path from 'path';
import { configureExpress } from './config/express.config';
import { logger } from './utils/logger';
import admin from './routes/admin.routes';
import referRouter from './routes/referral.routes';
import auth from './routes/auth.routes';
import nodeOrder from './routes/nodeOrder.routes';
import plansRouter from './routes/plans.routes';
import paymentRouter from './routes/payment.routes';
import notificationRouter from './routes/notification.routes';



dotenv.config({path: path.join(__dirname, '../.env')});

const app = express();
const port = 5000;


configureExpress(app);

app.use(cookieParser());

connectDB();

app.use('/api/admin', admin);
app.use('/api/notification', notificationRouter);
app.use('/api/referral', referRouter);
app.use('/api/payments', paymentRouter);

app.use('/api/auth', auth);
app.use('/api/plans' ,plansRouter);

app.use('/api/nodeorder', nodeOrder);


app.get('/health' , (req: Request , res: Response) => {
    res.status(200).json({
        status: 'ok',
        time: new Date().toISOString(),
        message: "CI/CD is Working"
    })
})





app.listen(port , '0.0.0.0' , () => {
    logger.info("Server Running At 3000 Port");
    
}
)


