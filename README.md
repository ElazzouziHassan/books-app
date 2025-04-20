# Book Borrowing App

A full-stack mobile application for managing a books. Users can browse available books, borrow and return books, and manage their own book collection.

![Book Borrowing App]()

## Features

- **User Authentication**: Register, login, and password reset functionality
- **Book Catalog**: Browse all available books with search functionality
- **Book Management**: Add, edit, and delete books
- **Borrowing System**: Borrow and return books with due date tracking
- **User Profile**: View borrowed books and personal statistics

## Project Structure

```xml
book-borrowing-app/
├── backend/                 # Backend Node.js application
│   ├── config/              # Configuration files
│   ├── controllers/         # API controllers
│   ├── middleware/          # Express middleware
│   ├── routes/              # API routes
│   ├── .env                 # Environment variables
│   ├── .env.example         # Example environment variables
│   ├── package.json         # Backend dependencies
│   └── server.js            # Entry point
│
├── frontend/                # React Native application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context providers
│   │   ├── navigation/      # Navigation configuration
│   │   ├── screens/         # Application screens
│   │   ├── theme/           # Theme configuration
│   │   ├── types.ts         # TypeScript type definitions
│   │   └── config.ts        # Application configuration
│   ├── App.tsx              # Main application component
│   └── package.json         # Frontend dependencies
│
└── README.md                # Project documentation
```
## Technology Stack

### Frontend
- React Native
- React Navigation
- React Native Paper (UI components)
- AsyncStorage (local storage)
- TypeScript

### Backend
- Node.js
- Express.js
- MySQL (with mysql2 driver)
- JWT Authentication
- Bcrypt (password hashing)
- Nodemailer (for password reset emails)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL database
- React Native development environment (Expo CLI)

## Installation

### Clone the repository

```bash
  git clone https://github.com/ElazzouziHassan/books-app.git
  cd  books-app
```
### Backend Setup

1. Navigate to the backend directory:
```bash
  cd backend
```
2. Install dependencies:

```bash
  npm install
```
3. Create a `.env` file in the backend directory with the following variables:

```bash
  # Server Configuration
  PORT=3000

  # Database Configuration
  DB_HOST=localhost
  DB_USER=your_db_username
  DB_PASSWORD=your_db_password
  DB_NAME=db_name

  # JWT Secret
  JWT_SECRET=your_jwt_secret_key

  # Email Configuration (for password reset)
  EMAIL_USER=your_email@gmail.com
  EMAIL_PASS=your_email_password
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  BASE_URL=http://localhost:3000
```

4. Create the MySQL database:

```sql
  CREATE DATABASE db_name;
```
5. Start the backend server:

```bash
  npm run dev
```
The server will automatically create the necessary tables when it starts for the first time.

### Frontend Setup

1. Navigate to the frontend directory:

```bash
  cd frontend
```
2. Install dependencies:

```bash
  npm install
```
3. Update the API URL in `src/config.ts` to point to your backend server:

```typescript
  export const API_URL = "http://your-ip-address:3000/api"
```
4. Start the frontend application:

```bash
  npx expo start
```
5. Use the Expo Go app on your mobile device to scan the QR code, or run on an emulator.

## Database Schema

The application uses the following database tables:

### Users Table

- `id`: INT (Primary Key, Auto Increment)
- `name`: VARCHAR(255)
- `email`: VARCHAR(255) (Unique)
- `password`: VARCHAR(255) (Hashed)
- `reset_token`: VARCHAR(255) (For password reset)
- `reset_token_expiry`: DATETIME
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP


### Books Table

- `id`: INT (Primary Key, Auto Increment)
- `title`: VARCHAR(255)
- `author`: VARCHAR(255)
- `isbn`: VARCHAR(50) (Unique)
- `published_year`: INT
- `description`: TEXT
- `cover_image`: TEXT (URL to book cover)
- `available`: BOOLEAN (Default: TRUE)
- `user_id`: INT (Foreign Key to users.id)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP


### Borrowed Books Table

- `id`: INT (Primary Key, Auto Increment)
- `user_id`: INT (Foreign Key to users.id)
- `book_id`: INT (Foreign Key to books.id)
- `borrowed_at`: TIMESTAMP
- `due_date`: DATETIME
- `returned_at`: DATETIME (NULL until returned)


## API Documentation

### Authentication Endpoints

#### Register User

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**: `{ name, email, password }`
- **Response**: `{ message, userId }`

#### Login User

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**: `{ email, password }`
- **Response**: `{ token, user: { id, name, email } }`

#### Get Current User

- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ id, name, email }`

#### Forgot Password

- **URL**: `/api/auth/forgot-password`
- **Method**: `POST`
- **Body**: `{ email }`
- **Response**: `{ message }`

#### Reset Password

- **URL**: `/api/auth/reset-password`
- **Method**: `POST`
- **Body**: `{ token, password }`
- **Response**: `{ message }`

### Book Endpoints

#### Get All Books

- **URL**: `/api/books`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Array of book objects


#### Get Available Books

- **URL**: `/api/books/available`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Array of available book objects


#### Get Book by ID

- **URL**: `/api/books/:id`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Book object


#### Create Book

- **URL**: `/api/books`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ title, author, isbn, publishedYear, description, coverImage }`
- **Response**: Created book object


#### Update Book

- **URL**: `/api/books/:id`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ title, author, isbn, publishedYear, description, coverImage }`
- **Response**: Updated book object


#### Delete Book

- **URL**: `/api/books/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message }`


#### Borrow Book

- **URL**: `/api/books/:id/borrow`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message, dueDate }`


#### Return Book

- **URL**: `/api/books/:id/return`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message }`


#### Get User's Borrowed Books

- **URL**: `/api/books/borrowed`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Array of borrowed book objects


#### Get User's Books

- **URL**: `/api/books/user`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Array of book objects added by the user


#### Get User Stats

- **URL**: `/api/books/user/stats`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ ownedBooks, borrowedBooks }`



## Usage

### User Registration and Login

1. Open the app and navigate to the registration screen
2. Create a new account with your name, email, and password
3. Login with your credentials


### Browsing and Borrowing Books

1. Browse available books on the home screen
2. Use the search bar to find specific books
3. Tap on a book to view details
4. Press the "Borrow" button to borrow a book


### Managing Borrowed Books

1. Navigate to the "Borrowed" tab to see your borrowed books
2. View due dates for each book
3. Return books by pressing the "Return Book" button


### Adding and Managing Books

1. Navigate to the "Manage" tab
2. Add new books by pressing the "+" button
3. Edit or delete your books by selecting them from the list


### User Profile

1. Navigate to the "Profile" tab to view your information
2. See statistics about your borrowed and added books
3. Log out from the application


## Troubleshooting

### Database Connection Issues

- Ensure your MySQL server is running
- Verify the database credentials in the `.env` file
- Check that the database has been created


### API Connection Issues

- Verify the API_URL in the frontend config.ts file
- Ensure the backend server is running
- Check for network connectivity issues


### Authentication Issues

- Ensure JWT_SECRET is properly set in the .env file
- Check that tokens are being properly stored and sent with requests



## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---
## License
No licence has been setup for this project yet. (When I add it I will mentioned it here)