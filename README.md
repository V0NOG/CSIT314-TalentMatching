# CSIT314 Talent Matching

Full-stack talent matching application with a React/Vite frontend and an Express/MongoDB backend.

## Project Structure

```text
CSIT314-TalentMatching/
|-- backend/      # Express API, MongoDB models, auth, jobs, recommendations
`-- frontend/     # React + Vite client
```

The frontend talks to the backend at `http://localhost:5050` by default.

## Requirements

Install these before starting:

- Node.js 18 or newer
- npm
- Git
- A MongoDB Atlas account

Check your local versions:

```bash
node -v
npm -v
git --version
```

## Quick Start

Clone the repository:

```bash
git clone <repo-url>
cd CSIT314-TalentMatching
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

Create environment files:

```bash
cd ../backend
cp .env.example .env

cd ../frontend
cp .env.example .env
```

Fill in the backend `.env` with your MongoDB Atlas connection string and JWT secrets before running the app.

## Backend Environment

Create `backend/.env` from `backend/.env.example`.

```env
NODE_ENV=development
PORT=5050
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175

MONGO_URI=mongodb+srv://<db_username>:<db_password>@<cluster-name>.mongodb.net/talent_matching?retryWrites=true&w=majority

JWT_ACCESS_SECRET=<long-random-string>
JWT_REFRESH_SECRET=<different-long-random-string>

ACCESS_TOKEN_TTL=55m
REFRESH_TOKEN_TTL=7d

COOKIE_SECURE=false
# COOKIE_DOMAIN=
```

Important backend env notes:

- `MONGO_URI` must be your own MongoDB Atlas connection string.
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` should be different long random strings.
- `CORS_ORIGINS` must include the exact frontend URL shown by Vite in your terminal.
- Vite usually starts on `http://localhost:5173`, but if that port is busy it may use `5174`, `5175`, or another nearby port.
- If your frontend runs on a different port, add it to `CORS_ORIGINS`.
- Do not commit `.env` files.

Generate JWT secrets with Node:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Run the command twice and use different values for access and refresh secrets.

## Frontend Environment

Create `frontend/.env` from `frontend/.env.example`.

```env
VITE_API_URL=http://localhost:5050
VITE_GOOGLE_CLIENT_ID=
```

Important frontend env notes:

- `VITE_API_URL` should point to the backend server.
- Do not add a trailing slash to `VITE_API_URL`.
- Any variable used by Vite in the browser must start with `VITE_`.
- After changing `frontend/.env`, restart the Vite dev server.

## MongoDB Atlas Setup

Use MongoDB Atlas for the hosted database.

### 1. Create an Atlas Project

1. Go to MongoDB Atlas.
2. Create an account or sign in.
3. Create a new project for this app.

### 2. Create a Database Deployment

1. In the Atlas project, create a new database deployment.
2. A free or shared development cluster is enough for local development.
3. Choose a cloud provider and region close to you.
4. Wait for the deployment to finish.

### 3. Create a Database User

1. Open the Atlas project.
2. Go to `Database Access`.
3. Add a new database user.
4. Choose password authentication.
5. Save the username and password somewhere secure.
6. Give the user read/write access for the project database.

This is not your Atlas login. It is a database user used by the app.

### 4. Allow Your IP Address

1. Go to `Network Access`.
2. Add your current IP address.
3. Save the change and wait for Atlas to apply it.

For local development, Atlas may offer an `Add Current IP Address` option.

Avoid `0.0.0.0/0` unless you understand the risk. It allows connections from anywhere and should not be used casually.

### 5. Copy the Driver Connection String

1. Go to `Database`.
2. Select your deployment.
3. Click `Connect`.
4. Choose the driver/application connection option.
5. Select Node.js if Atlas asks for a driver.
6. Copy the connection string.

It will look similar to this:

```env
mongodb+srv://<db_username>:<db_password>@<cluster-name>.mongodb.net/?retryWrites=true&w=majority
```

Replace:

- `<db_username>` with your database username.
- `<db_password>` with your database password.
- Add a database name after `.mongodb.net/`, for example `talent_matching`.

Recommended final format:

```env
MONGO_URI=mongodb+srv://myUser:myPassword@cluster0.abcde.mongodb.net/talent_matching?retryWrites=true&w=majority
```

If your username or password contains special characters such as `@`, `:`, `/`, `?`, `#`, `[`, `]`, `&`, or `%`, URL-encode them before putting them in the connection string. For example, `@` becomes `%40`.

## Running the App

Start the backend first:

```bash
cd backend
npm run dev
```

Expected backend output:

```text
[server] Connected to MongoDB
[server] Running on port 5050
```

In a second terminal, start the frontend:

```bash
cd frontend
npm run dev
```

Vite will print a local URL, usually:

```text
http://localhost:5173
```

Open that URL in your browser.

## Common Commands

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
npm run build
```

## Signup and Login Flow

The app supports two roles:

- `candidate`
- `employer`

Both roles register through:

```text
POST /api/auth/register
```

The backend creates the user in MongoDB, returns an access token, and sets HTTP-only auth cookies.

## CORS Troubleshooting

If signup or login fails with a browser error like:

```text
Access to XMLHttpRequest at 'http://localhost:5050/api/auth/register'
from origin 'http://localhost:5175' has been blocked by CORS policy
```

Check `backend/.env`:

```env
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

The origin in the browser error must exactly appear in `CORS_ORIGINS`.

After editing `backend/.env`, restart the backend.

Also check `frontend/.env`:

```env
VITE_API_URL=http://localhost:5050
```

After editing `frontend/.env`, restart the frontend.

## MongoDB Troubleshooting

If the backend fails with `MongoDB connection error`:

- Check that `MONGO_URI` is present in `backend/.env`.
- Check that your database username and password are correct.
- Check that the password is URL-encoded if it contains special characters.
- Check that your current IP address is allowed in Atlas Network Access.
- Check that your Atlas cluster has finished provisioning.
- Check that you are using a database user, not your Atlas account login.

If the backend exits with `Missing required environment variable`:

- Make sure `backend/.env` exists.
- Make sure you started the backend from the `backend` directory.
- Make sure `MONGO_URI`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` are set.

## Port Reference

| Service | Default URL |
| --- | --- |
| Backend API | `http://localhost:5050` |
| Frontend | `http://localhost:5173` |
| Swagger API docs | `http://localhost:5050/api-docs` |

If Vite uses a different frontend port, update `backend/.env`.

## API Health Check

With the backend running, visit:

```text
http://localhost:5050/
```

Expected response:

```json
{
  "message": "Talent Matching API is running"
}
```

## Security Notes

- Never commit `.env` files.
- Do not share MongoDB passwords or JWT secrets.
- Use unique secrets per developer or environment.
- Rotate credentials if they are accidentally committed or shared.
- Keep `COOKIE_SECURE=false` for local HTTP development.
- Use `COOKIE_SECURE=true` when deploying over HTTPS.

## References

- MongoDB Atlas driver connection guide: https://www.mongodb.com/docs/atlas/driver-connection/
- MongoDB Atlas IP access list guide: https://www.mongodb.com/docs/guides/atlas/network-connections/
- MongoDB Node.js driver connection guide: https://www.mongodb.com/docs/drivers/node/current/connect/connection-targets/
