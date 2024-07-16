import { PrismaClient } from '@prisma/client';
import queryResolver from 'src/graphql/resolvers/query';

jest.mock('@prisma/client', () => {
  const mPrisma = {
    book: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    review: {
      findMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

const prisma = new PrismaClient();

describe('Query Resolvers', () => {
  it('getBooks should return an array of books', async () => {
    const books = [
      {
        id: 1,
        title: 'Dance of the Dragons',
        author: 'George R.R Martin',
        publishedYear: 1998,
      },
      {
        id: 2,
        title: 'Song of Ice and Fire',
        author: 'George R R Martin',
        publishedYear: 2000,
      },
    ];
    (prisma.book.findMany as jest.Mock).mockResolvedValue(books);

    const result = await queryResolver.getBooks({}, {});
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          title: expect.any(String),
          author: expect.any(String),
          publishedYear: expect.any(Number),
        }),
      ]),
    );
    expect(prisma.book.findMany).toHaveBeenCalled();
  });

  it('getBook should return a single book by ID', async () => {
    const book = {
      id: 1,
      title: 'Dance of the Dragons',
      author: 'George R.R Martin',
      publishedYear: 1998,
    };
    (prisma.book.findUnique as jest.Mock).mockResolvedValue(book);

    const result = await queryResolver.getBook({}, { id: '1' });
    expect(result).toEqual(book);
    expect(prisma.book.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });
});
