import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export const adminLogin = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (username === ENV.ADMIN_USERNAME && password === ENV.ADMIN_PASSWORD) {
    const token = jwt.sign(
      { username, role: 'admin' },
      ENV.JWT_SECRET,
      { expiresIn: '12h' }
    );
    return res.json({
      success: true,
      data: {
        token,
        username,
        role: 'admin'
      }
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid management credentials'
  });
};
