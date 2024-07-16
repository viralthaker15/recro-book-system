import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const userResolver = {
  reviews: async (parent: any) =>
    await prisma.review.findMany({ where: { userId: parent.id } }),
};

export default userResolver;
