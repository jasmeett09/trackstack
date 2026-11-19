# Inventory Management System

## Project Overview
This is a college-level Inventory Management System backend project built with Node.js, Express.js, MongoDB, Mongoose, EJS, express-session, cookies, bcrypt, JWT, Passport.js, and Socket.IO. It follows MVC architecture and demonstrates syllabus topics such as middleware, SSR with EJS, authentication, session management, cookies, MongoDB integration, and real-time communication.

## Features
- User registration, login, logout, session persistence, JWT issue, and Passport local authentication
- Protected dashboard and protected inventory management routes
- CRUD for items, categories, and suppliers
- Stock in and stock out transactions with validation against negative stock
- EJS-based SSR pages for forms, tables, and dashboard
- JSON API routes for items and protected profile
- Socket.IO real-time stock update notifications
- Centralized middleware, validation, 404 handling, and error handling
- Basic automated tests with Jest and Supertest

## Syllabus Mapping
- Middleware lifecycle: implemented through app-level middleware, router-level middleware, validators, not-found middleware, and error middleware
- Application-level middleware: logger, body parser, cookie parser, session, flash, Passport initialize/session
- Router-level middleware: session protection on item/category/supplier/transaction routes and validation middleware on form/API routes
- Third-party middleware: `express.json`, `express.urlencoded`, `cookie-parser`, `express-session`, `passport`, `passport-local`, `express-validator`, `method-override`, `connect-flash`
- Error-handling middleware: centralized `errorMiddleware.js`
- Body parser: `express.json()` and `express.urlencoded()`
- SSR/template engine: EJS used to render all main pages
- Database: MongoDB with Mongoose ODM
- Session and cookies: `express-session`, session cookie, JWT cookie, cookie parser
- Authentication: bcrypt hashing, JWT, Passport local strategy
- Real-time communication: Socket.IO stock update event

## MVC Explanation
- Model: Mongoose schemas handle data and MongoDB logic
- View: EJS templates handle what the user sees
- Controller: Controllers handle request logic and connect the views with services/models
- Service layer: Reusable business logic such as password hashing, JWT generation, item operations, and stock updates

## Folder Structure
```text
project-root/
|-- server.js
|-- package.json
|-- .env.example
|-- .gitignore
|-- README.md
|-- src/
|   |-- app.js
|   |-- config/
|   |   |-- db.js
|   |   |-- keys.js
|   |   |-- passport.js
|   |   `-- socket.js
|   |-- models/
|   |   |-- User.js
|   |   |-- Category.js
|   |   |-- Supplier.js
|   |   |-- Item.js
|   |   `-- Transaction.js
|   |-- views/
|   |   |-- partials/
|   |   |   |-- header.ejs
|   |   |   |-- footer.ejs
|   |   |   `-- flash.ejs
|   |   |-- home.ejs
|   |   |-- register.ejs
|   |   |-- login.ejs
|   |   |-- dashboard.ejs
|   |   |-- items/
|   |   |-- categories/
|   |   |-- suppliers/
|   |   |-- transactions/
|   |   `-- error.ejs
|   |-- controllers/
|   |-- routes/
|   |-- middlewares/
|   |-- services/
|   |-- validators/
|   |-- utils/
|   `-- public/
|       |-- css/style.css
|       |-- js/socket-client.js
|       `-- js/form-enhancements.js
`-- tests/
    |-- auth.test.js
    |-- item.test.js
    `-- protectedRoutes.test.js
```

## Installation Commands
```bash
npm install
copy .env.example .env
npm run dev
```

For PowerShell:
```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

## Environment Variables
Create `.env` using `.env.example`.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/inventory_management_system
SESSION_SECRET=replace_with_session_secret
JWT_SECRET=replace_with_jwt_secret
JWT_EXPIRES_IN=1d
```

## Route Summary

### SSR Routes
- `GET /` home page
- `GET /register` register page
- `GET /login` login page
- `GET /dashboard` protected dashboard
- `GET /items` protected item list
- `GET /items/new` add item form
- `GET /items/:id` item detail
- `GET /items/:id/edit` edit item form
- `GET /categories` category list
- `GET /categories/new` add category form
- `GET /suppliers` supplier list
- `GET /suppliers/new` add supplier form
- `GET /transactions` transaction list
- `GET /transactions/new` add transaction form

### Action Routes
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/token`
- `POST /items`
- `PUT /items/:id`
- `DELETE /items/:id`
- `POST /categories`
- `PUT /categories/:id`
- `DELETE /categories/:id`
- `POST /suppliers`
- `PUT /suppliers/:id`
- `DELETE /suppliers/:id`
- `POST /transactions`

### API Routes
- `GET /api/items`
- `GET /api/items/:id`
- `POST /api/items` protected by JWT
- `GET /api/profile` protected by JWT

## Authentication Explanation
- `bcrypt` hashes the password before it is stored in MongoDB
- `Passport.js` with `passport-local` checks email and password during login
- `express-session` keeps the logged-in session for server-rendered pages
- `cookie-parser` allows the app to read cookies
- JWT is generated after login and can be used for protected JSON API routes

## Session vs JWT
- Session-based authentication stores user login state on the server and uses a session cookie, which is ideal for EJS-protected pages
- JWT-based authentication stores signed user information inside the token and is useful for protected API requests
- In this project, session auth protects SSR pages and JWT protects API routes

## SSR vs CSR
- SSR means the server renders HTML before sending it to the browser. Here, EJS renders pages like login, dashboard, and item lists.
- CSR means the browser would render most UI using JavaScript frameworks after receiving data. This project does not use a separate CSR frontend.
- JSON API routes are included only to demonstrate API responses alongside SSR pages.

## SQL vs NoSQL
- SQL databases store structured data in tables with rows and columns
- NoSQL databases store flexible document-based data
- MongoDB is a NoSQL database and is suitable here because inventory records, category references, supplier details, and transactions fit naturally in document form
- Mongoose is an ODM (Object Document Mapper) that helps Node.js interact with MongoDB using schemas, validation, and model methods

## How Socket.IO Is Used
- When a stock-in or stock-out transaction is created, the server emits a `stock:update` event
- The dashboard or item pages can receive the event through `socket-client.js`
- The page shows a live notification and updates any matching item quantity row on screen

## Request Flow
Request flow in this project:

`request -> app-level middleware -> router-level middleware -> controller -> service -> model -> response`

Example login flow:
1. Browser sends `POST /auth/login`
2. App middleware runs logger, body parsing, cookie parser, session, and Passport middleware
3. Route validation checks email and password fields
4. Controller calls Passport local strategy
5. Passport uses `authService.verifyUserCredentials`
6. Service reads the user from MongoDB through the User model and compares password with bcrypt
7. Passport stores the user id in the session
8. Controller generates JWT and sends response with redirects and cookies

## Blocking vs Non-Blocking in Node.js
- Blocking code stops the event loop while a task completes
- Non-blocking code allows other requests to be handled while async tasks like database queries continue
- This project uses async/await with Express and Mongoose, which supports Node.js non-blocking request handling

## Test Command
```bash
npm test
```
