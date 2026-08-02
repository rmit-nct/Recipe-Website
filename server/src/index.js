import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT || 5000;

dns.setServers(['8.8.8.8', '1.1.1.1']);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
