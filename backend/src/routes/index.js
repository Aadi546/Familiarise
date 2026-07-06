import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { familiesRouter } from './families.routes.js';
import { mediaRouter } from './media.routes.js';
import { messagesRouter } from './messages.routes.js';
import { noticesRouter } from './notices.routes.js';
import { getSupabaseKeyInfo, isSupabaseConfigured } from '../config/env.js';

export const apiRouter = Router();

apiRouter.get('/health', (req, res) => {
  res.json({ ok: true, service: 'family-hub-api' });
});

apiRouter.get('/debug/config', (req, res) => {
  res.json({
    supabaseConfigured: isSupabaseConfigured,
    supabaseKey: getSupabaseKeyInfo()
  });
});

apiRouter.use(authRouter);
apiRouter.use(familiesRouter);
apiRouter.use(messagesRouter);
apiRouter.use(noticesRouter);
apiRouter.use(mediaRouter);
