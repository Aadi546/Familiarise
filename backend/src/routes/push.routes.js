import { Router } from 'express';
import { getPushPublicKey, subscribePush } from '../controllers/push.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const pushRouter = Router();

pushRouter.get('/push/public-key', asyncHandler(getPushPublicKey));
pushRouter.post('/push/subscribe', asyncHandler(subscribePush));
