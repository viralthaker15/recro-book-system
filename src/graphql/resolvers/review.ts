import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const reviewResolver = {
  user: async (parent: any) =>
    await prisma.user.findUnique({ where: { id: parent.userId } }),
  book: async (parent: any) =>
    await prisma.book.findUnique({ where: { id: parent.bookId } }),
};

export default reviewResolver;
