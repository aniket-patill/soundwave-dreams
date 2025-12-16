import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'server.log');
const log = (message) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] [AUTH] ${message}\n`);
};

export const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      log(`Auth Failed: No token provided. Header: ${req.headers.authorization}`);
      return res.status(401).json({ error: 'Not authorized, no token provided' });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // log(`Token Decoded ID: ${decoded.id}`);

      // Get user from token
      const user = await User.findById(decoded.id);
      if (!user) {
        log(`Auth Failed: User not found for ID: ${decoded.id}`);
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = user;
      next();
    } catch (err) {
      log(`Token verification failed: ${err.message}`);
      return res.status(401).json({ error: 'Not authorized, token invalid' });
    }

  } catch (error) {
    log(`Auth middleware unexpected error: ${error.message}`);
    res.status(401).json({ error: 'Not authorized, token invalid' });
  }
};
