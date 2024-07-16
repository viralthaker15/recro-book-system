import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  AuthenticationError,
  ForbiddenError,
  ResourceNotFoundError,
} from 'src/errors';
import { ContextType } from 'src/type.def';
import { RegisterInput, validateInput } from 'src/validators';
import { checkAuth, generateTokens } from '../utils/auth';

const prisma = new PrismaClient();
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const mutationResolver = {
  refreshToken: async (_: any, { token }: { token: string }) => {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as {
        userId: number;
      };
      let user = null;
      if (decoded)
        user = await prisma.user.findUnique({
          where: { id: decoded.userId },
        });
      if (!user) {
        throw new AuthenticationError('User not found');
      }
      return generateTokens(user);
    } catch (err) {
      throw new AuthenticationError('Invalid refresh token');
    }
  },
  register: async (
    _: any,
    args: { username: string; email: string; password: string },
  ) => {
    // Check if the username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: args.username }, { email: args.email }],
      },
    });

    if (existingUser) throw new Error('Username or email already exists!');

    // Validation
    await validateInput(RegisterInput, args);

    const password = await bcrypt.hash(args.password, 10);

    const user = await prisma.user.create({ data: { ...args, password } });
    return generateTokens(user);
  },
  login: async (_: any, args: { email: string; password: string }) => {
    const user = await prisma.user.findUnique({
      where: { email: args.email },
    });
    if (!user) throw new ResourceNotFoundError('No user found');
    const valid = await bcrypt.compare(args.password, user.password);
    if (!valid) throw new Error('Invalid password');
    return generateTokens(user);
  },
  addBook: async (
    _: any,
    args: { title: string; author: string; publishedYear: number },
    context: ContextType,
  ) => {
    checkAuth(context);
    return await prisma.book.create({ data: { ...args } });
  },

  addReview: async (
    _: any,
    args: { bookId: string; rating: number; comment: string },
    context: ContextType,
  ) => {
    checkAuth(context);
    return await prisma.review.create({
      data: {
        ...args,
        bookId: Number(args.bookId),
        userId: context.user?.id,
      },
    });
  },
  updateReview: async (
    _: any,
    args: { reviewId: string; rating?: number; comment?: string },
    context: ContextType,
  ) => {
    checkAuth(context);
    const review = await prisma.review.findUnique({
      where: { id: Number(args.reviewId) },
    });
    if (!review) throw new ResourceNotFoundError('No review found');
    else if (review?.userId !== context.user?.id)
      throw new ForbiddenError('Not authorized');
    return await prisma.review.update({
      where: { id: Number(args.reviewId) },
      data: {
        rating: args.rating || review.rating,
        comment: args.comment || review.comment,
      },
    });
  },
  deleteReview: async (
    _: any,
    args: { reviewId: string },
    context: ContextType,
  ) => {
    checkAuth(context);
    const review = await prisma.review.findUnique({
      where: { id: Number(args.reviewId) },
    });
    if (!review) throw new ResourceNotFoundError('No review found');
    if (review?.userId !== context.user.id)
      throw new ForbiddenError('Not authorized');
    return await prisma.review.delete({
      where: { id: Number(args.reviewId) },
    });
  },
};

export default mutationResolver;
