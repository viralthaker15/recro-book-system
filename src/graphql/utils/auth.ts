import { AuthenticationError } from 'apollo-server';
import jwt from 'jsonwebtoken';
import { ContextType, UserType } from 'src/type.def';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

/*
  - @auth will anyway check authentication
  - this fn to double-check [Alternative approach to directive]
*/
export const checkAuth = (context: ContextType) => {
  if (!context.user) throw new AuthenticationError('Not authenticated');
};

export const generateTokens = (user: UserType) => {
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
  return { token, refreshToken, user };
};
