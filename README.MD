# 🌄 Natours Project

Natours is a modern application built using Node.js, Express, MongoDB, and Mongoose. It is designed to provide a platform for managing and organizing tours and related services.

## 📁 Project Structure

```
Natours/
│
├── controllers/
├── models/
├── public/
├── routes/
├── utils/
├── views/
│
├── app.js
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

## 📋 Prerequisites

- Node.js (version 16 or higher)
- MongoDB

## 🚀 Installation

1. Clone the repository:
   ```
   git clone https://github.com/mikae/Natours.git
   ```

2. Navigate to the project directory:
   ```
   cd Natours
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Set up environment variables:
   Create a `.env` file in the root directory and add your MongoDB connection string and other required variables.

## 🏃‍♂️ Running the Application

To run the application in development mode:

```
npm run dev
```

To start the server:

```
npm start
```

## 🛣️ API Documentation

API documentation is available at `/api-docs` when the server is running.

## 🛠️ Technologies Used

- **Express.js**: Web application framework
- **MongoDB**: Database
- **Mongoose**: MongoDB object modeling tool
- **Pug**: Template engine
- **JSON Web Tokens (JWT)**: Authentication
- **Bcrypt**: Password hashing
- **Nodemailer**: Email functionality
- **Multer**: File uploading
- **Sharp**: Image processing
- **Stripe**: Payment processing
- **Swagger**: API documentation

## 🔒 Security Features

- CORS (Cross-Origin Resource Sharing)
- Rate limiting
- Data sanitization against NoSQL query injection
- XSS protection
- HTTP security headers with Helmet

## 👨‍💻 Author

Mikael Engvall

## 📄 License

This project is licensed under the ISC License.
