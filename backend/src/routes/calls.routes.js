import { Router } from 'express';
import { listIceServers } from '../controllers/calls.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const callsRouter = Router();

callsRouter.get('/calls/ice-servers', asyncHandler(listIceServers));
