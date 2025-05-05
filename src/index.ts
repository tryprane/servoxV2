import express , {Request , Response} from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from "./config/database.config";
import path from 'path';
import { configureExpress } from './config/express.config';
import { logger } from './utils/logger';


dotenv.config({path: path.join(__dirname, '../.env')});

const app = express();
const port = 3000;


configureExpress(app);

app.use(cookieParser());

connectDB();


app.get('/health' , (req: Request , res: Response) => {
    res.status(200).json({
        status: 'ok',
        time: new Date().toISOString()
    })
})





app.listen(port , '0.0.0.0' , () => {
    logger.info("Server Running At 3000 Port");
    
}
)


