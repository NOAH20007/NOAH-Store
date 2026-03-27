const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : false,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_id VARCHAR(20) UNIQUE NOT NULL,
      game VARCHAR(100) NOT NULL,
      game_key VARCHAR(20) NOT NULL,
      user_id VARCHAR(100) NOT NULL,
      zone_id VARCHAR(100),
      username VARCHAR(100),
      package_name VARCHAR(150) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await pool.query(`
    DROP TRIGGER IF EXISTS set_updated_at ON orders;
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  `);

  console.log("Database initialized.");
}

module.exports = { pool, initDb };
