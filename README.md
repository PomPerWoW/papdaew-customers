# Users Service

## Overview

Users service for Papdaew. This service handles user profile management, user preferences, and user-specific operations. It works in conjunction with the auth service through message queues.

## Table of Contents

- [Users Service](#users-service)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Setup](#setup)

## Features

- User profile management (CRUD operations)
- Profile data storage and retrieval
- Event-driven updates from auth service
- Role-based profile fields
- Profile picture handling (planned)
- Address management (planned)
- User preferences (planned)

## Tech Stack

- Node.js

## Project Structure

```
services/papdaew-users/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── configs/
│   ├── server.js
│   └── app.js
├── tests/
├── .editorconfig
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

4. Database Setup:

   ```bash
   # Start PostgreSQL (if using Docker)
   docker-compose up -d postgres

   # Run database migrations
   npx prisma migrate dev
   ```

5. Run the service:

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```
