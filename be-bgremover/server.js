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

    // Special raw body parser only for webhooks
    app.use('/api/user/webhooks', express.raw({ type: 'application/json' }));

    // Normal JSON parser for other routes
    app.use(express.json());
    app.use(cors());

    // API routes
    app.get('/', (req, res) => res.send('API Working'));
    app.use('/api/user', userRouter);

    app.listen(PORT, () => console.log(`Server Running On Port ${PORT}`));
  } catch (err) {
    console.error('Error starting server:', err.message);
    process.exit(1);
  }
};

startServer();
