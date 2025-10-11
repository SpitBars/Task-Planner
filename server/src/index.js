import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import memorystore from 'memorystore';
import authRoutes from './routes/auth.js';
import eventsRoutes from './routes/events.js';

const MemoryStore = memorystore(session);

const app = express();

const {
  PORT = 4000,
  SESSION_SECRET,
  FRONTEND_ORIGIN = 'http://localhost:5173'
} = process.env;

if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be provided');
}

app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true
  })
);

app.use(
  session({
    store: new MemoryStore({ checkPeriod: 1000 * 60 * 60 * 24 }),
    name: 'taskplanner.sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
);

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/api/events', eventsRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
