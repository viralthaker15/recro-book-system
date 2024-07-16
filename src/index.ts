import { ApolloServer } from 'apollo-server';
import dotEnv from 'dotenv';
import jwt from 'jsonwebtoken';
import { resolvers } from './resolvers';
import { typeDefs } from './schema';
dotEnv.config();

const JWT_SECRET = process.env.JWT_SECRET;

/* === verify incoming request token === */
const getUser = (token: string) => {
  try {
    if (token) return jwt.verify(token, JWT_SECRET);
    return null;
  } catch (err) {
    return null;
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    const user = getUser(token.replace('Bearer ', '')) as { userId?: Number };
    return { userId: user?.userId };
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
