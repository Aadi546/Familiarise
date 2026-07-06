import { Router } from 'express';
import { listFamilies } from '../controllers/families.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const familiesRouter = Router();

familiesRouter.get('/families/:userId', asyncHandler(listFamilies));
