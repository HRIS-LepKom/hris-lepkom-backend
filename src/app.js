import 'dotenv/config';
import express              from 'express';
import cors                 from 'cors';
import helmet               from 'helmet';
import compression          from 'compression';
import morgan               from 'morgan';
import cookieParser         from 'cookie-parser';
import connectDB            from './config/db.js';
import { sanitizer }        from './middlewares/sanitizer.middleware.js';
import notFound             from './middlewares/notFound.middleware.js';
import errorHandler         from './middlewares/errorHandler.js';
import asistenAuthRoutes    from './modules/auth/asisten/asistenAuth.routes.js';
import calasAuthRoutes      from './modules/auth/calas/calasAuth.routes.js';

const app = express();

app.use(helmet());
app.use(compression());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use('/api', cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS`));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sanitizer);

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB] Koneksi gagal:', err.message);
    next(new Error('Koneksi database gagal'));
  }
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth/asisten', asistenAuthRoutes);
app.use('/api/auth/calas',   calasAuthRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;