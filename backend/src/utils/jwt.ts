import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const expiresIn = config.jwt.expiresIn || '7d';
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: expiresIn as string | number,
  } as SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
};
