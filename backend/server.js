require("dotenv").config();
const express = require("express");
const path = require("path");
const { pool, initDb } = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "noahstore-admin";

app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

function generateOrderId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "NS-";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function adminAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Basic ")) {
    res.set("WWW-Authenticate", 'Basic realm="NOAH Store Admin"');
    return res.status(401).json({ error: "Authentication required" });
  }
  const encoded = auth.split(" ")[1];
  const decoded = Buffer.from(encoded, "base64").toString("utf-8");
  const [user, pass] = decoded.split(":");
  if (user === "admin" && pass === ADMIN_PASSWORD) {
    return next();
  }
  res.set("WWW-Authenticate", 'Basic realm="NOAH Store Admin"');
  return res.status(401).json({ error: "Invalid credentials" });
}

app.post("/api/orders", async (req, res) => {
  try {
    const { game, gameKey, userId, zoneId, username, packageName, price, paymentMethod } = req.body;

    if (!game || !gameKey || !userId || !packageName || !price || !paymentMethod) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const orderId = generateOrderId();

    const result = await pool.query(
      `INSERT INTO orders (order_id, game, game_key, user_id, zone_id, username, package_name, price, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [orderId, game, gameKey, userId, zoneId || null, username || null, packageName, price, paymentMethod]
    );

    return res.status(201).json({ order: result.rows[0] });
  } catch (err) {
    console.error("POST /api/orders error:", err);
    return res.status(500).json({ error: "Failed to create order" });
  }
});

app.get("/api/orders/track/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await pool.query(
      "SELECT order_id, game, package_name, price, payment_method, status, created_at, updated_at FROM orders WHERE order_id = $1",
      [orderId.toUpperCase()]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.json({ order: result.rows[0] });
  } catch (err) {
    console.error("GET /api/orders/track error:", err);
    return res.status(500).json({ error: "Failed to fetch order" });
  }
});

app.get("/api/admin/orders", adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM orders";
    const params = [];

    if (status) {
      query += " WHERE status = $1";
      params.push(status);
    }

    query += " ORDER BY created_at DESC LIMIT $" + (params.length + 1) + " OFFSET $" + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);

    const countQuery = status
      ? "SELECT COUNT(*) FROM orders WHERE status = $1"
      : "SELECT COUNT(*) FROM orders";
    const countResult = await pool.query(countQuery, status ? [status] : []);

    return res.json({
      orders: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error("GET /api/admin/orders error:", err);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.patch("/api/admin/orders/:id/status", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ["pending", "processing", "completed", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const result = await pool.query(
      "UPDATE orders SET status = $1, notes = COALESCE($2, notes) WHERE id = $3 RETURNING *",
      [status, notes || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.json({ order: result.rows[0] });
  } catch (err) {
    console.error("PATCH /api/admin/orders/:id/status error:", err);
    return res.status(500).json({ error: "Failed to update order" });
  }
});

app.get("/api/admin/stats", adminAuth, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'processing') AS processing,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected,
        COALESCE(SUM(price) FILTER (WHERE status = 'completed'), 0) AS revenue
      FROM orders
    `);
    return res.json(stats.rows[0]);
  } catch (err) {
    console.error("GET /api/admin/stats error:", err);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "admin.html"));
});

app.get("/track", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "track.html"));
});

initDb().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NOAH Store server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
