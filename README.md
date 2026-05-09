# Team Task Manager

[![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB)](#tech-stack)
[![Backend](https://img.shields.io/badge/backend-Node%20%2B%20Express-339933)](#tech-stack)
[![Database](https://img.shields.io/badge/database-MongoDB-47A248)](#tech-stack)
[![Deploy](https://img.shields.io/badge/deploy-Railway-0B0D0E)](#railway-deployment)

Production-ready full-stack web application for collaborative project and task management with secure authentication, role-based authorization, analytics, comments, activity logs, and modern UX.

## Why this project is production-ready

- JWT auth + bcrypt hashing + route protection
- Strict role-based permissions (Admin, Member)
- Backend validation and centralized error handling
- Paginated APIs with search/filter support
- Activity log tracking for core actions
- Dark mode + responsive sidebar + reusable modals
- Loading skeletons, empty states, toasts, and error boundary
- Form validation with React Hook Form + Zod
- Railway-ready environment configuration

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios, React Hook Form, Zod, Recharts |
| Backend | Node.js, Express.js, Mongoose, Multer |
| Auth | JWT, bcryptjs |
| Database | MongoDB |
| Deployment | Railway |

## Core Features

### Authentication & Security
- Signup / Login / Logout
- JWT-protected APIs and protected frontend routes
- Strong password policy validation
- Secure password hashing with bcrypt

### Role-Based Access Control
- **Admin:** full project/task/user management + analytics
- **Member:** assigned projects/tasks access and task status updates

### Project Management
- Create, update, delete projects
- Assign/remove team members
- Search + pagination on project listing

### Task Management
- Create, edit, delete, assign tasks
- Filter tasks by status, priority, due date, assignee
- Search + pagination
- Task comments section

### Analytics & Collaboration
- Dashboard cards + advanced charts (status, priority, monthly trends)
- Recent activity stream
- Dedicated activity log page

### UX Improvements
- Dark mode
- Responsive mobile sidebar
- Loading skeletons
- Empty states
- Toast notifications
- Reusable modal components
- Error boundary fallback UI
- Profile image upload

## Monorepo Structure

```text
.
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── seed
│   │   └── utils
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── layouts
│   │   ├── pages
│   │   ├── services
│   │   ├── hooks
│   │   └── utils
└── .env.example
```

## Local Setup

### 1. Clone and configure env

Create:
- `backend/.env` from `backend/.env.example`
- `frontend/.env` from `frontend/.env.example`

### 2. Install and run backend

```bash
cd backend
npm install
npm run dev
```

### 3. Install and run frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Seed demo data (optional)

```bash
cd backend
npm run seed
```

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/profile`

### Projects
- `GET /api/projects?page=1&limit=10&search=foo`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

### Tasks
- `GET /api/tasks?page=1&limit=10&status=Todo&priority=High&search=api`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `POST /api/tasks/:id/comments`

### Users
- `GET /api/users?page=1&limit=10&search=priya`
- `GET /api/users/:id`
- `PUT /api/users/profile/avatar`

### Dashboard & Activity
- `GET /api/dashboard/stats`
- `GET /api/activity?page=1&limit=12`

## Demo Credentials (after seed)

- Admin: `admin@teamtask.com` / `Admin@123`
- Member: `priya@teamtask.com` / `Admin@123`
- Member: `rahul@teamtask.com` / `Admin@123`

## Railway Deployment

Deploy backend and frontend as separate Railway services.

### Backend service
1. Root directory: `backend`
2. Build command: `npm install`
3. Start command: `npm start`
4. Add backend env vars from `backend/.env.example`

### Frontend service
1. Root directory: `frontend`
2. Build command: `npm install && npm run build`
3. Start command: `npm run preview -- --host 0.0.0.0 --port $PORT`
4. Set `VITE_API_URL` to deployed backend URL + `/api`

## Screenshots

Add screenshots/GIFs for:
- Login / Signup
- Dashboard (charts + activity)
- Projects with modal + pagination
- Tasks with comments
- Dark mode

## License

MIT
