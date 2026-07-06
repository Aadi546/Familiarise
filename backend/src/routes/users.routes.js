import { Router } from 'express';
import { putProfile } from '../controllers/users.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const usersRouter = Router();

usersRouter.put('/users/:userId/profile', asyncHandler(putProfile));
