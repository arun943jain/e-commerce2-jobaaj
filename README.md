# WellShop

WellShop is a React storefront with an Express API. It includes product browsing, a cart, saved addresses, order history, an admin area, email confirmations, cash on delivery, and Stripe checkout.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- MongoDB
- Cloudinary and SMTP credentials
- Stripe credentials for online payments (optional if using cash on delivery only)

## Run locally

### API

From the project root, install the server packages:

```sh
cd server
npm install
```

Copy `server/.env.example` to `server/.env` and fill in the MongoDB, JWT, Cloudinary, and email values. The server requires these settings to start. Stripe keys are needed only for online payments. Keep secrets in the server environment and out of the client.

Start the API from `server`:

```sh
npm run dev
```

It listens on port `4000` by default. Set `PORT` to use another port.

### Storefront

In a second terminal:

```sh
cd client
npm install
npm run dev
```

Vite serves the storefront at `http://localhost:5173` by default. The client can also be built with `npm run build`; `npm run preview` serves that build locally. Run `npm run lint` for the client lint check.

## Configuration

The server reads its settings from `server/.env`. The sample file lists the accepted variables, including `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `FRONTEND_URL`. Stripe checkout is available when configured; cash-on-delivery orders do not depend on Stripe.

## API routes

All API routes use the `/api` prefix. Protected routes expect the JWT in the `token` header.

| Method | Route | Access |
|---|---|---|
| GET | `/api/health` | Public |
| POST | `/api/user/login` | Public |
| POST | `/api/user/verify` | Public |
| GET | `/api/user/me` | Signed in |
| GET | `/api/product/all` | Public |
| GET | `/api/product/:id` | Public |
| POST | `/api/product/new` | Signed in; admin required |
| PUT | `/api/product/:id` | Signed in; admin required |
| POST | `/api/product/:id` | Signed in; admin required; image update |
| DELETE | `/api/product/:id` | Signed in; admin required |
| POST | `/api/cart/add` | Signed in |
| POST | `/api/cart/update` | Signed in |
| GET | `/api/cart/all` | Signed in |
| GET | `/api/cart/remove/:id` | Signed in |
| POST | `/api/address/new` | Signed in |
| POST | `/api/address/add` | Signed in |
| GET | `/api/address/all` | Signed in |
| GET | `/api/address/:id` | Signed in |
| PUT | `/api/address/:id` | Signed in |
| DELETE | `/api/address/:id` | Signed in |
| DELETE | `/api/address/delete/:id` | Signed in |
| POST | `/api/order/new/cod` | Signed in |
| POST | `/api/order/new/online` | Signed in; Stripe configured |
| POST | `/api/order/verify/payment` | Signed in; Stripe configured |
| POST | `/api/order/webhook/stripe` | Stripe signature |
| GET | `/api/order/all` | Signed in |
| GET | `/api/order/admin/all` | Signed in |
| GET | `/api/order/:id` | Signed in |
| POST or PUT | `/api/order/:id` | Signed in; admin required |
| GET | `/api/stats` | Signed in; admin required |

## Frontend notes

The client source is under `client/src`. Its `@/` import alias points to that directory. Styling uses Tailwind CSS 3.4 and the UI components use Radix primitives.
