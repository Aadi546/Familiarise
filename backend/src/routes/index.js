import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { callsRouter } from './calls.routes.js';
import { familiesRouter } from './families.routes.js';
import { mediaRouter } from './media.routes.js';
import { messagesRouter } from './messages.routes.js';
import { noticesRouter } from './notices.routes.js';
import { pushRouter } from './push.routes.js';
import { remindersRouter } from './reminders.routes.js';
import { usersRouter } from './users.routes.js';
import { getSupabaseKeyInfo, isSupabaseConfigured } from '../config/env.js';

export const apiRouter = Router();

apiRouter.get('/health', (req, res) => {
  res.json({ ok: true, service: 'family-hub-api' });
});

if (process.env.NODE_ENV !== 'production') {
  apiRouter.get('/debug/config', (req, res) => {
    res.json({
      supabaseConfigured: isSupabaseConfigured,
      supabaseKey: getSupabaseKeyInfo()
    });
  });
}

apiRouter.use(authRouter);
apiRouter.use(callsRouter);
apiRouter.use(familiesRouter);
apiRouter.use(messagesRouter);
apiRouter.use(noticesRouter);
apiRouter.use(mediaRouter);
apiRouter.use(remindersRouter);
apiRouter.use(usersRouter);
apiRouter.use(pushRouter);
