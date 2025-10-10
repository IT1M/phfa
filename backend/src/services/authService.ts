import { pool } from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, 'user')
       RETURNING id, email, role`,
      [email, hashedPassword]
    );

    return result.rows[0];
  }

  async login(email: string, password: string) {
    const result = await pool.query(
      `SELECT id, email, password_hash, role FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    await pool.query(
      `UPDATE users SET refresh_token = $1 WHERE id = $2`,
      [refreshToken, user.id]
    );

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
  }

  async refreshToken(refreshToken: string) {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

    const result = await pool.query(
      `SELECT id, email, role FROM users WHERE id = $1 AND refresh_token = $2`,
      [decoded.id, refreshToken]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid refresh token');
    }

    const user = result.rows[0];

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return { accessToken };
  }
}
