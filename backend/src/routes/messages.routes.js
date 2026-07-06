import { Router } from 'express';
import { listMessages, postMessage, postReaction, removeMessage } from '../controllers/messages.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const messagesRouter = Router();

messagesRouter.get('/messages/:familyId', asyncHandler(listMessages));
messagesRouter.post('/messages', asyncHandler(postMessage));
messagesRouter.post('/messages/:messageId/reactions', asyncHandler(postReaction));
messagesRouter.delete('/messages/:messageId', asyncHandler(removeMessage));
