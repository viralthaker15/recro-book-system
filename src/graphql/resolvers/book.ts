import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const bookResolver = {
  reviews: async (parent: any) =>
    await prisma.review.findMany({ where: { bookId: parent.id } }),
};

export default bookResolver;
