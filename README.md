# Sports World

Sports World is a server-backed sports store built with Node.js and SQLite. Product, cart, order, stock, user, admin, coupon, and custom jersey design data is stored in `data/sports-world.db` when the application runs.

## Run locally

1. Copy `.env.example` to `.env` and replace the example values.
2. Set `FIRST_SUPERADMIN_EMAIL` and `FIRST_SUPERADMIN_PASSWORD` before the first start. This creates the initial super admin only when no super admin exists.
3. Start the store:

   ```powershell
   npm run dev
   ```

4. Open `http://localhost:3000`.

No package installation is required. The project uses Node 24's built-in SQLite runtime.

## Deploy on Render

The repository includes a `render.yaml` Blueprint for a Node web service with a 1 GB persistent disk. The disk stores both the SQLite database and administrator-uploaded photos between deploys. Render requires a paid web service for persistent disks; review the current [Render pricing](https://render.com/pricing) before creating the service.

1. In Render, create a new Blueprint and connect `govindtech-official/Sports-World`.
2. Set the prompted `FIRST_SUPERADMIN_PASSWORD` to a unique password of at least 10 characters. The initial super admin email is `contactgovindtech@gmail.com`.
3. Review the paid service and disk charges, then create the Blueprint. Render will build from the `main` branch and redeploy on future pushes.

Do not put deployment passwords or other secrets in GitHub. Set them in Render's environment settings.

## Store contact settings

Set these values in `.env`, then restart the server:

```env
OWNER_PHONE_NUMBER=your-number
SHOP_INSTAGRAM_HANDLE=your-instagram-handle
```

The shop name and address live in `server.js` under `config`. The supplied logo and storefront image are in `assets/`. The application displays Thai baht; product prices and coupon amounts entered in the admin panel use satang (100 satang = ฿1).

## Admin roles

- `customer`: registers, shops, saves designs, and places orders.
- `admin`: manages products and stock.
- `superadmin`: creates admins and super admins, plus creates coupons.

Log in with the first super admin account and select **Admin Panel**. The Products & stock tab adds products and records each stock adjustment with the previous quantity, new quantity, reason, user, and timestamp. The Coupons and Admins tabs only appear for a super admin.

## Demo inventory

The initial catalog uses clearly marked demo products. Archive them in **Admin Panel → Products & stock** once live inventory is added. Product creation accepts up to eight PNG, JPEG, or WebP photos (4 MB each). Use **Admin Panel → Store photos** to change the homepage hero photo or add images to the shop gallery. Removing a photo hides it from the storefront while keeping its uploaded file on disk.

## Deployment notes

Run behind HTTPS with `NODE_ENV=production` so session cookies use the `Secure` flag. Keep `data/` and `uploads/` on persistent storage. Put the application behind a Node-compatible host that supports persistent disk, then set `PORT` to the host-provided port.
