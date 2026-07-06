import { Router } from 'express';
import { listMessages, postMessage } from '../controllers/messages.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const messagesRouter = Router();

messagesRouter.get('/messages/:familyId', asyncHandler(listMessages));
messagesRouter.post('/messages', asyncHandler(postMessage));
