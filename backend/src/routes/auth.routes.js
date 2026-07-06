import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login } from '../controllers/auth.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many login attempts. Please wait a few minutes and try again.'
    }
  }
});

authRouter.post('/login', loginLimiter, asyncHandler(login));
