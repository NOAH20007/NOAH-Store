# NOAH Store

A full-stack premium game top-up web store targeting the Cambodian market. Users can purchase in-game currency and battle passes for popular mobile games.

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (Replit built-in)
- **Fonts:** Google Fonts (Outfit)
- **Payment:** ABA Pay and KHQR (Bakong) — users scan QR codes and submit screenshots via Telegram

## Project Structure

```
.
├── backend/
│   ├── server.js           # Express app — serves static files + API
│   └── db.js               # Database connection & schema initialization
├── index.html              # Main landing page
├── mobilelegend.html       # Mobile Legends checkout
├── pubg.html               # PUBG Mobile checkout
├── freefire.html           # Free Fire checkout
├── bloodstrike.html        # Blood Strike checkout
├── honorofkings.html       # Honor of Kings checkout
├── magicgogo.html          # Magic GoGo checkout
├── admin.html              # Admin panel (password protected)
├── track.html              # Customer order tracking page
├── script.js               # Main JS (carousel, checkout, API calls)
├── style.css               # Global stylesheet
├── assets/                 # Game icons and banner images
└── images-events/          # Promotional banners and payment logos
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/orders` | Create a new order |
| GET | `/api/orders/track/:orderId` | Customer order tracking |
| GET | `/api/admin/orders` | Admin: list all orders (auth required) |
| PATCH | `/api/admin/orders/:id/status` | Admin: update order status |
| GET | `/api/admin/stats` | Admin: dashboard stats |

## Database Schema

```sql
orders (id, order_id, game, game_key, user_id, zone_id, username, package_name, price, payment_method, status, notes, created_at, updated_at)
```

Status values: `pending` → `processing` → `completed` / `rejected`

## Admin Panel

Visit `/admin` in the browser. Default password: `noahstore-admin`

Set the `ADMIN_PASSWORD` environment variable to change it.

## Development

```bash
node backend/server.js
```

Runs on port 5000, serving both static files and the API.

## Deployment

Configured as **autoscale** — runs `node backend/server.js`.
