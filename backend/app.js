import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
// import path from 'path';

dotenv.config();
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import adminRouter from './routes/admin.js';

const app = express();
connectDB();

// // Resolve __dirname for ES modules
// const __dirname = path.resolve();

// // Static middleware for serving React build files
// app.use(express.static(path.join(__dirname, '../frontend/build')));

app.use(cors({ origin: "*",credentials: true, }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// API Routes
app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/admin', adminRouter);

// // Catch-all handler to serve React's index.html file for any unknown routes
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
// });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
