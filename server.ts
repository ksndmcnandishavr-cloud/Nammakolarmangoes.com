import express from "express";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  setDoc,
  getDoc,
  deleteDoc,
  Timestamp,
  limit
} from "firebase/firestore";
import Stripe from "stripe";
import Razorpay from "razorpay";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
  apiKey: "AIzaSyDqZmwd4kevY9adJgoFxdjz3wuPZvivLM4",
  authDomain: "namma-kolar-mangoes.firebaseapp.com",
  projectId: "namma-kolar-mangoes",
  storageBucket: "namma-kolar-mangoes.firebasestorage.app",
  messagingSenderId: "502912484733",
  appId: "1:502912484733:web:4f8902048a0ae187faf814",
  measurementId: "G-V8NTMEBNTX"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Seed initial data helper
async function seedData() {
  const productsCol = collection(db, "products");
  const productSnapshot = await getDocs(query(productsCol, limit(1)));
  
  if (productSnapshot.empty) {
    const products = [
      { name: "Premium Alphonso", variety: "Alphonso", description: "The king of mangoes, known for its rich, creamy texture and sweet aroma.", price: 1200, stock: 50, image_url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800", available: 1 },
      { name: "Sweet Badami", variety: "Badami", description: "Often called the Karnataka Alphonso, it's incredibly sweet and pulpy.", price: 800, stock: 100, image_url: "https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=800", available: 1 },
      { name: "Kesar Delight", variety: "Kesar", description: "Famous for its bright orange pulp and intense fragrance.", price: 950, stock: 75, image_url: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&q=80&w=800", available: 1 }
    ];
    for (const p of products) {
      await addDoc(productsCol, p);
    }
  }

  const offersCol = collection(db, "offers");
  const offerSnapshot = await getDocs(query(offersCol, limit(1)));
  if (offerSnapshot.empty) {
    const offers = [
      { title: "Early Bird Special", description: "Get 10% off on your first order of the season!", code: "SEASON10", discount_percent: 10, image_url: "https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=800", active: 1 },
      { title: "Bulk Order Discount", description: "Order above 20kg and get 15% off automatically.", code: "BULK15", discount_percent: 15, image_url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800", active: 1 }
    ];
    for (const o of offers) {
      await addDoc(offersCol, o);
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  await seedData();

  const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
  const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET ? new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  }) : null;

  // API Routes
  app.get("/api/products", async (req, res) => {
    try {
      const productsCol = collection(db, "products");
      const snapshot = await getDocs(productsCol);
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const { name, variety, description, price, stock, image_url } = req.body;
      const docRef = await addDoc(collection(db, "products"), {
        name, variety, description, price, stock, image_url, available: 1
      });
      res.json({ id: docRef.id });
    } catch (err) {
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const { name, variety, description, price, stock, available } = req.body;
      const productRef = doc(db, "products", req.params.id);
      await updateDoc(productRef, {
        name, variety, description, price, stock, available: available ? 1 : 0
      });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.get("/api/offers", async (req, res) => {
    try {
      const offersCol = collection(db, "offers");
      const snapshot = await getDocs(offersCol);
      const offers = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      res.json(offers);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch offers" });
    }
  });

  app.post("/api/offers", async (req, res) => {
    try {
      const { title, description, code, discount_percent, image_url } = req.body;
      const docRef = await addDoc(collection(db, "offers"), {
        title, description, code, discount_percent, image_url, active: 1
      });
      res.json({ id: docRef.id });
    } catch (err) {
      res.status(500).json({ error: "Failed to create offer" });
    }
  });

  app.put("/api/offers/:id", async (req, res) => {
    try {
      const { title, description, code, discount_percent, active } = req.body;
      const offerRef = doc(db, "offers", req.params.id);
      await updateDoc(offerRef, {
        title, description, code, discount_percent, active: active ? 1 : 0
      });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update offer" });
    }
  });

  app.delete("/api/offers/:id", async (req, res) => {
    try {
      await deleteDoc(doc(db, "offers", req.params.id));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete offer" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const ordersCol = collection(db, "orders");
      const snapshot = await getDocs(ordersCol);
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })) as any[];
      // Sort in memory to avoid index requirement
      orders.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    try {
      const { status, tracking_id, estimated_delivery } = req.body;
      const orderRef = doc(db, "orders", req.params.id);
      await updateDoc(orderRef, {
        status, tracking_id, estimated_delivery
      });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  app.get("/api/orders/history", async (req, res) => {
    try {
      const { email, phone } = req.query;
      if (!email && !phone) {
        return res.status(400).json({ error: "Email or phone required" });
      }
      
      const ordersCol = collection(db, "orders");
      let q;
      if (email) {
        q = query(ordersCol, where("customer_email", "==", email));
      } else {
        q = query(ordersCol, where("phone", "==", phone));
      }
      
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })) as any[];
      // Sort in memory to avoid index requirement
      orders.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch order history" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
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
      
      // In Firestore we don't have built-in transactions like SQLite for simple cases easily without more boilerplate
      // But we can just add the doc and update stocks
      
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
        items, // Store items directly in the order doc for Firestore
        created_at: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      
      // Update stocks
      for (const item of items) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const currentStock = productSnap.data().stock || 0;
          await updateDoc(productRef, { stock: currentStock - item.quantity });
        }
      }

      res.json({ id: docRef.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create order" });
    }
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
    try {
      const { email } = req.query;
      const ordersCol = collection(db, "orders");
      const q = query(ordersCol, where("customer_email", "==", email));
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })) as any[];
      // Sort in memory to avoid index requirement
      orders.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch buyer history" });
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
