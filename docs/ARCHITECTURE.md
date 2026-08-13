# VisionTracker — Phase 1 Architecture

## Overview

VisionTracker is a campus Lost & Found platform for Chitkara University built as a full-stack web application. Phase 1 establishes the core frontend (React + Vite) and backend (Node.js + Express + MongoDB) foundation.

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                        BROWSER (CLIENT)                        │
│                                                                │
│  React + Vite + Tailwind CSS                                   │
│                                                                │
│  ┌──────────────┐    ┌──────────────────────────────────────┐  │
│  │  AuthContext  │    │           React Router               │  │
│  │  (global     │    │  / → Landing                         │  │
│  │   auth state)│    │  /login → LoginPage                  │  │
│  └──────────────┘    │  /register → RegisterPage            │  │
│                      │  /dashboard/* → ProtectedRoute       │  │
│                      │    DashboardLayout                    │  │
│                      │      /dashboard → DashboardPage       │  │
│                      │      /items/lost → ItemsListPage      │  │
│                      │      /items/found → ItemsListPage     │  │
│                      │      /items/:id → ItemDetailPage      │  │
│                      │      /report-lost → ReportLostPage    │  │
│                      │      /report-found → ReportFoundPage  │  │
│                      │      /profile → ProfilePage           │  │
│                      └──────────────────────────────────────┘  │
│                                                                │
│  Services Layer (Axios)                                        │
│  ┌─────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │   api.js    │  │  authService.js  │  │  itemService.js  │  │
│  │ (Axios base │  │ (register/login  │  │ (CRUD items)     │  │
│  │  + JWT      │  │  /getMe)         │  │                  │  │
│  │  interceptor│  └─────────────────┘  └──────────────────┘  │
│  └─────────────┘                                               │
└────────────────────────────────┬───────────────────────────────┘
                                 │ HTTP / REST (JSON)
                                 │ Vite proxy → localhost:5000
                                 ▼
┌────────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js + Express)                │
│                                                                │
│  server.js                                                     │
│  ├── CORS middleware                                           │
│  ├── express.json()                                            │
│  ├── /api/auth  → authRoutes.js → authController.js           │
│  ├── /api/items → itemRoutes.js → itemController.js           │
│  ├── authMiddleware.js (JWT protect)                           │
│  └── errorMiddleware.js (centralized error handler)            │
│                                                                │
│  Models (Mongoose)                                             │
│  ┌─────────────┐   ┌─────────────────────────────────────┐    │
│  │   User.js   │   │             Item.js                  │    │
│  │  name, email│   │  type, title, description, category  │    │
│  │  password   │   │  brand, color, location, date        │    │
│  │  (bcrypt)   │   │  additionalDetails, status           │    │
│  │  role       │   │  imageUrl (Phase 2), reportedBy ref  │    │
│  └─────────────┘   └─────────────────────────────────────┘    │
└────────────────────────────────┬───────────────────────────────┘
                                 │ Mongoose ODM
                                 ▼
                    ┌────────────────────────┐
                    │  MongoDB               │
                    │  Database: visiontracker│
                    │  Collections:          │
                    │   • users              │
                    │   • items              │
                    └────────────────────────┘
```

---

## Directory Structure

```
visiontracker/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              ← MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js  ← register, login, getMe
│   │   │   └── itemController.js  ← CRUD item handlers
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js  ← JWT protect middleware
│   │   │   └── errorMiddleware.js ← centralized error handler
│   │   ├── models/
│   │   │   ├── User.js            ← Mongoose User schema
│   │   │   └── Item.js            ← Mongoose Item schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js      ← /api/auth/*
│   │   │   └── itemRoutes.js      ← /api/items/*
│   │   ├── utils/
│   │   │   └── generateToken.js   ← JWT sign utility
│   │   └── server.js              ← Express app entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx    ← Global auth state (Context API)
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx ← Route guard
│   │   │   ├── ItemCard.jsx       ← Reusable item card
│   │   │   ├── Spinner.jsx        ← Loading indicator
│   │   │   └── Toast.jsx          ← Feedback notification
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx ← Sidebar + header shell
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ItemsListPage.jsx
│   │   │   ├── ItemDetailPage.jsx
│   │   │   ├── ReportLostPage.jsx
│   │   │   ├── ReportFoundPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/
│   │   │   ├── api.js             ← Axios instance + interceptors
│   │   │   ├── authService.js     ← Auth API functions
│   │   │   └── itemService.js     ← Item API functions
│   │   ├── App.jsx                ← Router configuration
│   │   ├── main.jsx               ← React entry point
│   │   └── index.css              ← Global styles + Tailwind
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── docs/
│   ├── ARCHITECTURE.md   ← This file
│   ├── CLO-MAPPING.md    ← CLO topic → file mapping
│   ├── API.md            ← REST API reference
│   └── PHASE-1.md        ← Phase 1 scope and checklist
│
└── README.md
```

---

## Key Design Decisions

### Frontend

| Decision | Rationale |
|---|---|
| Vite + React | Fast HMR, ES module native, industry standard |
| Tailwind CSS v4 | Utility-first, consistent design system |
| Context API over Redux | Appropriate complexity for Phase 1 auth state |
| Service layer (services/) | Keeps API logic out of UI components |
| ProtectedRoute via Outlet | Clean nested route guard pattern |
| Axios interceptors | Single place to inject JWT + handle errors |

### Backend

| Decision | Rationale |
|---|---|
| ES modules | Modern Node.js, aligns with frontend |
| Controllers/Routes split | Separation of concerns, easy to extend |
| Centralized errorMiddleware | Consistent error format across all routes |
| Mongoose populate ref | Ready for Phase 2 without schema changes |
| `select: false` on password | Security — never accidentally returned |

---

## Phase 2 Extension Points

The following are consciously left as stubs or placeholders:

- `imageUrl` field in Item model → Multer upload integration
- `additionalDetails` / image file input in ReportFoundPage → FormData submit
- `status: "resolved"` → AI match confidence trigger
- `services/` layer → easy to add `aiService.js`
- Backend `src/services/` directory → ready for AI matching service
- Mongoose `.populate()` already used → rich data queries ready
