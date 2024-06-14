import { Router } from 'express';
import { getDB, Collections } from '../config/db.js';
import {authenticateToken} from '../middleware/authMiddleware.js';
const router = Router();



export default router;
