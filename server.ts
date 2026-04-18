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

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    guests INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    review TEXT NOT NULL,
    date TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS product_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id)
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

const testimonialCount = db.prepare("SELECT count(*) as count FROM testimonials").get() as { count: number };
if (testimonialCount.count === 0) {
  const insert = db.prepare("INSERT INTO testimonials (name, rating, review, date, language) VALUES (?, ?, ?, ?, ?)");
  insert.run("Amrutesh oli", 5, "The best Alphonso mangoes I've ever had. They arrived perfectly ripe and the sweetness is unmatched. Reminds me of my childhood summers in Kolar.", "May 2025", "en");
  insert.run("ಅಮೃತೇಶ್ ಓಲಿ", 5, "ನಾನು ತಿಂದ ಅತ್ಯುತ್ತಮ ಆಲ್ಪಾನ್ಸೋ ಮಾವಿನ ಹಣ್ಣುಗಳು. ಅವು ಸರಿಯಾಗಿ ಹಣ್ಣಾಗಿದ್ದವು ಮತ್ತು ಸಿಹಿ ಅದ್ಭುತವಾಗಿದೆ. ಕೋಲಾರದಲ್ಲಿ ಕಳೆದ ನನ್ನ ಬಾಲ್ಯದ ದಿನಗಳನ್ನು ನೆನಪಿಸುತ್ತದೆ.", "May 2025", "kn");
  insert.run("Priya Sharma", 5, "Ordered 10kg for a family gathering. Everyone was asking where I got them from. The packaging was very secure and eco-friendly.", "June 2025", "en");
  insert.run("ಪ್ರಿಯಾ ಶರ್ಮಾ", 5, "ಕುಟುಂಬದ ಸಮಾರಂಭಕ್ಕಾಗಿ 10 ಕೆಜಿ ಆರ್ಡರ್ ಮಾಡಿದ್ದೆ. ಎಲ್ಲರೂ ಇವುಗಳನ್ನು ಎಲ್ಲಿಂದ ತಂದೆ ಎಂದು ಕೇಳುತ್ತಿದ್ದರು. ಪ್ಯಾಕೇಜಿಂಗ್ ತುಂಬಾ ಸುರಕ್ಷಿತವಾಗಿತ್ತು.", "June 2025", "kn");
}

const offerCount = db.prepare("SELECT count(*) as count FROM offers").get() as { count: number };
if (offerCount.count === 0) {
  const insert = db.prepare("INSERT INTO offers (title, description, code, discount_percent, image_url) VALUES (?, ?, ?, ?, ?)");
  insert.run("Early Bird Special", "Get 10% off on your first order of the season!", "SEASON10", 10, "https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=800");
  insert.run("Bulk Order Discount", "Order above 20kg and get 15% off automatically.", "BULK15", 15, "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800");
}

const reviewCount = db.prepare("SELECT count(*) as count FROM product_reviews").get() as { count: number };
if (reviewCount.count === 0) {
  const insert = db.prepare("INSERT INTO product_reviews (product_id, name, rating, comment) VALUES (?, ?, ?, ?)");
  // Assuming Alphonso is ID 1, Badami is 2, Kesar is 3
  insert.run(1, "Rahul M.", 5, "Absolutely delicious! Best Alphonso I've had this season.");
  insert.run(1, "Sneha K.", 4, "Very sweet and aromatic. Packaging was good.");
  insert.run(2, "Vijay R.", 5, "Badami mangoes were very pulpy and sweet. Great value.");
  insert.run(3, "Anjali P.", 5, "Kesar mangoes have such a unique fragrance. Loved them!");
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Ensure new columns exist
  try { db.exec("ALTER TABLE orders ADD COLUMN tracking_id TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE orders ADD COLUMN estimated_delivery TEXT"); } catch (e) {}

  const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
  const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET ? new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID.trim(),
    key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
  }) : null;

  // API Routes
  app.get("/api/db-status", async (req, res) => {
    res.json({ 
      type: "SQLite",
      connected: !!db,
      details: "Using SQLite"
    });
  });

  app.get("/api/products", async (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    const { name, variety, description, price, stock, image_url } = req.body;
    const info = db.prepare("INSERT INTO products (name, variety, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)")
      .run(name, variety, description, price, stock, image_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/products/:id", async (req, res) => {
    const { name, variety, description, price, stock, available } = req.body;
    db.prepare("UPDATE products SET name = ?, variety = ?, description = ?, price = ?, stock = ?, available = ? WHERE id = ?")
      .run(name, variety, description, price, stock, available ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/offers", async (req, res) => {
    const offers = db.prepare("SELECT * FROM offers").all();
    res.json(offers);
  });

  app.post("/api/offers", async (req, res) => {
    const { title, description, code, discount_percent, image_url } = req.body;
    const info = db.prepare("INSERT INTO offers (title, description, code, discount_percent, image_url) VALUES (?, ?, ?, ?, ?)")
      .run(title, description, code, discount_percent, image_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/offers/:id", async (req, res) => {
    const { title, description, code, discount_percent, active } = req.body;
    db.prepare("UPDATE offers SET title = ?, description = ?, code = ?, discount_percent = ?, active = ? WHERE id = ?")
      .run(title, description, code, discount_percent, active ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/offers/:id", async (req, res) => {
    db.prepare("DELETE FROM offers WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/orders", async (req, res) => {
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

  app.put("/api/orders/:id", async (req, res) => {
    const { status, tracking_id, estimated_delivery, payment_status, paid_amount } = req.body;
    db.prepare("UPDATE orders SET status = ?, tracking_id = ?, estimated_delivery = ?, payment_status = COALESCE(?, payment_status), paid_amount = COALESCE(?, paid_amount) WHERE id = ?")
      .run(status, tracking_id, estimated_delivery, payment_status, paid_amount, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/orders/history", async (req, res) => {
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

  app.post("/api/orders", async (req, res) => {
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
      const errorMessage = err.error?.description || err.message || 'Failed to create Razorpay order';
      res.status(500).json({ error: errorMessage });
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

  app.get("/api/verify-stripe-session", async (req, res) => {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: "Missing session_id" });

    try {
      const session = await stripe.checkout.sessions.retrieve(session_id as string);
      if (session.payment_status === 'paid') {
        // Update order status and paid amount
        db.prepare(`
          UPDATE orders 
          SET payment_status = 'paid', paid_amount = ?, status = 'confirmed' 
          WHERE payment_id = ?
        `).run(session.amount_total! / 100, session_id);
        
        res.json({ success: true });
      } else {
        res.json({ success: false, status: session.payment_status });
      }
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

  app.get("/api/buyer/history", async (req, res) => {
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

  // Bookings
  app.post("/api/bookings", async (req, res) => {
    const { name, phone, date, time, guests } = req.body;
    const info = db.prepare("INSERT INTO bookings (name, phone, date, time, guests) VALUES (?, ?, ?, ?, ?)")
      .run(name, phone, date, time, guests);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/bookings", async (req, res) => {
    const bookings = db.prepare("SELECT * FROM bookings ORDER BY date DESC, time DESC").all();
    res.json(bookings);
  });

  app.put("/api/bookings/:id", async (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/testimonials", async (req, res) => {
    const { language } = req.query;
    const testimonials = db.prepare("SELECT * FROM testimonials WHERE active = 1 AND language = ?").all(language || 'en');
    res.json(testimonials);
  });

  app.get("/api/products/:id/reviews", async (req, res) => {
    const { id } = req.params;
    const reviews = db.prepare("SELECT * FROM product_reviews WHERE product_id = ? ORDER BY created_at DESC").all(id);
    res.json(reviews);
  });

  app.post("/api/products/:id/reviews", async (req, res) => {
    const { id } = req.params;
    const { name, rating, comment } = req.body;
    const info = db.prepare("INSERT INTO product_reviews (product_id, name, rating, comment) VALUES (?, ?, ?, ?)")
      .run(id, name, rating, comment);
    res.json({ id: info.lastInsertRowid });
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
