# NOAH Store

A premium game top-up web store targeting the Cambodian market. Users can purchase in-game currency (Diamonds, UC, Tokens) and battle passes for popular mobile games.

## Tech Stack

- **Frontend:** Pure HTML5, CSS3, Vanilla JavaScript (ES6+) — no build tools
- **Fonts:** Google Fonts (Outfit)
- **Payment:** ABA Pay and KHQR (Bakong) — users scan QR codes and submit screenshots via Telegram for manual verification

## Project Structure

```
.
├── index.html              # Main landing page
├── mobilelegend.html       # Mobile Legends checkout page
├── pubg.html               # PUBG Mobile checkout page
├── freefire.html           # Free Fire checkout page
├── bloodstrike.html        # Blood Strike checkout page
├── honorofkings.html       # Honor of Kings checkout page
├── magicgogo.html          # Magic/GoGo checkout page
├── script.js               # Main JS (carousel, game DB, checkout logic)
├── style.css               # Global stylesheet
├── assets/                 # Game icons and banner images
└── images-events/          # Promotional banners and payment logos
```

## Development

The site is served via Python's built-in HTTP server on port 5000:

```bash
python3 -m http.server 5000 --bind 0.0.0.0
```

## Deployment

Configured as a **static** deployment — files are served directly with no backend.
