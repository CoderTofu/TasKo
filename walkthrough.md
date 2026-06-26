# Backend Auth & CRUD Setup Walkthrough

We have successfully set up the backend structure for TaskKo. All core configuration, database updates, types, routers, and middlewares are fully built and verified. Several key methods in the controllers are scaffolded with explicit `TODO` challenges to help you learn and get your hands dirty!

---

## 📂 Codebase Reference & Architecture

Here is the list of files modified or created during this setup:

1. **Database Config & Schema**
   - [schema.prisma](file:///c:/Users/laptop/Documents/code/TaskKo/backend/prisma/schema.prisma) — Added the `password` field to the `User` model.
   - [.env](file:///c:/Users/laptop/Documents/code/TaskKo/backend/.env) & [.env.example](file:///c:/Users/laptop/Documents/code/TaskKo/backend/.env.example) — Configured the environment variable `JWT_SECRET`.

2. **Types & Middleware**
   - [types/index.ts](file:///c:/Users/laptop/Documents/code/TaskKo/backend/src/types/index.ts) — Extends the Express `Request` type to support `req.user` in `AuthRequest`.
   - [middleware/auth.middleware.ts](file:///c:/Users/laptop/Documents/code/TaskKo/backend/src/middleware/auth.middleware.ts) — Automatically decodes incoming JWT tokens in the `Authorization` header, queries the user from the database, and injects it into `req.user`.

3. **Controllers (Your Exercises)**
   - [controller/auth.controller.ts](file:///c:/Users/laptop/Documents/code/TaskKo/backend/src/controller/auth.controller.ts) — Contains `register` (fully functional) and `login` (**Exercise 1**).
   - [controller/user.controller.ts](file:///c:/Users/laptop/Documents/code/TaskKo/backend/src/controller/user.controller.ts) — Contains `getMe` (fully functional) and `updateMe` (**Exercise 2**).
   - [controller/task.controller.ts](file:///c:/Users/laptop/Documents/code/TaskKo/backend/src/controller/task.controller.ts) — Contains `getTasks`, `getTaskById`, and `createTask` (fully functional) alongside `updateTask` (**Exercise 3**) and `deleteTask` (**Exercise 4**).

4. **Routes Integration**
   - [routes/auth.routes.ts](file:///c:/Users/laptop/Documents/code/TaskKo/backend/src/routes/auth.routes.ts) — Unprotected endpoints for register and login.
   - [routes/user.routes.ts](file:///c:/Users/laptop/Documents/code/TaskKo/backend/src/routes/user.routes.ts) — Protected user endpoints using `requireAuth`.
   - [routes/task.routes.ts](file:///c:/Users/laptop/Documents/code/TaskKo/backend/src/routes/task.routes.ts) — Protected task endpoints using `requireAuth`.
   - [routes/index.ts](file:///c:/Users/laptop/Documents/code/TaskKo/backend/src/routes/index.ts) — Main API router indexing all namespaces.
   - [index.ts](file:///c:/Users/laptop/Documents/code/TaskKo/backend/src/index.ts) — App entry point mounting the API router at `/api`.

---

## 🎯 Exercises For You

Inside each controller, search for `// EXERCISE TODO:` to find the scaffolded block.

### Exercise 1: User Login
- **File**: [auth.controller.ts](file:///c:/Users/laptop/Documents/code/TaskKo/backend/src/controller/auth.controller.ts#L61)
- **Goal**: Read `email` and `password` from the request. Compare the password with the user's hashed password in the DB using `bcrypt.compare`. If valid, generate a JWT token using `jwt.sign` and return it.

### Exercise 2: Update User Profile
- **File**: [user.controller.ts](file:///c:/Users/laptop/Documents/code/TaskKo/backend/src/controller/user.controller.ts#L22)
- **Goal**: Update the user's name/email in the database based on the authenticated user ID (`req.user.id`).

### Exercise 3: Update Task
- **File**: [task.controller.ts](file:///c:/Users/laptop/Documents/code/TaskKo/backend/src/controller/task.controller.ts#L108)
- **Goal**: Fetch the task, verify that the logged-in user is the owner, apply the updates, and return the modified task.

### Exercise 4: Delete Task
- **File**: [task.controller.ts](file:///c:/Users/laptop/Documents/code/TaskKo/backend/src/controller/task.controller.ts#L146)
- **Goal**: Fetch the task, verify ownership, delete it from the database, and return a success message.

---

## 🧪 Testing Your Backend

### Step 1: Start the Backend Server
Run the dev server from the root of the project:
```bash
npm run dev:backend
```

### Step 2: Register a New User
Send a POST request to register a user.
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123","name":"Alice"}'
```
> This will return a JSON object containing your new JWT token. Copy the token!

### Step 3: Fetch the User Profile
Use your copied JWT token to access the protected user profile route.
```bash
curl -H "Authorization: Bearer <YOUR_TOKEN>" http://localhost:4000/api/users/me
```

### Step 4: Create a New Task
Create a task associated with your user.
```bash
curl -X POST http://localhost:4000/api/tasks \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Complete backend exercises","description":"Finish writing controllers"}'
```

### Step 5: Test the Unfinished Routes (Your Exercises!)
- If you call `POST /api/auth/login`, `PUT /api/users/me`, `PUT /api/tasks/:id`, or `DELETE /api/tasks/:id`, you will receive a `501 Not Implemented` response.
- Once you write your code, they will return the correct status and data!
