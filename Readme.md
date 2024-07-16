# GraphQL Book System API

This project is a GraphQL API for managing books and their reviews. The API supports operations such as adding books, fetching books, adding reviews, and fetching reviews. It also includes authentication with JWTs, input validation, and pagination.

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Running the Project](#running-the-project)
- [Testing](#testing)
- [API Documentation & Project Structure](#documentation)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/viralthaker15/recro-book-system.git
   cd recro-book-system
   ```

2. **Install dependencies:**:

Make sure you have Node.js and npm / yarn installed [Yarn recommended]. Then, install the required dependencies:

      - if you are using yarn then : yarn or yarn install
      - if you are using npm then do : npm install

## Setup

1. **Environment Variables:**

Create a .env file and Copy all contents from template.env into .env file.
You will possibly find below values that you have to add.

- DATABASE_URL
  - This is a must env which is being used by prisme as well
  - you have to provide your database connection url
  - I will suggest to create a database from Supabase (https://supabase.com/)
- DIRECT_URL=
  - for supabase only (supabase <> prisma)
- JWT_SECRET=
  - Normal JWT Token will be created from this signature
- JWT_REFRESH_SECRET=
  - Refresh Token will be created from this signature

2. **Database Setup:**

Ensure you have a PostgreSQL database running. You can use a local instance or a cloud-based solution like Heroku Postgres or Supabase.

Run the Prisma migrations to set up the database schema:

```bash
npx prisma migrate dev
```

3. **Generate Prisma Client:**

Generate the Prisma client for database access:

```bash
npx prisma generate
```

## Running the Project

1. Start the server:

   ```bash
    yarn dev
      or
    npm run dev
   ```

   The server will start on http://localhost:4000.

2. Access the GraphQL Playground:

Open your browser and navigate to http://localhost:4000/graphql to access the GraphQL Playground.

## Testing

1.Run the tests:

This project uses Jest for testing. To run the tests, use the following command:

```bash
  yarn test
    or
  npm run test
```

## Documentation

**Project Structure:**
src/graphql/schema.ts: Contains the GraphQL schema definitions.
src/graphql/resolvers: Contains the GraphQL resolvers.
index.ts: Initializes and starts the Apollo server.
src/graphql/directives.ts: Custom directive for auth purposes etc.
middlewares.ts: Contains middleware functions for validation and authentication.
src/graphql/utils/auth.ts: Contains utility functions, such as token generation and verification.

**API Endpoints:**

Queries
getBooks:

Fetches a list of books with pagination and optional search functionality.

```bash
query getBooks($page: Int, $limit: Int, $search: String) {
  getBooks(page: $page, limit: $limit,  search: $search) {
    id
    title
    author
  }
}
```

Parameters:
page (Int): The page number for pagination. Default is 1.
limit (Int): The number of books to fetch per page. Default is 10.
search (String): A search term to filter books by title or author. Default is an empty string.
Response:
An array of books.
Authentication: None required.

getBook:
Fetches a single book by its ID.

```bash
query getBook($id: String!) {
  getBook(id: $id) {
    id
    title
    author
  }
}
```

Parameters:

id (String!): The ID of the book to fetch.
Response:

A single book object.
Authentication: None required.

getReviews
Fetches a list of reviews for a specific book with pagination.

```bash
query getReviews($bookId: String!, $page: Int, $limit: Int) {
  getReviews(bookId: $bookId, page: $page, limit: $limit) {
    id
    rating
    comment
  }
}
```

Parameters:

bookId (String!): The ID of the book to fetch reviews for.
page (Int): The page number for pagination. Default is 1.
limit (Int): The number of reviews to fetch per page. Default is 10.
Response:

An array of reviews.
Authentication: None required.

getMyReviews
Fetches a list of reviews created by the authenticated user.

```bash
query getMyReviews {
  getMyReviews {
    id
    rating
    comment
  }
}
```

Parameters:

None.
Response:

An array of reviews.
Authentication: Requires a valid JWT token.

refreshToken
Refreshes the JWT token using a refresh token.

```bash
mutation refreshToken($token: String!) {
  refreshToken(token: $token) {
    token
    refreshToken
  }
}
```

Parameters:

token (String!): The refresh token.
Response:

A new JWT token and refresh token.
Authentication: None required.

register
Registers a new user.

```bash
mutation register($username: String!, $email: String!, $password: String!) {
  register(username: $username, email: $email, password: $password) {
    token
    refreshToken
  }
}
```

Parameters:

username (String!): The username of the user.
email (String!): The email of the user.
password (String!): The password of the user.
Response:

A JWT token and refresh token.
Authentication: None required.

login
Authenticates a user and returns a JWT token.

```bash
mutation login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    refreshToken
  }
}
```

Parameters:

email (String!): The email of the user.
password (String!): The password of the user.
Response:

A JWT token and refresh token.
Authentication: None required.

addBook
Adds a new book.

```bash
mutation addBook($title: String!, $author: String!, $publishedYear: Int!) {
  addBook(title: $title, author: $author, publishedYear: $publishedYear) {
    id
    title
    author
  }
}
```

Parameters:

title (String!): The title of the book.
author (String!): The author of the book.
publishedYear (Int): The year the book was published.
Response:

The newly added book.
Authentication: Requires a valid JWT token.

addReview
Adds a new review for a book.

```bash
mutation addReview($bookId: String!, $rating: Int!, $comment: String!) {
  addReview(bookId: $bookId, rating: $rating, comment: $comment) {
    id
    rating
    comment
  }
}
```

Parameters:

bookId (String!): The ID of the book to add a review for.
rating (Int!): The rating of the review.
comment (String!): The content of the review.
Response:

The newly added review.
Authentication: Requires a valid JWT token.

updateReview
Updates an existing review.

```bash
mutation updateReview($reviewId: String!, $rating: Int, $comment: String) {
  updateReview(reviewId: $reviewId, rating: $rating, comment: $comment) {
    id
    rating
    comment
  }
}
```

Parameters:

reviewId (String!): The ID of the review to update.
rating (Int): The new rating of the review (optional).
comment (String): The new content of the review (optional).
Response:

The updated review.
Authentication: Requires a valid JWT token.

deleteReview
Deletes an existing review.

```bash
mutation deleteReview($reviewId: String!) {
  deleteReview(reviewId: $reviewId) {
    id
    rating
    comment
  }
}
```

Parameters:

reviewId (String!): The ID of the review to delete.
Response:

The deleted review.
Authentication: Requires a valid JWT token.
