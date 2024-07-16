import { gql } from 'apollo-server';

export const typeDefs = gql`
  directive @auth on FIELD_DEFINITION

  type User {
    id: ID!
    username: String!
    email: String!
    reviews: [Review!]!
  }

  type Book {
    id: ID!
    title: String!
    author: String!
    publishedYear: Int!
    reviews: [Review!]!
  }

  type Review {
    id: ID!
    user: User!
    book: Book!
    rating: Int!
    comment: String!
    createdAt: String!
  }

  type Query {
    getBooks(page: Int, limit: Int, search: String): [Book!]!
    getBook(id: ID!): Book
    getReviews(bookId: ID!, page: Int, limit: Int): [Review!]!
    getMyReviews: [Review!]! @auth
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    addBook(title: String!, author: String!, publishedYear: Int!): Book! @auth
    addReview(bookId: ID!, rating: Int!, comment: String!): Review! @auth
    updateReview(reviewId: ID!, rating: Int, comment: String): Review! @auth
    deleteReview(reviewId: ID!): Review! @auth
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;
