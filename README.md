# Sports World

Sports World is a server-backed sports store built with Node.js and SQLite. Product, cart, order, stock, user, admin, coupon, and custom jersey design data is stored in `data/sports-world.db` when the application runs.

## Run locally

1. Copy `.env.example` to `.env` and set your Google OAuth client ID, client secret, redirect URI, and `FIRST_SUPERADMIN_EMAIL`.
2. Set `FIRST_SUPERADMIN_EMAIL` to the Google-verified email that should own the super-admin account. The server seeds that account with a random, unusable password; it can sign in only through Google.
3. Start the store:

   ```powershell
   npm run dev
   ```

4. Open `http://localhost:3000`.

No package installation is required. The project uses Node 24's built-in SQLite runtime.

## Deploy on Render

The repository includes a `render.yaml` Blueprint for a free Node web service. Render's free service has an ephemeral filesystem and can spin down when idle. The SQLite database and administrator-uploaded photos can be lost on restarts or deploys, so this free setup is suitable for a preview rather than dependable live orders. See Render's [free service limits](https://render.com/docs/free).

1. In Render, create a new Blueprint and connect `govindtech-official/Sports-World`.
2. In Google Cloud, create a Web application OAuth client and add `https://sports-world-xe7d.onrender.com/auth/google/callback` as an authorized redirect URI. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Render Environment; keep the initial super-admin email set to `contactgovindtech@gmail.com`.
3. Confirm the service plan is **Free**, then create the Blueprint. Render will build from the `main` branch and redeploy on future pushes.

Set OAuth secrets only in Render Environment (or local .env); never commit the client secret. Super admins create admin accounts using each person's Google email, and that exact verified email is required to enter the admin panel.

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

The initial catalog uses clearly marked demo products. Archive them in **Admin Panel → Products & stock** once live inventory is added. Product creation accepts up to eight PNG, JPEG, or WebP photos (4 MB each). Use **Admin Panel → Store photos** to change the homepage hero photo or add images to the shop gallery. Removing a photo hides it from the storefront while keeping its uploaded file on disk.

## Deployment notes

Run behind HTTPS with `NODE_ENV=production` so session cookies use the `Secure` flag. Keep `data/` and `uploads/` on persistent storage. Render Free web services have ephemeral filesystems, so their local SQLite database, uploads, and activity reports are lost on redeploy, restart, or spin-down. Use persistent storage or a persistent database before relying on the live site's inventory and customer reports. Then set `PORT` to the host-provided port.
