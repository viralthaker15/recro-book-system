import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServer } from 'apollo-server';
import {
  AuthenticationError as ApolloAuthenticationError,
  ForbiddenError as ApolloForbiddenError,
  UserInputError as ApolloUserInputError,
} from 'apollo-server-core';
import { AuthenticationError, ForbiddenError, UserInputError } from './errors';
import { authDirective } from './graphql/directives';
import { resolvers } from './graphql/resolvers';
import { typeDefs } from './graphql/schema';
import { getUserMiddleware, validationMiddleware } from './middlewares';
import { ContextType, UserType } from './type.def';

/* === Middlewares registered through Context === */
const context = async ({ req }): Promise<ContextType> => {
  /* === get user using token === */
  const token = req.headers.authorization || '';
  console.log(token.replace('Bearer ', ''));
  const user = (await getUserMiddleware(
    token.replace('Bearer ', ''),
  )) as UserType;

  return { user, validateInput: validationMiddleware };
};

const { authDirectiveTypeDefs, authDirectiveTransformer } =
  authDirective('auth');

/* === defining GraphQL schema + @auth schema === */
const schema = makeExecutableSchema({
  typeDefs: [typeDefs, authDirectiveTypeDefs],
  resolvers,
});

/* === Attaching schema with directives === */
const schemaWithDirectives = authDirectiveTransformer(schema);

const server = new ApolloServer({
  schema: schemaWithDirectives,
  context,
  formatError: (err) => {
    if (err.originalError instanceof ApolloAuthenticationError) {
      return new AuthenticationError(err.message);
    } else if (err.originalError instanceof ApolloForbiddenError) {
      return new ForbiddenError(err.message);
    } else if (err.originalError instanceof ApolloUserInputError) {
      return new UserInputError(err.message);
    }
    return err;
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
