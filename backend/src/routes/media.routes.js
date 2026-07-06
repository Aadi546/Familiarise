import { Router } from 'express';
import { createSignedUpload, getMediaStatus } from '../controllers/media.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const mediaRouter = Router();

mediaRouter.get('/media/status', asyncHandler(getMediaStatus));
mediaRouter.post('/media/upload-url', asyncHandler(createSignedUpload));
