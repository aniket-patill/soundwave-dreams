import 'dotenv/config';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './socket.js';

const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

const server = http.createServer(app);

// Initialize Socket.io
// Same allowed origins as app.js
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [])
];

initSocket(server, allowedOrigins);

server.listen(PORT, () => {
  console.log(`🚀 Cloudly API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
