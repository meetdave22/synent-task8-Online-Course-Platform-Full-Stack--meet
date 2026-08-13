# Online Course Platform (MERN)

Full-stack platform where users browse and enroll in courses (with Razorpay test-mode payment), watch video lessons, and track progress. Admins manage courses, modules, lessons, and view users/enrollments.

## Stack
- Frontend: React 18 + Vite + React Router + Axios
- Backend: Node.js + Express + MongoDB (Mongoose)
- Auth: JWT, bcrypt password hashing
- Payments: Razorpay (test mode)
- Email: Nodemailer (SMTP) — registration verification, password reset, enrollment confirmation

## Project structure
```
course-platform/
  backend/     Express API, MongoDB models, JWT auth, Razorpay, email
  frontend/    React app (Vite)
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — local MongoDB or a MongoDB Atlas connection string
- `JWT_SECRET` — any long random string
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — from your Razorpay **test mode** dashboard (Settings → API Keys)
- `SMTP_*` — SMTP credentials (Gmail App Password, Mailtrap, SendGrid SMTP, etc). If left blank/invalid, emails just fail silently and log to console — the app keeps working.

Seed sample data (an admin user, a student user, and one sample course):
```bash
node seed.js
```
This prints login credentials for `admin@example.com` and `student@example.com`.

Start the API:
```bash
npm run dev     # nodemon, auto-restart
# or
npm start
```
API runs on `http://localhost:5000`, health check at `GET /api/health`.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
- `VITE_API_URL` — should point at the backend, default `http://localhost:5000/api`
- `VITE_RAZORPAY_KEY_ID` — not strictly required client-side (the key is also returned by the order API), but kept here for reference

Start the dev server:
```bash
npm run dev
```
App runs on `http://localhost:5173`.

## 3. Using the app

1. Register a new account, or log in with the seeded student/admin accounts.
2. As a student: browse `/dashboard`, search/filter courses, open a course, click **Enroll Now**.
   - Free courses (price = 0) enroll instantly.
   - Paid courses open the Razorpay Checkout modal. In **test mode**, use Razorpay's [test card numbers](https://razorpay.com/docs/payments/payments/test-card-upi-details/) (e.g. card `4111 1111 1111 1111`, any future expiry, any CVV) to simulate a successful payment.
3. After payment, the enrollment is verified server-side (signature check) and the course appears under **My Learning**.
4. Open a course from My Learning to watch lessons and check them off — progress % updates automatically.
5. As an admin (`role: admin`): visit `/admin` to create courses, add modules/lessons (with video URLs), and view all users and enrollments.

## Notes on scope
- Video playback uses plain HTML5 `<video>` with a `videoUrl` you supply per lesson (e.g. an S3/Cloudinary URL, or any direct MP4 link). Swapping in a provider like Mux/Cloudinary/YouTube embeds is straightforward from `LessonPlayer.jsx`.
- Course preview hides lesson video URLs from non-enrolled users; full lesson content unlocks after enrollment.
- This was built and syntax-checked in a sandbox without internet/database access, so `npm install` and a live run against MongoDB/Razorpay/SMTP haven't been executed end-to-end here — do that in your own environment. The code follows standard, well-tested patterns throughout (Mongoose schemas, JWT middleware, Razorpay order/verify flow, React Router v6, Axios interceptors).
