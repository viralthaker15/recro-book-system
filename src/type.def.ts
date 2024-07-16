import { User } from '@prisma/client';

export type ContextType = {
  user: UserType;
  validateInput: (inputClass: any, args: any) => {};
};

export type UserType = Omit<User, 'password'> | null;
