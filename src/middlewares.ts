import { PrismaClient } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import jwt from 'jsonwebtoken';
import { ValidationError } from './errors';

const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new PrismaClient();

/* === Input Validation Middleware === */
const validationMiddleware = async (inputClass: any, args: any) => {
  const errors = await validate(plainToInstance(inputClass, args));
  if (errors.length > 0) {
    throw new ValidationError('Input validation error');
  }
};

/* === verify incoming request token & attach User === */
const getUserMiddleware = async (token: string) => {
  try {
    let user = null;
    let userId = null;
    if (token) userId = jwt.verify(token, JWT_SECRET);
    if (userId)
      user = await prisma.user.findUnique({ where: { id: userId.userId } });
    return user;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (err instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid Token');
    }

    return null;
  }
};

export { getUserMiddleware, validationMiddleware };
