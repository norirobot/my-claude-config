import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'express-async-errors';
import { tutorRoutes } from './routes/tutors';
import { authRoutes } from './routes/auth';
import { bookingRoutes } from './routes/bookings';
import { chatRoutes } from './routes/chat';
import { dashboardRoutes } from './routes/dashboard';
import surveyRoutes from './routes/survey';
import situationsRoutes from './routes/situations';
import voiceRoutes from './routes/voice';
import { errorHandler } from './middleware/errorHandler';
import { initDatabase } from './database/init';
import { initSituationsTables, seedSituationsData } from './database/init-situations';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.static('../frontend/public'));

app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/situations', situationsRoutes);
app.use('/api/voice', voiceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

async function startServer() {
  try {
    await initDatabase();
    console.log('✅ Database initialized');
    
    // 상황별 학습 테이블 초기화
    initSituationsTables();
    seedSituationsData();
    console.log('✅ Situations system initialized');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();