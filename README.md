# Job Portal

A full-stack job portal application with React frontend, Express.js backend, PostgreSQL database, JWT authentication, Google OAuth, job posting, candidate applications, saved jobs, notifications, and file uploads.

## Project Structure

- `backend/` - Express backend API
  - `src/index.js` - Server entry point
  - `src/db.js` - PostgreSQL connection
  - `src/routes/authRoutes.js` - Authentication, user profile, uploads
  - `src/routes/jobRoutes.js` - Job search, posting, applications, saved jobs, applicants, analytics
  - `src/routes/notificationRoutes.js` - Notification retrieval and updates
  - `src/config/mail.js` - Nodemailer SMTP configuration
  - `src/middleware/authMiddleware.js` - JWT protection middleware
  - `uploads/` - Uploaded files served statically

- `frontend/` - React application built with Vite
  - `src/App.jsx` - Route definitions
  - `src/components/` - Shared UI components and route guards
  - `src/pages/` - Pages for login, register, jobs, dashboard, profile, notifications, etc.
  - `src/services/api.js` - Axios API client
  - `src/config.js` - API URL configuration

- `docker-compose.yml` - Local PostgreSQL container configuration
- `init.sql` - Database schema initialization

## Key Features

- Candidate and recruiter user roles
- Email-based registration and login
- Google OAuth login
- JWT-based authentication middleware
- Job browsing with filters and sorting
- Job post creation, editing, deleting (recruiter only)
- Candidate job application and saved jobs
- Recruiter applicant management
- Recruiter analytics dashboard
- Profile updates, resume upload, profile photo upload
- Notifications with unread counts, marking read, deleting
- Company logo uploads and static file serving

## Backend Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Create a `.env` file in `backend/` with:

```env
PORT=5000
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

- `EMAIL_USER` and `EMAIL_PASS` are used for Nodemailer email testing.
- `JWT_SECRET` secures JWT authentication.
- For production, set `NODE_ENV=production` and `DATABASE_URL`.

### 3. Start PostgreSQL

Local development uses the provided Docker Compose setup.

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5435` with:
- `POSTGRES_USER=amar`
- `POSTGRES_PASSWORD=password`
- `POSTGRES_DB=job_portal`

The `init.sql` file creates the database schema.

### 4. Start backend server

```bash
cd backend
npm run dev
```

The backend runs on `http://localhost:5000` by default.

## Frontend Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure API URL

The frontend reads the backend URL from `VITE_API_URL`.

Create a `.env` file in `frontend/` with:

```env
VITE_API_URL=http://localhost:5000
```

If not set, it defaults to `http://localhost:5000`.

### 3. Start frontend app

```bash
cd frontend
npm run dev
```

Open the displayed local URL in the browser.

## Available Routes

### Frontend pages

- `/` - Home
- `/jobs` - Browse jobs
- `/jobs/:id` - Job details and similar jobs
- `/login` - Login page
- `/register` - Register page
- `/dashboard` - User dashboard (protected)
- `/profile` - Profile page (protected)
- `/notifications` - Notifications (protected)
- `/saved-jobs` - Saved jobs (candidate only)
- `/post-job` - Post job (recruiter only)
- `/edit-job/:id` - Edit job (recruiter only)
- `/applicants/:id` - View applicants (recruiter only)

### Backend API endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/profile` - Get logged-in profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/upload-profile-photo` - Upload profile photo
- `POST /api/auth/upload-resume` - Upload resume
- `GET /api/jobs` - Search and filter jobs
- `GET /api/jobs/:id` - Get job details
- `GET /api/jobs/:id/similar` - Get similar jobs
- `POST /api/jobs` - Post a job (recruiter)
- `GET /api/jobs/my/jobs` - Get recruiter jobs
- `GET /api/jobs/analytics/recruiter` - Recruiter analytics
- `GET /api/jobs/my/applications` - Candidate applications
- `GET /api/jobs/my/saved` - Candidate saved jobs
- `POST /api/jobs/:id/apply` - Apply to a job
- `POST /api/jobs/:id/save` - Save a job
- `DELETE /api/jobs/:id/save` - Remove saved job
- `GET /api/jobs/:id/saved-status` - Check saved status
- `GET /api/jobs/:id/applicants` - Get applicants for a job
- `PUT /api/jobs/applications/:id/status` - Update application status
- `PUT /api/jobs/:id` - Update job (recruiter)
- `DELETE /api/jobs/:id` - Delete job (recruiter)
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark notification read
- `PUT /api/notifications/mark/all-read` - Mark all read
- `DELETE /api/notifications/:id` - Delete notification

## Database Schema

The `init.sql` schema includes:

- `users` - Application users and profiles
- `jobs` - Job listings
- `applications` - Candidate applications
- `saved_jobs` - Saved job listings

## Notes

- Static uploads are served from `/uploads`.
- Candidate users can upload resumes and save jobs.
- Recruiters can post, edit, delete jobs, and manage applicants.
- Google OAuth uses a hard-coded client ID in `backend/src/routes/authRoutes.js`.
- `frontend/src/config.js` uses `VITE_API_URL` to connect to the backend.

## Recommended Workflow

1. Start PostgreSQL with Docker Compose.
2. Configure backend environment variables.
3. Start backend server.
4. Configure frontend environment variables.
5. Start frontend app.
6. Register as a candidate or recruiter, then use the app.

---

If you want, I can also add setup instructions for deploying this project or refine the README with screenshots and contribution notes.