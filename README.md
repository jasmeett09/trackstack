# trackstack

TrackStack is a multi-tenant inventory management app for teams that need to track products, suppliers, and stock movements. Each organization has its own inventory, users, dashboard, and activity history.

## Features

- **Inventory:** Manage items, categories, and suppliers. Search and filter records, attach item images, and spot low stock.
- **Purchases and sales:** Record stock in and stock out. Sales update inventory and cannot take stock below zero.
- **Team access:** Create an organization as its admin, invite teammates, and assign `admin`, `manager`, or `staff` roles. Data and live updates are scoped to each organization.
- **Dashboards and reports:** Review sales trends, top-selling items, and recent activity. Export inventory as PDF and sales or purchases as CSV.
- **Live updates:** Socket.IO broadcasts stock changes and notifications to signed-in users in the same organization.

## Stack and Structure

| Layer | Technology and responsibility |
| --- | --- |
| Frontend | React, Vite, React Router, and GSAP |
| Backend | Node.js, Express REST APIs, and server-rendered EJS pages |
| Relational data | PostgreSQL and Prisma for users, organizations, invitations, inventory, and transactions |
| Document data | MongoDB and Mongoose for activity logs, inventory logs, and notifications. Production sessions are persisted with `connect-mongo`. |
| Authentication | Passport, bcrypt, session cookies, and JWT for token-protected routes |
| Media and real-time | Cloudinary and Multer for image uploads; Socket.IO for live events |

```text
trackstack/
|-- inventory-backend/               # Express API and EJS views
|   |-- prisma/                      # PostgreSQL schema and migrations
|   |-- src/                         # Routes, controllers, services, and middleware
|   `-- tests/                       # Jest and Supertest tests
`-- inventory-management-app/my-app/ # React frontend and Vite configuration
```

## Run Locally

Use Node.js 22.12 or later, npm, PostgreSQL, and MongoDB. Start both databases and create an empty PostgreSQL database named `inventory_management_system` (or use another name and update `DATABASE_URL`). The examples below use PowerShell. On macOS or Linux, use `cp .env.example .env` in place of `Copy-Item`.

### Backend

```powershell
git clone https://github.com/jasmeett09/trackstack.git
cd trackstack/inventory-backend
npm ci
Copy-Item .env.example .env
```

Edit `inventory-backend/.env` with your local values. If you already have this file, keep it instead of copying the example over it.

| Variable | Local configuration |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection URI. Update the username, password, and database to match your local server. |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/inventory_management_system` for a default local MongoDB instance. |
| `SESSION_SECRET`, `JWT_SECRET` | Two separate random values. Run `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` twice. |
| `FRONTEND_URL`, `ALLOWED_ORIGINS` | Start with `http://localhost:5173`. If Vite picks another port, use its actual URL. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Required for item image uploads. You can skip uploading images when testing without Cloudinary. |

Then generate the Prisma client, apply the checked-in migrations to the local database, and start Express:

```powershell
npx prisma generate
npx prisma migrate deploy
npm run dev
```

The backend is available at [localhost:5000](http://localhost:5000). API reference: [Swagger UI](http://localhost:5000/docs) and [OpenAPI JSON](http://localhost:5000/api/docs.json).

### Frontend

From the repository root in a second terminal:

```powershell
cd inventory-management-app/my-app
npm ci
npm run dev
```

Open [localhost:5173](http://localhost:5173). Vite proxies API and Socket.IO requests to `http://localhost:5000`, so no frontend environment file is needed for the default local setup. Create an organization to sign in as its first admin, then add a category, a supplier, and an inventory item.

## Deployment

| Service | Project settings |
| --- | --- |
| **Render** | Root Directory: `inventory-backend`. Build: `npm ci && npx prisma generate`. Start: `npx prisma migrate deploy && npm start`. |
| **Vercel** | Root Directory: `inventory-management-app/my-app`. Preset: Vite. Build: `npm run build`. Output: `dist`. |

1. On Render, set `NODE_ENV=production`, the database URIs, auth secrets, and Cloudinary values from [the backend environment template](inventory-backend/.env.example). Leave `PORT` to Render. Use a Neon connection URL suitable for Prisma migrations and an Atlas URI that explicitly ends in `/inventory_management_system` before any query options.
2. In Atlas, allowlist the Render service's outbound IP ranges. Give the app's database user access only to the application database.
3. On Vercel, set both `VITE_API_BASE_URL` and `VITE_SOCKET_URL` to the Render HTTPS origin. After Vercel deploys, set both `FRONTEND_URL` and `ALLOWED_ORIGINS` in Render to the Vercel production origin and redeploy the backend.
4. Test sign-up, login after a refresh, image upload, a stock update, and a report export. Local users and data are not copied to the hosted databases automatically.

The frontend uses a session cookie. Browsers that block third-party cookies can interfere with login and live updates when using separate `vercel.app` and `onrender.com` domains. For a public deployment, use HTTPS subdomains under the same domain, such as `app.example.com` and `api.example.com`.

Keep database connection strings, auth secrets, and Cloudinary credentials in the backend environment. Never commit `.env` files or put private values in `VITE_` variables, which are included in the frontend build.

## Checks

Run the focused backend tests from `inventory-backend`:

```powershell
npm test -- --runTestsByPath tests/organizationService.test.js tests/releaseSecurity.test.js tests/reportExportService.test.js tests/openapi.test.js
```

Run `npm run build` from `inventory-management-app/my-app` to check the production frontend build.
