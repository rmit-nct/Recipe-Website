import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import recipeRoutes from './routes/recipe.routes.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/recipes', recipeRoutes);

export default app;
