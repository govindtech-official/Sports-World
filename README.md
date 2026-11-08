# Sports World

Sports World is a server-backed sports store built with Node.js and MongoDB. Product, cart, order, stock, user, admin, coupon, and custom jersey design data is stored in MongoDB, along with uploaded product photos, jersey previews, and payment screenshots, so nothing is lost when the server restarts or redeploys.

## Database

The store needs a MongoDB replica set, because orders and stock changes use transactions. A free MongoDB Atlas **M0** cluster works:

1. Create an M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, add a database user with a password.
3. Under **Network Access**, allow `0.0.0.0/0`. Render's free plan has no fixed outbound IP address.
4. Copy the cluster's `mongodb+srv://` connection string, put the user's password in it, and set it as `MONGODB_URI`.

`MONGODB_DB` picks the database name (default `sports_world`); use a different name such as `sports_world_dev` for local development. On first start the server creates its indexes and the demo catalog. The free tier holds 512 MB, and each uploaded image is at most 4 MB.

## Run locally

1. Copy `.env.example` to `.env` and set `MONGODB_URI`, your Google OAuth client ID, client secret, redirect URI, and `FIRST_SUPERADMIN_EMAIL`.
2. Set `FIRST_SUPERADMIN_EMAIL` to the Google-verified email that should own the super-admin account. That account signs in only through Google.
3. Install dependencies and start the store:

   ```powershell
   npm install
   npm run dev
   ```

4. Open `http://localhost:3000`.

## Deploy on Render

The repository includes a `render.yaml` Blueprint for a free Node web service. Render's free service can spin down when idle, but all store data lives in MongoDB, so restarts and deploys keep it. See Render's [free service limits](https://render.com/docs/free).

1. In Render, create a new Blueprint and connect `govindtech-official/Sports-World`.
2. In Google Cloud, create a Web application OAuth client and add `https://sportsworld.kiitgotlatent.com/auth/google/callback` as an authorized redirect URI. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Render Environment, and set `FIRST_SUPERADMIN_EMAIL` to the Google email that should own the store.
3. Set `MONGODB_URI` in Render Environment to your Atlas connection string.
4. Confirm the service plan is **Free**, then create the Blueprint. Render will build from the `main` branch and redeploy on future pushes.

Set OAuth secrets and the MongoDB connection string only in Render Environment (or local .env); never commit them. Super admins create admin accounts using each person's Google email, and that exact verified email is required to enter the admin panel.

## Store contact settings

Set these values in `.env`, then restart the server:

```env
OWNER_PHONE_NUMBER=your-number
SHOP_INSTAGRAM_HANDLE=your-instagram-handle
```

The shop name and address live in `server.js` under `config`. The supplied logo and storefront image are in `assets/`. The application displays Indian rupees; product prices and fixed coupon amounts entered in the admin panel use paise (100 paise = ₹1).

## Admin roles

- `customer`: registers, shops, saves designs, and places orders.
- `admin`: manages products and stock.
- `superadmin`: creates admins and super admins, plus creates coupons.

Sign in with Google using the first super admin email and select **Admin Panel**. The super-admin panel is grouped into expandable sections. The Products & stock section adds products and records each stock adjustment with the previous quantity, new quantity, reason, user, and timestamp. The Coupons and Admin accounts sections only appear for a super admin. Customer activity reports export account/login totals, successful login history, and product views as UTF-8 CSV files that open in Excel. Login history begins at deployment; product views are recorded only for signed-in customers when at least half of a product card is visible, at most once per customer/product per day. These reports omit IP addresses and passwords.

## Android admin app

Open `https://sports-world-xe7d.onrender.com/admin-app` in Android Chrome and sign in with the Google email assigned an admin or super-admin role. Use **Install app** or Chrome's **⋮ → Install app / Add to Home screen** menu. The app opens directly to the admin panel; customer accounts cannot enter it. It is an installable Android web app (PWA), not a Play Store APK. Private API responses are never cached by the service worker, so store management requires an internet connection.

## Demo inventory

The initial catalog uses clearly marked demo products. Archive them in **Admin Panel → Products & stock** once live inventory is added. Product creation accepts up to eight PNG, JPEG, or WebP photos (4 MB each). Use **Admin Panel → Store photos** to change the homepage hero photo or add images to the shop gallery. Removing a photo hides it from the storefront while keeping its uploaded file in the database.

## Deployment notes

Run behind HTTPS with `NODE_ENV=production` so session cookies use the `Secure` flag, set `MONGODB_URI`, and set `PORT` to the host-provided port.
