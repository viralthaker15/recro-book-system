# GraphQL Book System API

This project is a GraphQL API for managing books and their reviews. The API supports operations such as adding books, fetching books, adding reviews, and fetching reviews. It also includes authentication with JWTs, input validation, and pagination.

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Running the Project](#running-the-project)
- [Testing](#testing)

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
