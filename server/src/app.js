import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import recipeRoutes from './routes/recipe.routes.js';
import authRoutes from './routes/auth.routes.js'; // 1. Import auth routes

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser()); // This is already here, perfectly set up!

app.get('/api/health', (req, res) => {
  res.json({ data: { ok: true } });
});

app.use('/api/auth', authRoutes); // 2. Mount auth routes BEFORE recipes
app.use('/api/recipes', recipeRoutes);

export default app;