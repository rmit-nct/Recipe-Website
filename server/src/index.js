import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required but not set in the environment');
}

// Node's built-in DNS resolver can fail to pick up the OS's real DNS
// servers on machines with multiple virtual/VPN network adapters,
// defaulting to 127.0.0.1 and breaking the SRV lookup mongodb+srv://
// URIs depend on (ECONNREFUSED querySrv). Force known-good resolvers.
dns.setServers(['8.8.8.8', '1.1.1.1']);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
