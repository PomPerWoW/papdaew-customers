# Customers Service

## Overview

Customers service for Papdaew. This service handles customer-specific operations, including profile management, queue history, and customer preferences. It works in conjunction with the auth service through message queues.

## Table of Contents

- [Customers Service](#customers-service)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Setup](#setup)

## Features

- Customer profile management (CRUD operations)
- Queue history tracking (planned)
- Active queues monitoring (planned)
- Customer preferences management (planned)
- Profile picture handling (planned)
- Address management (planned)
- Notification preferences (planned)
- Queue position tracking (planned)
- Customer analytics

## Tech Stack

- Node.js

## Project Structure

```services/papdaew-customers/README.md
services/papdaew-customers/
├── src/
│   ├── controllers/
│   │   └── customer.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   └── customer.model.js
│   ├── routes/
│   │   └── customer.route.js
│   ├── services/
│   │   ├── customer.service.js
│   │   └── message.consumer.js
│   ├── utils/
│   │   └── validators.js
│   ├── configs/
│   │   ├── config.js
│   │   ├── database.config.js
│   │   └── messageBroker.config.js
│   ├── server.js
│   └── app.js
├── tests/
│   ├── unit/
│   └── integration/
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

3. Run the service:

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```
