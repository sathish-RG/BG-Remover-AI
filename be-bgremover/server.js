import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/mongodb.js';
import userRouter from './routes/userRoutes.js';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB(); // Wait for DB connection

    const app = express();

// Capture raw body for Clerk Webhooks
app.use('/api/user/webhooks', express.raw({ type: '*/*' }));

// Then for other routes, parse JSON
app.use(express.json());
app.use(cors());

// API routes
app.get('/', (req, res) => res.send('API Working'));
app.use('/api/user', userRouter);

    app.use('/api/user', userRouter);

    app.listen(PORT, () => console.log(`Server Running On Port ${PORT}`));
  } catch (err) {
    console.error('Error starting server:', err.message);
    process.exit(1);
  }
};

startServer();
