import {
  AuthenticationError as ApolloAuthenticationError,
  ApolloError,
  ForbiddenError as ApolloForbiddenError,
  UserInputError as ApolloUserInputError,
} from 'apollo-server-core';

export const ERROR_CODES = {
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  FORBIDDEN_ERROR: 'FORBIDDEN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  USER_INPUT_ERROR: 'USER_INPUT_ERROR',
};

export class AuthenticationError extends ApolloAuthenticationError {
  constructor(message: string) {
    super(message);
    Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
    this.extensions.code = ERROR_CODES.AUTHENTICATION_ERROR;
  }
}

export class ForbiddenError extends ApolloForbiddenError {
  constructor(message: string) {
    super(message);
    Object.defineProperty(this, 'name', { value: 'ForbiddenError' });
    this.extensions.code = ERROR_CODES.FORBIDDEN_ERROR;
  }
}

export class UserInputError extends ApolloUserInputError {
  constructor(message: string) {
    super(message);
    Object.defineProperty(this, 'name', { value: 'UserInputError' });
    this.extensions.code = ERROR_CODES.USER_INPUT_ERROR;
  }
}

export class ValidationError extends ApolloError {
  constructor(message: string) {
    super(message, ERROR_CODES.VALIDATION_ERROR);
    Object.defineProperty(this, 'name', { value: 'ValidationError' });
  }
}

export class ResourceNotFoundError extends ApolloError {
  constructor(message: string) {
    super(message, ERROR_CODES.RESOURCE_NOT_FOUND);
    Object.defineProperty(this, 'name', { value: 'ResourceNotFoundError' });
  }
}
