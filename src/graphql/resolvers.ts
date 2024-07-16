import bookResolver from './resolvers/book';
import mutationResolver from './resolvers/mutation';
import queryResolver from './resolvers/query';
import reviewResolver from './resolvers/review';
import userResolver from './resolvers/user';

export const resolvers = {
  Query: queryResolver,
  Mutation: mutationResolver,
  User: userResolver,
  Book: bookResolver,
  Review: reviewResolver,
};
