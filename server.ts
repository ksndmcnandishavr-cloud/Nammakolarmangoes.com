import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import Stripe from "stripe";
import Razorpay from "razorpay";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("mangoes.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    variety TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    stock INTEGER NOT NULL,
    available INTEGER DEFAULT 1,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    total REAL NOT NULL,
    delivery_charge REAL DEFAULT 0,
    promo_code TEXT,
    payment_id TEXT,
    payment_status TEXT DEFAULT 'pending',
    payment_method TEXT,
    paid_amount REAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    tracking_id TEXT,
    estimated_delivery TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY(order_id) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    code TEXT,
    discount_percent REAL,
    active INTEGER DEFAULT 1,
    image_url TEXT
  );
`);

// Seed initial data if empty
const productCount = db.prepare("SELECT count(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const insert = db.prepare("INSERT INTO products (name, variety, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)");
  insert.run("Premium Alphonso", "Alphonso", "The king of mangoes, known for its rich, creamy texture and sweet aroma.", 1200, 50, "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800");
  insert.run("Sweet Badami", "Badami", "Often called the Karnataka Alphonso, it's incredibly sweet and pulpy.", 800, 100, "https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=800");
  insert.run("Kesar Delight", "Kesar", "Famous for its bright orange pulp and intense fragrance.", 950, 75, "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&q=80&w=800");
}

const offerCount = db.prepare("SELECT count(*) as count FROM offers").get() as { count: number };
if (offerCount.count === 0) {
  const insert = db.prepare("INSERT INTO offers (title, description, code, discount_percent, image_url) VALUES (?, ?, ?, ?, ?)");
  insert.run("Early Bird Special", "Get 10% off on your first order of the season!", "SEASON10", 10, "https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=800");
  insert.run("Bulk Order Discount", "Order above 20kg and get 15% off automatically.", "BULK15", 15, "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800");
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Ensure new columns exist
  try { db.exec("ALTER TABLE orders ADD COLUMN tracking_id TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE orders ADD COLUMN estimated_delivery TEXT"); } catch (e) {}

  const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
  const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET ? new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  }) : null;

  // API Routes
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.post("/api/products", (req, res) => {
    const { name, variety, description, price, stock, image_url } = req.body;
    const info = db.prepare("INSERT INTO products (name, variety, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)")
      .run(name, variety, description, price, stock, image_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/products/:id", (req, res) => {
    const { name, variety, description, price, stock, available } = req.body;
    db.prepare("UPDATE products SET name = ?, variety = ?, description = ?, price = ?, stock = ?, available = ? WHERE id = ?")
      .run(name, variety, description, price, stock, available ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/offers", (req, res) => {
    const offers = db.prepare("SELECT * FROM offers").all();
    res.json(offers);
  });

  app.post("/api/offers", (req, res) => {
    const { title, description, code, discount_percent, image_url } = req.body;
    const info = db.prepare("INSERT INTO offers (title, description, code, discount_percent, image_url) VALUES (?, ?, ?, ?, ?)")
      .run(title, description, code, discount_percent, image_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/offers/:id", (req, res) => {
    const { title, description, code, discount_percent, active } = req.body;
    db.prepare("UPDATE offers SET title = ?, description = ?, code = ?, discount_percent = ?, active = ? WHERE id = ?")
      .run(title, description, code, discount_percent, active ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/offers/:id", (req, res) => {
    db.prepare("DELETE FROM offers WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/orders", (req, res) => {
    const orders = db.prepare(`
      SELECT o.*, GROUP_CONCAT(p.name || ' (' || oi.quantity || 'x' || oi.price || ')') as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `).all();
    res.json(orders);
  });

  app.put("/api/orders/:id", (req, res) => {
    const { status, tracking_id, estimated_delivery } = req.body;
    db.prepare("UPDATE orders SET status = ?, tracking_id = ?, estimated_delivery = ? WHERE id = ?")
      .run(status, tracking_id, estimated_delivery, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/orders/history", (req, res) => {
    const { email, phone } = req.query;
    if (!email && !phone) {
      return res.status(400).json({ error: "Email or phone required" });
    }
    const orders = db.prepare(`
      SELECT o.*, GROUP_CONCAT(p.name || ' (' || oi.quantity || 'x' || oi.price || ')') as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.customer_email = ? OR o.phone = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `).all(email, phone);
    res.json(orders);
  });

  app.post("/api/orders", (req, res) => {
    const { 
      customer_name, 
      customer_email, 
      address, 
      phone, 
      items, 
      total, 
      delivery_charge, 
      promo_code,
      payment_id,
      payment_status,
      payment_method,
      paid_amount
    } = req.body;
    
    const transaction = db.transaction(() => {
      const info = db.prepare(`
        INSERT INTO orders (
          customer_name, 
          customer_email, 
          address, 
          phone, 
          total, 
          delivery_charge, 
          promo_code,
          payment_id,
          payment_status,
          payment_method,
          paid_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        customer_name, 
        customer_email, 
        address, 
        phone, 
        total, 
        delivery_charge, 
        promo_code,
        payment_id,
        payment_status,
        payment_method,
        paid_amount
      );
      const orderId = info.lastInsertRowid;

      const insertItem = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
      const updateStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");

      for (const item of items) {
        insertItem.run(orderId, item.id, item.quantity, item.price);
        updateStock.run(item.quantity, item.id);
      }
      return orderId;
    });

    const orderId = transaction();
    res.json({ id: orderId });
  });

  app.post("/api/create-razorpay-order", async (req, res) => {
    if (!razorpay) {
      return res.status(500).json({ error: "Razorpay not configured on server" });
    }

    const { amount, currency = "INR", receipt } = req.body;

    try {
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // amount in paise
        currency,
        receipt,
      });
      res.json(order);
    } catch (err: any) {
      console.error("Razorpay order creation failed:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/create-checkout-session", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const { items, customer_email } = req.body;
    const line_items = items.map((item: any) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
          images: [item.image_url],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        customer_email,
        success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL}/cart`,
      });
      res.json({ id: session.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Auth
  app.post("/api/seller/login", (req, res) => {
    const { pin } = req.body;
    // Simple hardcoded PIN for demo purposes
    if (pin === "1234") {
      res.json({ success: true, token: "seller-token-xyz" });
    } else {
      res.status(401).json({ error: "Invalid PIN" });
    }
  });

  app.get("/api/buyer/history", (req, res) => {
    const { email } = req.query;
    const orders = db.prepare(`
      SELECT o.*, GROUP_CONCAT(p.name || ' (x' || oi.quantity || ')') as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.customer_email = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `).all(email);
    res.json(orders);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
