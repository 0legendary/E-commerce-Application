import express, { json } from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import adminRouter from './routes/admin.js'

const app = express();
connectDB()

app.use(cors());
app.use(express.json());

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/admin', adminRouter);

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
