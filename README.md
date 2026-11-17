# WellShop — MERN E-Commerce

A full-stack e-commerce application with a React + Vite frontend and an Express + MongoDB backend.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite 8, React Router 7, Tailwind CSS 3.4, shadcn/ui (Radix, default style), Lucide |
| Backend | Node.js, Express 5, Mongoose 9, JWT, Multer, Cloudinary, Nodemailer |

## Project Structure

```text
2_E-Commerce_2/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── ui/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── components.json
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── package.json
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js 20.19+ or 22.12+ (required by Vite 8)
- npm
- A MongoDB connection string
- Cloudinary account and SMTP credentials for image upload and email features

## Backend Setup

```bash
cd server
npm install
```

Create `server/.env` with the following keys (values are environment-specific and must not be committed):

```dotenv
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_smtp_email
EMAIL_PASSWORD=your_smtp_password
```

Run the API:

```bash
npm run dev   # nodemon
npm start     # production
```

The server listens on `PORT` (default `5000`) and all routes are mounted under `/api`.

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` by default.

Other scripts:

```bash
npm run build     # production build
npm run preview   # preview the production build
npm run lint      # oxlint
```

## API Overview

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/user/login` | No |
| POST | `/api/user/verify` | No |
| GET | `/api/user/me` | Yes |
| GET | `/api/product/all` | No |
| GET | `/api/product/:id` | No |
| POST | `/api/product/new` | Yes |
| PUT | `/api/product/:id` | Yes |
| POST | `/api/product/:id` | Yes |
| POST | `/api/cart/add` | Yes |
| POST | `/api/cart/update` | Yes |
| GET | `/api/cart/all` | Yes |
| GET | `/api/cart/remove/:id` | Yes |
| POST | `/api/address/add` | Yes |
| GET | `/api/address/all` | Yes |
| GET | `/api/address/:id` | Yes |
| DELETE | `/api/address/delete/:id` | Yes |
| POST | `/api/order/new/cod` | Yes |
| GET | `/api/order/all` | Yes |
| GET | `/api/order/admin/all` | Yes |
| GET | `/api/order/:id` | Yes |
| PUT | `/api/order/:id` | Yes |
| GET | `/api/stats` | Yes |

Authenticated requests send the JWT in the `token` header, matching the existing middleware contract.

## Frontend Conventions

- Import alias: `@/` maps to `client/src/`.
- Tailwind CSS is pinned to v3.4.19; do not upgrade to v4.
- shadcn/ui components use the Tailwind-v3-compatible `default` style with Radix primitives.
- Add new shadcn components from the `client` directory:

```bash
npx shadcn@latest add <component>
```
