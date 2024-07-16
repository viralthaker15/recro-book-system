import { PrismaClient } from '@prisma/client';
import { AuthenticationError } from 'apollo-server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ForbiddenError, ResourceNotFoundError } from 'src/errors';
import { ContextType, UserType } from 'src/type.def';
import { RegisterInput, validateInput } from 'src/validators';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

/* === check if user is authenticated === */
/*
  - @auth will anyway check authentication
  - this fn to double-check [Alternative approach to directive]
*/
const checkAuth = (context: ContextType) => {
  if (!context.user) throw new AuthenticationError('Not authenticated');
};

const generateTokens = (user: UserType) => {
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
  return { token, refreshToken, user };
};

export const resolvers = {
  Query: {
    getBooks: async (_: any, { page = 1, limit = 10, search = '' }) => {
      const books = await prisma.book.findMany({
        where: search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { author: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
        skip: (page - 1) * limit,
        take: limit,
      });
      return books;
    },
    getBook: async (_: any, args: { id: string }) => {
      const book = await prisma.book.findUnique({
        where: { id: Number(args.id) },
      });
      if (!book) throw new ResourceNotFoundError('No book found');
      return book;
    },
    getReviews: async (_: any, { bookId, page = 1, limit = 10 }) => {
      return await prisma.review.findMany({
        where: { bookId: Number(bookId) },
        skip: (page - 1) * limit,
        take: limit,
      });
    },
    getMyReviews: async (_: any, __: any, context: ContextType) => {
      checkAuth(context);
      const reviews = await prisma.review.findMany({
        where: { userId: context.user.id },
      });
      return reviews;
    },
  },
  Mutation: {
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
  },
  User: {
    reviews: async (parent: any) =>
      await prisma.review.findMany({ where: { userId: parent.id } }),
  },
  Book: {
    reviews: async (parent: any) =>
      await prisma.review.findMany({ where: { bookId: parent.id } }),
  },
  Review: {
    user: async (parent: any) =>
      await prisma.user.findUnique({ where: { id: parent.userId } }),
    book: async (parent: any) =>
      await prisma.book.findUnique({ where: { id: parent.bookId } }),
  },
};
