import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

dotenv.config();
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import adminRouter from './routes/admin.js';

const app = express();
connectDB();

app.use(cors({ origin: "*",credentials: true, }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// API Routes
app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/admin', adminRouter);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
