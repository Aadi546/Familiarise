import { Router } from 'express';
import { listNotices, postNotice, removeNotice } from '../controllers/notices.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const noticesRouter = Router();

noticesRouter.get('/notices/:familyId', asyncHandler(listNotices));
noticesRouter.post('/notices', asyncHandler(postNotice));
noticesRouter.delete('/notices/:noticeId', asyncHandler(removeNotice));
