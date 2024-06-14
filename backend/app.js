import express, { json } from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import indexRouter from './routes/index.js';
// import usersRouter from './routes/users.js';


const app = express();
connectDB()

app.use(cors());
app.use(json());

app.use('/', indexRouter);
//app.use('/user', usersRouter);

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
