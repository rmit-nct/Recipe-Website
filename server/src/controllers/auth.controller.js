import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const sendTokenCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ 
        error: { code: 'CONFLICT', message: 'Username or email already in use' } 
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash });

    sendTokenCookie(res, user._id);
    return res.status(201).json({ data: { user: user.toSafeObject() } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ 
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input data' } 
      });
    }
    return res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } 
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        error: { code: 'UNAUTHENTICATED', message: 'Invalid credentials' } 
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ 
        error: { code: 'UNAUTHENTICATED', message: 'Invalid credentials' } 
      });
    }

    sendTokenCookie(res, user._id);
    return res.status(200).json({ data: { user: user.toSafeObject() } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ 
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input data' } 
      });
    }
    return res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } 
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  return res.status(200).json({ data: { ok: true } }); // Updated to match API_CONTRACT
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        error: { code: 'NOT_FOUND', message: 'User not found' } 
      });
    }
    return res.status(200).json({ data: { user: user.toSafeObject() } });
  } catch (err) {
    return res.status(500).json({ 
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } 
    });
  }
};