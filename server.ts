import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import Stripe from "stripe";
import Razorpay from "razorpay";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("mangoes.db");

// Initialize Firebase Admin
let firestore: admin.firestore.Firestore | null = null;
let firestoreError: string | null = null;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY
      .trim()
      .replace(/,$/, '')             // Remove trailing comma if present
      .replace(/^["']+|["']+$/g, '') // Remove all leading/trailing quotes
      .replace(/\\n/g, '\n')         // Convert literal \n to newlines
      .replace(/\r\n/g, '\n');       // Normalize line endings

    // Ensure it has the correct PEM headers/footers if they were somehow mangled
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}`;
    }
    if (!privateKey.includes('-----END PRIVATE KEY-----')) {
      privateKey = `${privateKey}\n-----END PRIVATE KEY-----`;
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    }
    firestore = admin.firestore();
    console.log("Firestore initialized successfully");
    
    // Seed Firestore if empty
    const seedFirestore = async () => {
      try {
        const productsSnapshot = await firestore!.collection("products").limit(1).get();
        if (productsSnapshot.empty) {
          console.log("Seeding Firestore with initial data...");
          const products = [
            { name: "Premium Alphonso", variety: "Alphonso", description: "The king of mangoes, known for its rich, creamy texture and sweet aroma.", price: 1200, stock: 50, image_url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800", available: 1 },
            { name: "Sweet Badami", variety: "Badami", description: "Often called the Karnataka Alphonso, it's incredibly sweet and pulpy.", price: 800, stock: 100, image_url: "https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=800", available: 1 },
            { name: "Kesar Delight", variety: "Kesar", description: "Famous for its bright orange pulp and intense fragrance.", price: 950, stock: 75, image_url: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&q=80&w=800", available: 1 }
          ];
          for (const p of products) await firestore!.collection("products").add(p);

          const testimonials = [
            { name: "Amrutesh oli", rating: 5, review: "The best Kolar mangoes I've ever had. They arrived perfectly ripe and the sweetness is unmatched.", date: "May 2025", language: "en", active: 1 },
            { name: "ಅಮೃತೇಶ್ ಓಲಿ", rating: 5, review: "ನಾನು ತಿಂದ ಅತ್ಯುತ್ತಮ ಕೋಲಾರ ಮಾವಿನ ಹಣ್ಣುಗಳು. ಅವು ಸರಿಯಾಗಿ ಹಣ್ಣಾಗಿದ್ದವು ಮತ್ತು ಸಿಹಿ ಅದ್ಭುತವಾಗಿದೆ.", date: "May 2025", language: "kn", active: 1 }
          ];
          for (const t of testimonials) await firestore!.collection("testimonials").add(t);

          const offers = [
            { title: "Kolar Harvest Special", description: "Get 10% off on your first order of the season!", code: "KOLAR10", discount_percent: 10, active: 1, image_url: "https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=800" }
          ];
          for (const o of offers) await firestore!.collection("offers").add(o);
          console.log("Firestore seeded successfully");
        }
      } catch (e) {
        console.error("Error seeding Firestore:", e);
      }
    };
    seedFirestore();
  } catch (error: any) {
    console.error("Firestore initialization error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    firestoreError = error.message;
  }
} else {
  console.log("Firestore environment variables missing. Falling back to SQLite.");
  firestoreError = "Missing environment variables";
}

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
  app.get("/api/db-status", async (req, res) => {
    let isConnected = false;
    let details = "";

    if (firestore) {
      try {
        // Try a simple read to verify connection
        await firestore.collection("products").limit(1).get();
        isConnected = true;
        details = "Connected to Firestore";
      } catch (e: any) {
        isConnected = false;
        details = `Firestore connection failed: ${e.message}`;
        console.error(details);
      }
    } else {
      isConnected = !!db;
      details = firestoreError ? `Falling back to SQLite: ${firestoreError}` : "Using SQLite";
    }

    res.json({ 
      type: firestore ? "Firestore" : "SQLite",
      connected: isConnected,
      details: details
    });
  });

  app.get("/api/db-status", (req, res) => {
    res.json({
      connected: !!firestore,
      type: firestore ? "Firestore" : "SQLite",
      error: firestoreError
    });
  });

  app.get("/api/products", async (req, res) => {
    if (firestore) {
      const snapshot = await firestore.collection("products").get();
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json(products);
    }
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    const { name, variety, description, price, stock, image_url } = req.body;
    if (firestore) {
      const docRef = await firestore.collection("products").add({
        name, variety, description, price, stock, image_url, available: 1
      });
      return res.json({ id: docRef.id });
    }
    const info = db.prepare("INSERT INTO products (name, variety, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)")
      .run(name, variety, description, price, stock, image_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/products/:id", async (req, res) => {
    const { name, variety, description, price, stock, available } = req.body;
    if (firestore) {
      await firestore.collection("products").doc(req.params.id).update({
        name, variety, description, price, stock, available: available ? 1 : 0
      });
      return res.json({ success: true });
    }
    db.prepare("UPDATE products SET name = ?, variety = ?, description = ?, price = ?, stock = ?, available = ? WHERE id = ?")
      .run(name, variety, description, price, stock, available ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/offers", async (req, res) => {
    if (firestore) {
      const snapshot = await firestore.collection("offers").get();
      const offers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json(offers);
    }
    const offers = db.prepare("SELECT * FROM offers").all();
    res.json(offers);
  });

  app.post("/api/offers", async (req, res) => {
    const { title, description, code, discount_percent, image_url } = req.body;
    if (firestore) {
      const docRef = await firestore.collection("offers").add({
        title, description, code, discount_percent, image_url, active: 1
      });
      return res.json({ id: docRef.id });
    }
    const info = db.prepare("INSERT INTO offers (title, description, code, discount_percent, image_url) VALUES (?, ?, ?, ?, ?)")
      .run(title, description, code, discount_percent, image_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/offers/:id", async (req, res) => {
    const { title, description, code, discount_percent, active } = req.body;
    if (firestore) {
      await firestore.collection("offers").doc(req.params.id).update({
        title, description, code, discount_percent, active: active ? 1 : 0
      });
      return res.json({ success: true });
    }
    db.prepare("UPDATE offers SET title = ?, description = ?, code = ?, discount_percent = ?, active = ? WHERE id = ?")
      .run(title, description, code, discount_percent, active ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/offers/:id", async (req, res) => {
    if (firestore) {
      await firestore.collection("offers").doc(req.params.id).delete();
      return res.json({ success: true });
    }
    db.prepare("DELETE FROM offers WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/orders", async (req, res) => {
    if (firestore) {
      const snapshot = await firestore.collection("orders").orderBy("created_at", "desc").get();
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json(orders);
    }
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
    const { status, tracking_id, estimated_delivery } = req.body;
    if (firestore) {
      await firestore.collection("orders").doc(req.params.id).update({
        status, tracking_id, estimated_delivery
      });
      return res.json({ success: true });
    }
    db.prepare("UPDATE orders SET status = ?, tracking_id = ?, estimated_delivery = ? WHERE id = ?")
      .run(status, tracking_id, estimated_delivery, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/orders/history", async (req, res) => {
    const { email, phone } = req.query;
    if (!email && !phone) {
      return res.status(400).json({ error: "Email or phone required" });
    }
    if (firestore) {
      let query: admin.firestore.Query = firestore.collection("orders");
      if (email) query = query.where("customer_email", "==", email);
      if (phone) query = query.where("phone", "==", phone);
      
      const snapshot = await query.orderBy("created_at", "desc").get();
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json(orders);
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
    
    if (firestore) {
      const orderData = {
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
        paid_amount,
        status: 'pending',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        items: items.map((item: any) => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };
      const docRef = await firestore.collection("orders").add(orderData);
      
      // Update stock in Firestore
      for (const item of items) {
        const productRef = firestore.collection("products").doc(String(item.id));
        await productRef.update({
          stock: admin.firestore.FieldValue.increment(-item.quantity)
        });
      }
      
      return res.json({ id: docRef.id });
    }

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

  app.get("/api/buyer/history", async (req, res) => {
    const { email } = req.query;
    if (firestore) {
      const snapshot = await firestore.collection("orders")
        .where("customer_email", "==", email)
        .orderBy("created_at", "desc")
        .get();
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json(orders);
    }
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
    if (firestore) {
      const docRef = await firestore.collection("bookings").add({
        name, phone, date, time, guests, status: 'pending', created_at: admin.firestore.FieldValue.serverTimestamp()
      });
      return res.json({ id: docRef.id });
    }
    const info = db.prepare("INSERT INTO bookings (name, phone, date, time, guests) VALUES (?, ?, ?, ?, ?)")
      .run(name, phone, date, time, guests);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/bookings", async (req, res) => {
    if (firestore) {
      const snapshot = await firestore.collection("bookings").orderBy("date", "desc").get();
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json(bookings);
    }
    const bookings = db.prepare("SELECT * FROM bookings ORDER BY date DESC, time DESC").all();
    res.json(bookings);
  });

  app.put("/api/bookings/:id", async (req, res) => {
    const { status } = req.body;
    if (firestore) {
      await firestore.collection("bookings").doc(req.params.id).update({ status });
      return res.json({ success: true });
    }
    db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/testimonials", async (req, res) => {
    const { language } = req.query;
    if (firestore) {
      const snapshot = await firestore.collection("testimonials")
        .where("active", "==", 1)
        .where("language", "==", language || 'en')
        .get();
      const testimonials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json(testimonials);
    }
    const testimonials = db.prepare("SELECT * FROM testimonials WHERE active = 1 AND language = ?").all(language || 'en');
    res.json(testimonials);
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
