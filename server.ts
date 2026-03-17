import express from "express";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import Razorpay from "razorpay";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
            { name: "Kesar Delight", variety: "K केसर", description: "Famous for its bright orange pulp and intense fragrance.", price: 950, stock: 75, image_url: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&q=80&w=800", available: 1 }
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
    console.error("Firestore initialization error:", error.message);
    firestoreError = error.message;
  }
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET }) 
  : null;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check
  app.get("/api/db-status", (req, res) => {
    res.json({ 
      type: firestore ? "Firestore" : "None", 
      connected: !!firestore,
      details: firestoreError || "Connected"
    });
  });

  // Razorpay
  app.post("/api/create-razorpay-order", async (req, res) => {
    if (!razorpay) return res.status(500).json({ error: "Razorpay not configured" });
    const { amount, currency = "INR", receipt } = req.body;
    try {
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency,
        receipt,
      });
      res.json(order);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Stripe
  app.post("/api/create-checkout-session", async (req, res) => {
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });
    const { items, customer_email } = req.body;
    const line_items = items.map((item: any) => ({
      price_data: {
        currency: "inr",
        product_data: { name: item.name, images: [item.image_url] },
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
