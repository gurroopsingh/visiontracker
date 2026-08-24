# VisionTracker — Phase 1 Team Audit Report
**Course:** Back End Engineering (24CAI0303)  
**Project:** VisionTracker (Campus Lost & Found System)

This audit report maps the contributions of each team member based on their Git commit history to the specific files they developed. It directly links their work to the Course Learning Outcomes (CLOs) and specific lecture topics outlined in the official course plan.

---

## 1. Ishpreet Singh (@ishpreet7226)

**Role Focus:** Project Initialization, Frontend Architecture, and UI/UX Design

### Commits
- `chore: initialize VisionTracker project structure`
- `feat(frontend): initialize React and Vite application`
- `feat(ui): configure Tailwind CSS and global design system`
- `feat(frontend): implement landing page and 404 page`

### Files Authored
**Project Setup & Documentation**
- `backend/package.json`, `backend/.env.example`, `backend/.gitignore`
- `docs/API.md`, `docs/ARCHITECTURE.md`, `docs/CLO-MAPPING.md`, `docs/PHASE-1.md`
- `README.md`, `.gitignore`

**Frontend Foundation**
- `frontend/package.json`, `frontend/vite.config.js`, `frontend/index.html`
- `frontend/src/main.jsx`, `frontend/src/index.css`
- `frontend/src/pages/LandingPage.jsx`, `frontend/src/pages/NotFoundPage.jsx`

### Course Plan Mapping
| CLO | Lecture | Topic Demonstrated |
|:---|:---|:---|
| **CLO01** | **49-54** | **Backend Fundamentals:** Configured `package.json`, NPM scripts, environment variables (`.env.example`), and documented the project architecture. |
| **CLO02** | **31** | **Introduction to React:** Single Page Applications, Vite Setup, Project Structure, JSX Fundamentals. |
| **CLO02** | **45** | **UI Design:** Tailwind CSS Basics, Responsive Layouts. |

---

## 2. Gurroop Singh (@gurroopsingh)

**Role Focus:** Authentication UI, Global State Management, Routing, and Integration

### Commits
- `feat(auth): implement login and registration pages with controlled forms`
- `feat(auth): implement AuthContext and authentication state`
- `feat(routing): implement React Router and protected nested routes`
- `chore: add lockfiles and missing frontend assets`
- `fix(ui/db): refine item deletion inline modal and add automatic MongoDB memory fallback`

### Files Authored
**Authentication & Services**
- `frontend/src/pages/LoginPage.jsx`, `frontend/src/pages/RegisterPage.jsx`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/services/api.js` (Axios Configuration)
- `frontend/src/services/authService.js`

**Routing & Layouts**
- `frontend/src/App.jsx`
- `frontend/src/components/ProtectedRoute.jsx`
- `frontend/src/layouts/DashboardLayout.jsx`

**Components & Enhancements**
- `frontend/src/components/Spinner.jsx`, `frontend/src/components/Toast.jsx`
- `frontend/src/pages/ItemDetailPage.jsx` (UI/Delete modal)
- `backend/src/config/db.js` (MongoDB In-Memory fallback implementation)

### Course Plan Mapping
| CLO | Lecture | Topic Demonstrated |
|:---|:---|:---|
| **CLO02** | **41-42** | **Routing:** React Router, BrowserRouter, Routes, Navigation, Nested Routes, Layout Components. |
| **CLO02** | **43-44** | **State & Integration:** Context API, useContext(), Global State Management, Axios, API Integration, Loading & Error States. |
| **CLO02** | **46** | **Forms:** Authentication UI (Login, Registration, Validation). |
| **CLO03** | **60** | **MERN Integration:** Connecting React with Express APIs, CORS, Authentication Flow, JWT Storage, Protected Routes. |

---

## 3. Himanshu Bansal (@Himanshu-bansal07)

**Role Focus:** Backend REST API, Database Schemas, and Core Feature Interfaces

### Commits
- `feat(items): implement lost and found item interfaces`
- `feat(forms): implement controlled lost and found forms`
- `feat(backend): initialize Express REST API with error handling`
- `feat(database): add MongoDB and Mongoose models`
- `feat(api): connect item APIs with frontend via routes and controllers`

### Files Authored
**Backend Architecture (Node.js/Express.js/MongoDB)**
- `backend/src/server.js`
- `backend/src/models/Item.js`, `backend/src/models/User.js`
- `backend/src/controllers/authController.js`, `backend/src/controllers/itemController.js`
- `backend/src/routes/authRoutes.js`, `backend/src/routes/itemRoutes.js`
- `backend/src/middleware/authMiddleware.js`, `backend/src/middleware/errorMiddleware.js`
- `backend/src/utils/generateToken.js`

**Frontend Features (Lost & Found)**
- `frontend/src/pages/DashboardPage.jsx`, `frontend/src/pages/ProfilePage.jsx`
- `frontend/src/pages/ItemsListPage.jsx`
- `frontend/src/pages/ReportFoundPage.jsx`, `frontend/src/pages/ReportLostPage.jsx`
- `frontend/src/components/ItemCard.jsx`
- `frontend/src/services/itemService.js`

### Course Plan Mapping
| CLO | Lecture | Topic Demonstrated |
|:---|:---|:---|
| **CLO02** | **37-38** | **React Logic:** Event Handling in React, Forms, Controlled Components, Conditional Rendering, Lists and Keys (Item Feeds). |
| **CLO03** | **55-56** | **Express.js:** Express Server, Routing, Request & Response Objects, Middleware, Body Parsing, REST API Fundamentals, CRUD APIs. |
| **CLO03** | **57-58** | **Backend Security:** Validation, Error Handling Middleware, JWT Authentication, bcrypt, Protected Routes. |
| **CLO03** | **59** | **Database:** MongoDB Atlas, CRUD Operations, Mongoose (Schemas, Models, Validation, Populate). |

---

## Summary

The team successfully distributed the workload, ensuring every core aspect of the Back End Engineering (24CAI0303) Phase 1 syllabus is implemented in code and demonstrable during evaluation. The commit history on the `main` branch explicitly reflects this distribution of labor.
