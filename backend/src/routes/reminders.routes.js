import { Router } from 'express';
import { listReminders, postReminder } from '../controllers/reminders.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const remindersRouter = Router();

remindersRouter.get('/families/:familyId/reminders', asyncHandler(listReminders));
remindersRouter.post('/families/:familyId/reminders', asyncHandler(postReminder));
