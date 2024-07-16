import { PrismaClient } from '@prisma/client';
import { ResourceNotFoundError } from 'src/errors';
import { ContextType } from 'src/type.def';
import { checkAuth } from '../utils/auth';

const prisma = new PrismaClient();

const queryResolver = {
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
};

export default queryResolver;
