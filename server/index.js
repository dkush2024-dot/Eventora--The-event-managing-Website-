const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes')
const startStatusUpdateCron = require('./utils/updateEventStatusCron');
const emailReminderCronJob = require('./utils/eventReminderCronJob');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const roleBasedRateLimiter = require('./middleware/roleBasedRateLimiter');
const ipBasedRateLimiter = require('./middleware/ipBasedRateLimiter');
const publicEvents = require('./routes/publicEvents');
const {protect} = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
connectDB(); 

startStatusUpdateCron();
emailReminderCronJob();

// Security middleware
app.use(helmet());

// CORS configuration — supports comma-separated origins for production
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3001')
  .split(',')
  .map(origin => origin.trim());

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());

// Health check route — BEFORE auth middleware so deployment platforms can ping it
app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Eventora API',
      timestamp: new Date().toISOString(),
    });
});

// Public routes (no auth required)
app.use('/api/auth', ipBasedRateLimiter, authRoutes);
app.use('/api/publicEvents', ipBasedRateLimiter, publicEvents);

// Protected routes (auth required)
app.use(protect);  
app.use(roleBasedRateLimiter); // role based rate limiter for protected routes

app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registration', registrationRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
});
