import express from 'express';
import http from 'node:http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { apiRouter } from './routes/index.js';
import { env } from './config/env.js';
import { corsOrigin } from './config/cors.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { attachSocketServer } from './socket.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: corsOrigin, credentials: false }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use('/api', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

const httpServer = http.createServer(app);
attachSocketServer(httpServer);

httpServer.listen(env.port, () => {
  console.log(`Family Hub API listening on http://localhost:${env.port}`);
});
