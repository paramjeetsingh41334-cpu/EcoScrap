import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import scrapRoutes from './routes/scrap.routes.js';
import pickupRoutes from './routes/pickup.routes.js';
import auctionRoutes from './routes/auction.routes.js';
import marketplaceRoutes from './routes/marketplace.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import { errorHandler } from './middleware/error.js';

import traceRoutes from "./routes/trace.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import scrapLotRoutes from "./routes/scrapLot.routes.js";
import handoverRoutes from "./routes/handover.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";

const app = express();
app.use(helmet());
app.use(cors({origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials:true}));
app.use(express.json({limit:'1mb'}));
app.use(cookieParser());
app.use(rateLimit({windowMs:15*60*1000, max:500, standardHeaders:true, legacyHeaders:false}));

app.get('/api/health', (_,res)=>res.json({ok:true, service:'kabadiwala-api'}));
app.use('/api/auth', authRoutes);

app.use('/api/scrap', scrapRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use("/api/trace", traceRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/scrap-lots", scrapLotRoutes);
app.use("/api/handover", handoverRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/certificates", certificateRoutes);



app.use((_,res)=>res.status(404).json({success:false,message:'Route not found'}));
app.use(errorHandler);
export default app;
