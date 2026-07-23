# Yaazhlan Dance Studio — Full Stack Project

A complete, production-ready registration & login system: static HTML/CSS/JS frontend,
Node.js/Express REST API backend (MVC architecture), and a MySQL database.

```
Yaazhlan/
│
├── database.sql                 ← run this first to create the DB + table
│
├── frontend/
│   ├── index.html                (registration + login page)
│   ├── dashboard.html             (shown after successful login)
│   ├── style.css
│   ├── script.js                  (fetch calls to the backend)
│   └── assets/
│
├── backend/
│   ├── server.js                  (Express app entry point)
│   ├── db.js                      (re-exports the MySQL pool)
│   ├── package.json
│   ├── .env                       (DB credentials — edit this)
│   ├── uploads/                   (uploaded photos / Aadhaar files land here)
│   ├── routes/studentRoutes.js
│   ├── controllers/studentController.js
│   ├── models/studentModel.js
│   ├── middleware/upload.js       (multer file upload config)
│   ├── middleware/auth.js         (JWT verification)
│   └── config/database.js         (mysql2 connection pool)
│
└── README.md
```

## Data flow

```
Frontend HTML Form  →  Fetch API  →  Express Router  →  Controller  →  Model  →  MySQL
                                                                                    │
Frontend Success Message  ←  JSON Response  ←──────────────────────────────────────┘
```

---

## 1. Prerequisites

- Node.js and npm installed
- MySQL Server running locally (MySQL Workbench, XAMPP, or the standalone MySQL service all work)

---

## 2. Create the database

Open a terminal (Command Prompt / PowerShell) and run:

```bash
mysql -u root -p < database.sql
```

You'll be prompted for your MySQL root password. This creates the `yaazhlan_dance_studio`
database and the `students` table. (You can also just paste the contents of `database.sql`
into MySQL Workbench and run it.)

---

## 3. Configure the backend

```bash
cd backend
```

Open `.env` and fill in your real MySQL password and a random JWT secret:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=yaazhlan_dance_studio
PORT=5000
JWT_SECRET=your_secret_key
```

---

## 4. Install dependencies

```bash
npm install
```

This installs: `express`, `mysql2`, `bcrypt`, `multer`, `cors`, `dotenv`,
`express-validator`, `jsonwebtoken`, and `nodemon` (dev dependency).

---

## 5. Start the backend server

```bash
npm start
```
or, for auto-restart on file changes during development:
```bash
npm run dev
```

You should see:
```
✅ Connected to MySQL database: yaazhlan_dance_studio
🚀 Yaazhlan Dance Studio backend running at http://localhost:5000
```

---

## 6. Open the frontend

Simply open `frontend/index.html` in your browser (double-click it, or right-click →
"Open with Live Server" in VS Code). The page will call `http://localhost:5000/api/...`
directly — CORS is already enabled on the backend so this works even though the frontend
and backend are served from different origins.

- Fill in the **Student Registration** form and click **Register Now** → on success you'll
  see the 🎉 **Registration Successful** popup, and a new row appears in the `students` table.
- Use the **Login** section with the username/email + password you just registered → on
  success you're redirected to `dashboard.html`, which shows your saved details.

---

## 7. Test the APIs directly (optional)

With the server running, you can test each endpoint independently.

**Health check**
```bash
curl http://localhost:5000/api/health
```

**Register** (multipart form — easiest via Postman, or curl with `-F`):
```bash
curl -X POST http://localhost:5000/api/register ^
  -F "fullName=Test Student" ^
  -F "phone=9876543210" ^
  -F "whatsapp=9876543210" ^
  -F "email=test@example.com" ^
  -F "course=Bharatanatyam" ^
  -F "username=teststudent" ^
  -F "password=test123" ^
  -F "confirmPassword=test123" ^
  -F "photo=@C:\path\to\photo.jpg"
```
*(On Windows CMD use `^` for line continuation as shown; in PowerShell use a backtick `` ` `` instead, or put it all on one line.)*

**Login**
```bash
curl -X POST http://localhost:5000/api/login ^
  -H "Content-Type: application/json" ^
  -d "{\"identifier\":\"teststudent\",\"password\":\"test123\"}"
```
This returns a JWT `token` — copy it for the next calls.

**Get all students** (protected)
```bash
curl http://localhost:5000/api/students ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get one student**
```bash
curl http://localhost:5000/api/students/1 ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Update a student**
```bash
curl -X PUT http://localhost:5000/api/students/1 ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -d "{\"city\":\"Madurai\",\"state\":\"Tamil Nadu\"}"
```

**Delete a student**
```bash
curl -X DELETE http://localhost:5000/api/students/1 ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 8. Deployment (Netlify Frontend + Railway Backend & Database)

### Frontend Configuration (Netlify)
1. In `frontend/config.js`, update `RAILWAY_BACKEND_URL` with your Railway Express app URL:
   ```javascript
   const RAILWAY_BACKEND_URL = 'https://form-production-47a9.up.railway.app/api';
   ```
2. Commit and deploy the `frontend` directory to Netlify.

### Backend & Database Configuration (Railway)
1. Deploy the `backend` directory to Railway as a Node.js web service.
2. Create a MySQL database service in Railway.
3. Import `database.sql` into your Railway MySQL database.
4. Set the environment variables in Railway service settings:
   - `MYSQL_URL` or `DATABASE_URL` (Railway auto-generates this for MySQL)
   - Or individually: `MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`, `MYSQLPORT`
   - `JWT_SECRET=your_secret_key`
   - `PORT=5000`

---

## Security measures implemented

- **bcrypt** password hashing (12 salt rounds) — passwords are never stored in plain text
- **Prepared statements** everywhere via `mysql2`'s `pool.execute(sql, [params])` — prevents SQL injection
- **express-validator** for required-field, email, and phone validation on every write endpoint
- **Duplicate checks** on email, phone, and username before insert, backed by `UNIQUE` constraints in MySQL as a second line of defense
- **JWT authentication** — `/api/students*` routes require a valid `Authorization: Bearer <token>` header
- **File upload guardrails** — `.jpg/.jpeg/.png/.pdf` only, 5MB max, via multer
- **Centralized error handling** in `server.js` catches unexpected errors and multer errors alike, and never leaks stack traces to the client

## Notes

- The `students` table only has an `emergency_notes` column, so the frontend's "Emergency
  Contact Number" field is combined into that note server-side (see
  `controllers/studentController.js`).
- The "How did you hear about us?" and "Receive WhatsApp updates" fields are collected in the
  UI for your own reference but aren't persisted, since they weren't part of the requested
  `students` schema — add columns for them in `database.sql` + `studentModel.js` if you'd like
  to store them.
- For production: move `.env` out of version control, serve the frontend over HTTPS, and add
  rate limiting (e.g. `express-rate-limit`) to `/api/login`.
