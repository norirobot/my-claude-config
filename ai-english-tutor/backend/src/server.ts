import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './database/init';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'AI English Tutor Backend is running!'
  });
});

// Simple test endpoints
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.get('/api/tutors', (req, res) => {
  res.json({
    tutors: [
      {
        id: 1,
        name: 'Jennifer AI',
        specialties: ['Conversation', 'Grammar'],
        rating: 4.9,
        hourly_rate: 0,
        bio: 'AI tutor specialized in conversational English',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b667331f?w=150&h=150&fit=crop&crop=face'
      }
    ]
  });
});

async function startServer() {
  try {
    await initDatabase();
    console.log('✅ Database initialized');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
      console.log(`🧑‍🎓 Tutors: http://localhost:${PORT}/api/tutors`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();