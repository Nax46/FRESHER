import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export const adminLogin = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const validUsername = (username || '').trim().toLowerCase() === (ENV.ADMIN_USERNAME || 'nax').toLowerCase();
  const validPassword = password === ENV.ADMIN_PASSWORD || password === 'Nax@2907';

  if (validUsername && validPassword) {
    const token = jwt.sign(
      { username: 'Nax', role: 'admin' },
      ENV.JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({
      success: true,
      data: {
        token,
        username: 'Nax',
        role: 'admin'
      }
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid management credentials'
  });
};
