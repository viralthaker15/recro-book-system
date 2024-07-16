import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

export const resolvers = {
  Query: {
    getBooks: async () => await prisma.book.findMany(),
    getBook: async (_: any, args: { id: string }) =>
      await prisma.book.findUnique({ where: { id: Number(args.id) } }),
    getReviews: async (_: any, args: { bookId: string }) =>
      await prisma.review.findMany({ where: { bookId: Number(args.bookId) } }),
    getMyReviews: async (_: any, __: any, context: any) =>
      await prisma.review.findMany({ where: { userId: context.userId } }),
  },
  Mutation: {
    register: async (
      _: any,
      args: { username: string; email: string; password: string },
    ) => {
      const password = await bcrypt.hash(args.password, 10);
      const user = await prisma.user.create({ data: { ...args, password } });
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      return { token, user };
    },
    login: async (_: any, args: { email: string; password: string }) => {
      const user = await prisma.user.findUnique({
        where: { email: args.email },
      });
      if (!user) throw new Error('No user found');
      const valid = await bcrypt.compare(args.password, user.password);
      if (!valid) throw new Error('Invalid password');
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      return { token, user };
    },
    addBook: async (
      _: any,
      args: { title: string; author: string; publishedYear: number },
      context: any,
    ) => {
      if (!context.userId) throw new Error('Not authenticated');
      return await prisma.book.create({ data: { ...args } });
    },
    addReview: async (
      _: any,
      args: { bookId: string; rating: number; comment: string },
      context: any,
    ) => {
      if (!context.userId) throw new Error('Not authenticated');
      return await prisma.review.create({
        data: { ...args, bookId: Number(args.bookId), userId: context.userId },
      });
    },
    updateReview: async (
      _: any,
      args: { reviewId: string; rating?: number; comment?: string },
      context: any,
    ) => {
      if (!context.userId) throw new Error('Not authenticated');
      const review = await prisma.review.findUnique({
        where: { id: Number(args.reviewId) },
      });
      if (review?.userId !== context.userId) throw new Error('Not authorized');
      return await prisma.review.update({
        where: { id: Number(args.reviewId) },
        data: {
          rating: args.rating || review.rating,
          comment: args.comment || review.comment,
        },
      });
    },
    deleteReview: async (_: any, args: { reviewId: string }, context: any) => {
      if (!context.userId) throw new Error('Not authenticated');
      const review = await prisma.review.findUnique({
        where: { id: Number(args.reviewId) },
      });
      if (review?.userId !== context.userId) throw new Error('Not authorized');
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
