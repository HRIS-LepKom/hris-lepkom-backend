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
import recruitmentRoutes    from './modules/recruitment/recruitment.routes.js';
import asistenRoutes        from './modules/asisten/asisten.routes.js';
import calasRoutes          from './modules/calas/management/management.routes.js';
import materiRoutes         from './modules/materi/materi.routes.js';
import soalRoutes           from './modules/soal/soal.routes.js';
import soalCalasRoutes      from './modules/soalCalas/soalCalas.routes.js';
import questionCardRoutes   from './modules/questionCard/questionCard.routes.js';
import sessionRoutes        from './modules/ujian/session/session.routes.js';
import jawabanRoutes        from './modules/ujian/jawaban/jawaban.routes.js';
import jawabanAsistenRoutes from './modules/ujian/jawaban/jawabanAsisten.routes.js';
import penugasanRoutes      from './modules/penugasan/penugasan.routes.js';
import penilaianRoutes      from './modules/penilaian/penilaian.routes.js';
import announcementRoutes   from './modules/announcement/announcement.routes.js';
import dashboardRoutes      from './modules/dashboard/dashboard.routes.js';

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
app.use('/api/recruitment',  recruitmentRoutes);
app.use('/api/asisten',      asistenRoutes);
app.use('/api/calas',        calasRoutes);
app.use('/api/materi',       materiRoutes);
app.use('/api/soal',          soalRoutes);
app.use('/api/soal-calas',    soalCalasRoutes);
app.use('/api/question-card', questionCardRoutes);
app.use('/api/ujian/session',         sessionRoutes);
app.use('/api/ujian/jawaban',         jawabanRoutes);
app.use('/api/ujian/jawaban-asisten', jawabanAsistenRoutes);
app.use('/api/penugasan',             penugasanRoutes);
app.use('/api/penilaian',             penilaianRoutes);
app.use('/api/announcement',          announcementRoutes);
app.use('/api/dashboard',             dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;