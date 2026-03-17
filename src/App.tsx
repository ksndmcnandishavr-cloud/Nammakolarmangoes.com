import React, { useState, useEffect, ChangeEvent, useMemo, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { translations, Language } from './translations';
import { GoogleGenAI } from "@google/genai";
import { db, auth, googleProvider } from './firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  getDoc,
  getDocs,
  deleteDoc,
  increment,
  getDocFromServer
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  ShoppingBasket, 
  User, 
  LayoutDashboard, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ChevronRight,
  Package,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  ArrowLeft,
  Settings,
  LogOut,
  HelpCircle,
  MessageCircle,
  Info,
  BookOpen,
  CreditCard,
  Wallet,
  Lock,
  ShieldCheck,
  Loader2,
  Calendar,
  Image as ImageIcon,
  Upload,
  Star,
  ExternalLink,
  Sparkles,
  Wand2,
  Maximize2
} from 'lucide-react';
import { Product, CartItem, Order, Offer, Testimonial, ProductReview } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

declare const Razorpay: any;

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Firebase Helpers ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean, errorMessage: string }> {
  state = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: any) {
    let message = 'Something went wrong.';
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.error) message = parsed.error;
    } catch (e) {}
    return { hasError: true, errorMessage: message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    const { hasError, errorMessage } = this.state;
    if (hasError) {
      return (
        <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-[32px] shadow-xl max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <X size={32} />
            </div>
            <h2 className="text-2xl font-serif italic text-stone-800">Application Error</h2>
            <p className="text-stone-600 font-sans">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-brand-olive text-white rounded-full font-sans font-bold uppercase tracking-widest hover:bg-brand-olive/90 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

// --- Components ---

const HelpChat = ({ t, language }: { t: any, language: Language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string, sources?: any[] }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      // Get user location for maps grounding if possible
      let location = null;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        location = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };
      } catch (e) {
        console.log("Location not available");
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          { role: 'user', parts: [{ text: `You are a helpful farm assistant for "Namma Kolar Mangoes", a mango farm in Srinivasapura, Kolar. 
            The farm is owned by Ramakrishnareddy V N. 
            Location: Varatanahalli, Srinivasapura, Kolar, Karnataka-563135.
            Coordinates: 13.315970, 78.153239.
            Phone: +91 97430 25459 / 91645 02728.
            We sell varieties like Raspuri, Badami (Alphonso), Mallika, Kesar, and Totapuri.
            Delivery is available in Bangalore within 24-48 hours.
            Free delivery for orders above 15kg.
            Answer in ${language === 'en' ? 'English' : 'Kannada'}.
            Be polite, warm, and helpful.
            Use Google Search for latest mango prices or health benefits.
            Use Google Maps to help users find our farm or check delivery distances.
            User asked: ${userMessage}` }] }
        ],
        config: {
          tools: [
            { googleSearch: {} },
            { googleMaps: {} }
          ],
          toolConfig: location ? {
            retrievalConfig: {
              latLng: location
            }
          } : undefined
        }
      });

      const aiText = response.text || (language === 'en' ? "I'm sorry, I couldn't process that." : "ಕ್ಷಮಿಸಿ, ನನಗೆ ಅದನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.");
      
      // Extract grounding sources
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
        if (chunk.web) return { title: chunk.web.title, uri: chunk.web.uri };
        if (chunk.maps) return { title: chunk.maps.title, uri: chunk.maps.uri };
        return null;
      }).filter(Boolean);

      setMessages(prev => [...prev, { role: 'model', text: aiText, sources }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: language === 'en' ? "Connection error. Please try again." : "ಸಂಪರ್ಕ ದೋಷ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-stone-100"
          >
            {/* Header */}
            <div className="bg-brand-olive p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-serif italic text-xl">{t.chatTitle}</h3>
                <p className="text-[10px] uppercase tracking-widest opacity-70">{t.chatSubtitle}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-50/50">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-mango/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={16} className="text-brand-mango" />
                </div>
                <div className="bg-white p-4 rounded-[20px] rounded-tl-none shadow-sm text-sm text-stone-700 leading-relaxed">
                  {t.chatWelcome}
                </div>
              </div>

              {messages.map((msg, i) => (
                <div key={i} className={cn("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "items-start")}>
                  <div className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      msg.role === 'user' ? "bg-brand-olive/10" : "bg-brand-mango/20"
                    )}>
                      {msg.role === 'user' ? <User size={16} className="text-brand-olive" /> : <MessageCircle size={16} className="text-brand-mango" />}
                    </div>
                    <div className={cn(
                      "p-4 rounded-[20px] shadow-sm text-sm leading-relaxed max-w-[85%]",
                      msg.role === 'user' 
                        ? "bg-brand-olive text-white rounded-tr-none" 
                        : "bg-white text-stone-700 rounded-tl-none"
                    )}>
                      <div className="markdown-body prose prose-sm max-w-none prose-stone prose-invert:text-white">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    </div>
                  </div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className={cn("flex flex-wrap gap-2", msg.role === 'user' ? "justify-end mr-11" : "ml-11")}>
                      {msg.sources.map((source, si) => (
                        <a 
                          key={si} 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-500 px-2 py-1 rounded-full flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink size={10} />
                          {source.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-mango/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <MessageCircle size={16} className="text-brand-mango" />
                  </div>
                  <div className="bg-white p-4 rounded-[20px] rounded-tl-none shadow-sm text-sm text-stone-400">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-stone-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={t.chatPlaceholder}
                className="flex-1 bg-stone-50 border-none rounded-full px-6 py-3 text-sm focus:ring-2 focus:ring-brand-mango/20 outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 rounded-full bg-brand-mango text-stone-900 flex items-center justify-center hover:bg-brand-mango-dark transition-colors disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500",
          isOpen ? "bg-stone-900 text-white rotate-90" : "bg-brand-mango text-stone-900"
        )}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </motion.button>
    </div>
  );
};

const Button = ({ className, variant = 'primary', ...props }: any) => {
  const variants = {
    primary: 'bg-brand-olive text-white hover:bg-stone-700 shadow-lg shadow-brand-olive/20',
    secondary: 'bg-white border border-brand-olive text-brand-olive hover:bg-stone-50',
    mango: 'bg-brand-mango text-stone-900 hover:bg-brand-mango-dark shadow-lg shadow-brand-mango/30',
    ghost: 'hover:bg-stone-100 text-stone-600',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100'
  };
  return (
    <button 
      className={cn(
        'px-8 py-4 rounded-full transition-all active:scale-95 font-sans font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50',
        variants[variant as keyof typeof variants],
        className
      )} 
      {...props} 
    />
  );
};

const Card = ({ children, className, glass = false }: any) => (
  <div className={cn(
    'rounded-[40px] warm-shadow p-8 transition-all duration-500', 
    glass ? 'glass-card' : 'bg-white',
    className
  )}>
    {children}
  </div>
);

// --- Views ---

const ProductCard = ({ product, onAddToCart, onBuyNow, t, buyerEmail }: any) => {
  const [selectedWeight, setSelectedWeight] = useState(5);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const weights = [5, 7.5, 10, 15];

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`);
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: buyerEmail || 'Anonymous',
          rating: newReview.rating,
          comment: newReview.comment
        })
      });
      if (res.ok) {
        setNewReview({ rating: 5, comment: '' });
        setIsReviewing(false);
        fetchReviews();
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9] }}
    >
      <Card className="group overflow-hidden p-0 hover:translate-y-[-12px] hover:shadow-2xl transition-all duration-700 bg-white border border-stone-100/50">
        <div className="aspect-[4/5] overflow-hidden relative p-6">
          <div className="w-full h-full relative">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="w-full h-full leaf-mask overflow-hidden bg-stone-100"
            >
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </motion.div>
            
            {/* Decorative Elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-brand-mango/10 rounded-full blur-2xl group-hover:bg-brand-mango/20 transition-all" />
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-brand-leaf/5 rounded-full blur-2xl group-hover:bg-brand-leaf/10 transition-all" />
          </div>

          <div className="absolute top-10 left-10">
            <span className="bg-white/90 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-brand-olive shadow-sm border border-white/50">
              {product.variety}
            </span>
          </div>
          {product.stock < 10 && product.available === 1 && (
            <div className="absolute top-10 right-10">
              <span className="bg-red-500 text-white px-5 py-2 rounded-full text-[10px] font-sans font-bold uppercase tracking-[0.2em] shadow-lg animate-pulse">
                Limited
              </span>
            </div>
          )}
          {product.available === 0 && (
            <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] flex items-center justify-center z-20">
              <span className="bg-white text-stone-900 px-8 py-3 rounded-full text-xs font-sans font-bold uppercase tracking-[0.3em] shadow-2xl">
                {t.outOfStock}
              </span>
            </div>
          )}
        </div>
        <div className="p-10 pt-4">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-4xl font-serif italic leading-tight mb-2">{product.name}</h3>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-brand-mango" />
                <span className="text-[10px] text-stone-400 font-sans uppercase tracking-[0.2em] font-bold">Harvest 2026</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-serif block text-brand-olive">₹{product.price * selectedWeight}</span>
              <span className="text-[10px] text-stone-400 font-sans uppercase tracking-[0.2em] font-bold">₹{product.price}/kg</span>
            </div>
          </div>
          
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-sans font-bold">{t.selectWeight}</p>
              <span className="text-[10px] text-brand-leaf font-bold uppercase tracking-widest">{t.freeDelivery}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {weights.map(w => (
                <button
                  key={w}
                  onClick={() => setSelectedWeight(w)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-[0.1em] transition-all border-2",
                    selectedWeight === w 
                      ? "bg-brand-olive text-white border-brand-olive shadow-lg scale-105" 
                      : "bg-stone-50 text-stone-400 border-stone-50 hover:border-brand-olive/20 hover:text-brand-olive"
                  )}
                >
                  {w}kg
                </button>
              ))}
            </div>
          </div>

          <p className="text-stone-500 font-sans text-sm mb-6 leading-relaxed opacity-70 italic">
            "{product.description}"
          </p>

          {/* Reviews Section */}
          <div className="mb-8 pt-6 border-t border-stone-100">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-sans font-bold">{t.customerReviews}</h4>
                {averageRating && (
                  <div className="flex items-center gap-1 bg-brand-mango/10 px-2 py-0.5 rounded-full">
                    <Star className="w-2 h-2 fill-brand-mango text-brand-mango" />
                    <span className="text-[10px] font-bold text-brand-mango">{averageRating}</span>
                  </div>
                )}
              </div>
              {buyerEmail ? (
                <button 
                  onClick={() => setIsReviewing(!isReviewing)}
                  className="text-[10px] text-brand-olive font-bold uppercase tracking-widest hover:underline"
                >
                  {isReviewing ? t.backToStore : t.writeReview}
                </button>
              ) : (
                <span className="text-[8px] text-stone-300 uppercase tracking-widest">{t.loginToReview}</span>
              )}
            </div>

            <AnimatePresence mode="wait">
              {isReviewing ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star}
                        onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                        className="p-1"
                      >
                        <Star className={cn("w-5 h-5", star <= newReview.rating ? "fill-brand-mango text-brand-mango" : "text-stone-200")} />
                      </button>
                    ))}
                  </div>
                  <textarea 
                    value={newReview.comment}
                    onChange={e => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder={t.comment}
                    className="w-full bg-stone-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-mango/20 outline-none min-h-[100px]"
                  />
                  <Button 
                    onClick={handleSubmitReview}
                    disabled={isSubmitting || !newReview.comment.trim()}
                    className="w-full py-3 text-[10px]"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t.submitReview}
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar"
                >
                  {reviews.length === 0 ? (
                    <p className="text-[10px] text-stone-400 italic">{t.noReviews}</p>
                  ) : (
                    reviews.map(review => (
                      <div key={review.id} className="bg-stone-50/50 p-4 rounded-2xl border border-stone-100/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-brand-olive uppercase tracking-wider">{review.name}</span>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={cn("w-2 h-2", i < review.rating ? "fill-brand-mango text-brand-mango" : "text-stone-200")} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">{review.comment}</p>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mb-8 flex items-center gap-2 text-stone-400">
            <Clock className="w-3 h-3" />
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest">{t.deliveryTime}</span>
          </div>
          
          <div className="flex gap-4">
            <Button 
              variant="secondary"
              disabled={product.available === 0 || product.stock < selectedWeight}
              onClick={() => onAddToCart(product, selectedWeight)}
              className="flex-1 py-5 group/btn overflow-hidden relative border-stone-200"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <ShoppingBasket className="w-4 h-4" />
                <span className="hidden sm:inline">{t.basket}</span>
              </span>
            </Button>
            <Button 
              variant="mango"
              disabled={product.available === 0 || product.stock < selectedWeight}
              onClick={() => onBuyNow(product, selectedWeight)}
              className="flex-[2] py-5 group/btn overflow-hidden relative"
            >
              <span className="relative z-10">
                {product.available === 0 ? t.outOfStock : (product.stock < selectedWeight ? t.outOfStock : t.buyNow)}
              </span>
              <motion.div 
                className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"
              />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <Card className="p-0 overflow-hidden animate-pulse bg-white border border-stone-100/50">
    <div className="aspect-[4/5] p-6">
      <div className="w-full h-full bg-stone-100 leaf-mask" />
    </div>
    <div className="p-10 pt-4 space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="h-8 bg-stone-100 rounded-lg w-3/4" />
          <div className="h-3 bg-stone-50 rounded-full w-1/4" />
        </div>
        <div className="h-8 bg-stone-100 rounded-lg w-16" />
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-stone-50 rounded-full w-1/4" />
        <div className="flex gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-12 bg-stone-50 rounded-full" />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-stone-50 rounded-full w-full" />
        <div className="h-3 bg-stone-50 rounded-full w-2/3" />
      </div>
      <div className="flex gap-4">
        <div className="h-14 flex-1 bg-stone-100 rounded-full" />
        <div className="h-14 flex-[2] bg-stone-100 rounded-full" />
      </div>
    </div>
  </Card>
);

const Testimonials = ({ t, language, testimonials }: any) => {
  return (
    <section className="py-32 bg-stone-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <div className="h-px w-12 bg-brand-olive/20" />
            <span className="text-brand-olive text-[10px] font-sans font-bold uppercase tracking-[0.4em]">
              {t.testimonialsTitle}
            </span>
            <div className="h-px w-12 bg-brand-olive/20" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif italic text-brand-olive mb-8"
          >
            {t.testimonialsSubtitle}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full flex flex-col justify-between hover:translate-y-[-8px] transition-all duration-500 border border-stone-100">
                <div className="space-y-6">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < testimonial.rating ? "fill-brand-mango text-brand-mango" : "text-stone-200"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xl font-serif italic text-stone-600 leading-relaxed">
                    "{testimonial.review}"
                  </p>
                </div>
                <div className="mt-10 pt-8 border-t border-stone-100 flex justify-between items-center">
                  <div>
                    <p className="font-sans font-bold text-xs uppercase tracking-widest text-brand-olive">
                      {testimonial.name}
                    </p>
                    <p className="text-[10px] font-sans uppercase tracking-widest text-stone-400 mt-1">
                      {testimonial.date}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-brand-mango/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-brand-mango" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Components ---

const Header = ({ onOpenCart, cartCount, onOpenAuth, onOpenHistory, setView, t, language, onLanguageChange }: any) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4",
        isScrolled ? "bg-white/80 backdrop-blur-lg shadow-lg" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          onClick={() => { setView('store'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-brand-mango rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
            <ShoppingBasket className="w-6 h-6 text-stone-900" />
          </div>
          <div className="hidden sm:block">
            <h1 className={cn("font-serif italic text-xl leading-none", isScrolled ? "text-stone-900" : "text-white")}>Namma Kolar</h1>
            <p className={cn("text-[8px] font-sans font-bold uppercase tracking-[0.3em] mt-1", isScrolled ? "text-stone-400" : "text-white/40")}>Mangoes</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-10">
          {[
            { id: 'heritage', label: t.ourStory },
            { id: 'products', label: t.shopHarvest },
            { id: 'visit', label: t.visitOurFarm },
            { id: 'history', label: t.trackOrder }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => {
                setView('store');
                setTimeout(() => {
                  const el = document.getElementById(item.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className={cn(
                "text-[10px] font-sans font-bold uppercase tracking-[0.3em] hover:text-brand-mango transition-colors",
                isScrolled ? "text-stone-500" : "text-white/70"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => onLanguageChange(language === 'en' ? 'kn' : 'en')}
            className={cn(
              "px-3 py-1.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest transition-all",
              isScrolled ? "bg-stone-100 text-stone-600 hover:bg-stone-200" : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
          </button>
          
          <div className="h-6 w-px bg-stone-200/20 mx-2" />

          <button 
            onClick={onOpenAuth}
            className={cn(
              "p-2.5 rounded-full transition-all hover:scale-110",
              isScrolled ? "bg-stone-100 text-stone-600 hover:bg-stone-200" : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            <User className="w-5 h-5" />
          </button>

          <button 
            onClick={onOpenCart}
            className={cn(
              "relative p-2.5 rounded-full transition-all hover:scale-110",
              isScrolled ? "bg-brand-mango text-stone-900" : "bg-white text-brand-olive"
            )}
          >
            <ShoppingBasket className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-[8px] w-5 h-5 rounded-full flex items-center justify-center font-sans font-bold shadow-lg">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </motion.header>
  );
};

const Footer = ({ t, language, onOpenHistory, onOpenAuth }: any) => (
  <footer className="bg-brand-olive text-white pt-32 pb-48 md:pb-32">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
        <div className="md:col-span-2 space-y-10">
          <h3 className="text-5xl font-serif italic leading-tight">{language === 'en' ? 'Namma Kolar' : 'ನಮ್ಮ ಕೋಲಾರ'} <br /> <span className="text-brand-mango">{language === 'en' ? 'Mangoes' : 'ಮಾವು'}</span></h3>
          <p className="text-white/50 font-serif italic text-xl max-w-md">
            {t.heroSubtitle}
          </p>
          <div className="flex gap-6">
            {['Instagram', 'Facebook', 'Twitter'].map(social => (
              <button key={social} className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-white/40 hover:text-brand-mango transition-colors">
                {social}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-8">
          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-brand-mango">{t.quickLinks}</p>
          <ul className="space-y-4 font-serif italic text-lg text-white/60">
            <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">{t.home}</button></li>
            <li><button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">{t.shopHarvest}</button></li>
            <li><button onClick={() => document.getElementById('heritage')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">{t.ourStory}</button></li>
            <li><button onClick={() => document.getElementById('visit')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">{t.visitOurFarm}</button></li>
            <li><button onClick={() => document.getElementById('history')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">{t.trackOrder}</button></li>
            <li><button onClick={onOpenAuth} className="hover:text-white transition-colors">{language === 'en' ? 'Seller Access' : 'ಮಾರಾಟಗಾರರ ಪ್ರವೇಶ'}</button></li>
          </ul>
        </div>

        <div className="space-y-8">
          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-brand-mango">{t.contactUs}</p>
          <ul className="space-y-4 font-serif italic text-lg text-white/60">
            <li className="text-white font-bold not-italic">{language === 'en' ? 'Ramakrishnareddy V N' : 'ರಾಮಕೃಷ್ಣರೆಡ್ಡಿ ವಿ ಎನ್'}</li>
            <li>{language === 'en' ? 'Varatanahalli, Srinivasapura, Kolar, Karnataka-563135' : 'ವರತನಹಳ್ಳಿ, ಶ್ರೀನಿವಾಸಪುರ, ಕೋಲಾರ, ಕರ್ನಾಟಕ-563135'}</li>
            <li>+91 97430 25459 / 91645 02728</li>
          </ul>
        </div>
      </div>

      <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-white/30">
          {t.allRightsReserved}
        </p>
        <div className="flex gap-8">
          <button className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors">{t.privacyPolicy}</button>
          <button className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors">{t.termsOfService}</button>
        </div>
      </div>
    </div>
  </footer>
);

const Storefront = ({ products, offers, testimonials, onAddToCart, onBuyNow, onOpenCart, cartCount, onOpenAuth, onOpenHistory, onOpenBooking, heroBg, onHeroBgChange, isLoading, t, language, onLanguageChange, buyerEmail }: any) => {
  return (
    <div className="min-h-screen pb-0">
      {/* Hero Section */}
      <section id="home" className="relative h-[90vh] md:h-screen flex items-center justify-center overflow-hidden bg-brand-olive">
        <motion.div 
          key={heroBg}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={heroBg} 
            className="w-full h-full object-cover"
            alt="Mango Orchard"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <div className="absolute top-10 right-10 z-30 flex items-center gap-4">
          <div className="hidden md:block">
            <button 
              onClick={() => {
                const newUrl = prompt(t.changeBackground + ':', heroBg);
                if (newUrl && newUrl.trim() !== '') onHeroBgChange(newUrl);
              }}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest text-white hover:bg-white/20 transition-all"
            >
              <Settings className="w-3 h-3" />
              {t.changeBackground}
            </button>
          </div>
        </div>
        
        {/* Floating Elements */}
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-1/4 -left-20 w-64 h-64 opacity-20 hidden md:block"
        >
          <img src="https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-contain leaf-mask" referrerPolicy="no-referrer" loading="lazy" />
        </motion.div>

        <div className="relative z-10 text-center px-6 max-w-6xl">
          <motion.div
            initial={{ y: 20, opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)', scale: 1 }}
            transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-4 mb-10"
          >
            <div className="h-px w-12 bg-brand-mango/50" />
            <span className="text-brand-mango text-[10px] font-sans font-bold uppercase tracking-[0.4em]">
              {t.harvestAvailable}
            </span>
            <div className="h-px w-12 bg-brand-mango/50" />
          </motion.div>

          <motion.h1 
            initial={{ y: 30, opacity: 0, filter: 'blur(20px)', scale: 0.98 }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)', scale: 1 }}
            transition={{ delay: 0.7, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-7xl md:text-[12rem] text-white font-serif mb-10 italic leading-[0.8] tracking-tighter"
          >
            {language === 'en' ? (
              <>Namma <br className="md:hidden" /> <span className="text-brand-mango">Kolar</span> <br /> Mangoes</>
            ) : (
              <>ನಮ್ಮ <br className="md:hidden" /> <span className="text-brand-mango">ಕೋಲಾರ</span> <br /> ಮಾವು</>
            )}
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={{ delay: 1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl md:text-3xl text-white/70 font-serif italic max-w-3xl mx-auto mb-16 leading-relaxed"
          >
            {t.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row items-center justify-center gap-8"
          >
            <Button 
              variant="mango" 
              className="px-16 py-7 text-sm group"
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.exploreHarvest}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <button 
              onClick={() => document.getElementById('heritage')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-white/60 font-sans text-[10px] uppercase tracking-[0.3em] font-bold hover:text-brand-mango transition-colors border-b border-white/20 pb-1"
            >
              {t.ourHeritage}
            </button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-[1px] h-20 bg-gradient-to-b from-brand-mango to-transparent" 
          />
        </motion.div>
      </section>

      {/* Offers Marquee */}
      {offers.filter((o: any) => o.active).length > 0 && (
        <section className="bg-brand-mango py-8 overflow-hidden whitespace-nowrap relative z-20 shadow-xl">
          <div className="flex animate-marquee gap-32 items-center">
            {[...offers.filter((o: any) => o.active), ...offers.filter((o: any) => o.active), ...offers.filter((o: any) => o.active)].map((offer, i) => (
              <div key={i} className="flex items-center gap-8 text-stone-900 font-sans text-[11px] font-bold uppercase tracking-[0.3em]">
                <ShoppingBasket className="w-5 h-5" />
                <span>{offer.title}: {offer.description}</span>
                <span className="bg-stone-900 text-white px-4 py-1 rounded-full text-[9px]">Code: {offer.code}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Heritage Section */}
      <section id="heritage" className="py-32 md:py-64 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <img 
                src="https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=1200" 
                className="rounded-[60px] warm-shadow w-full aspect-[4/5] object-cover"
                alt="Orchard Heritage"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </motion.div>
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-brand-mango/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-brand-leaf/10 rounded-full blur-3xl" />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-10 -right-10 bg-brand-olive p-10 rounded-[40px] text-white warm-shadow hidden md:block"
            >
              <p className="text-5xl font-serif italic mb-2">40+</p>
              <p className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-60">{t.yearsOfExcellence}</p>
            </motion.div>
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
              <span className="text-brand-olive font-sans text-[10px] font-bold uppercase tracking-[0.4em]">{t.ourStory}</span>
              <h2 className="text-6xl md:text-8xl font-serif italic leading-tight">{language === 'en' ? 'Grown with' : 'ಸಂಪ್ರದಾಯದೊಂದಿಗೆ'} <br /> <span className="text-brand-mango">{language === 'en' ? 'Tradition' : 'ಬೆಳೆದಿದೆ'}</span></h2>
            </div>
            <p className="text-xl text-stone-500 font-serif italic leading-relaxed">
              {t.farmDescription}
            </p>
            <div className="grid grid-cols-2 gap-12 pt-8">
              <div className="space-y-2">
                <p className="text-3xl font-serif italic text-brand-olive">100%</p>
                <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">{t.organicMethods}</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-serif italic text-brand-olive">{language === 'en' ? 'Direct' : 'ನೇರ'}</p>
                <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">{t.farmToHome}</p>
              </div>
            </div>
            <div className="pt-8">
              <Button 
                variant="outline" 
                className="px-12 py-5 text-xs border-brand-olive/20 text-brand-olive hover:bg-brand-olive hover:text-white"
                onClick={() => document.getElementById('visit')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t.planVisit}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section id="products" className="max-w-7xl mx-auto px-6 py-32 md:py-48">
        <div className="flex flex-col md:flex-row items-end justify-between mb-32 gap-12">
          <div className="max-w-2xl">
            <span className="text-brand-olive font-sans text-[10px] font-bold uppercase tracking-[0.4em] mb-6 block">
              {t.theCollection}
            </span>
            <h2 className="text-6xl md:text-9xl font-serif italic leading-[0.9] tracking-tighter">
              {language === 'en' ? 'The Varieties' : 'ಕೋಲಾರದ ವಿವಿಧ'} <br /> 
              {language === 'en' ? 'of Kolar' : 'ತಳಿಗಳು'}
            </h2>
            <p className="mt-8 text-stone-400 font-sans text-[10px] uppercase tracking-[0.3em] font-bold">
              {language === 'en' ? 'All Varieties on Single Screen' : 'ಎಲ್ಲಾ ತಳಿಗಳು ಒಂದೇ ಪರದೆಯಲ್ಲಿ'}
            </p>
          </div>
          <div className="flex gap-6">
            <button onClick={onOpenHistory} className="p-5 bg-white rounded-full warm-shadow hover:bg-stone-50 transition-all hover:scale-110 group">
              <Clock className="w-7 h-7 text-brand-olive group-hover:rotate-12 transition-transform" />
            </button>
            <button onClick={onOpenAuth} className="p-5 bg-white rounded-full warm-shadow hover:bg-stone-50 transition-all hover:scale-110 group">
              <User className="w-7 h-7 text-brand-olive group-hover:rotate-12 transition-transform" />
            </button>
            <button onClick={onOpenCart} className="relative p-5 bg-white rounded-full warm-shadow hover:bg-stone-50 transition-all hover:scale-110 group">
              <ShoppingBasket className="w-7 h-7 text-brand-olive group-hover:rotate-12 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-mango text-stone-900 text-[10px] w-7 h-7 rounded-full flex items-center justify-center font-sans font-bold shadow-lg mango-glow animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-20">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)
          ) : (
            products.map((product: Product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onBuyNow={onBuyNow} t={t} buyerEmail={buyerEmail} />
            ))
          )}
        </div>
      </section>

      {/* Visit Our Farm Section */}
      <section id="visit" className="py-32 bg-brand-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass-card rounded-[60px] p-12 md:p-24 flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
            <div className="relative z-10 space-y-8 md:w-1/2">
              <span className="text-brand-olive font-sans text-[10px] font-bold uppercase tracking-[0.4em]">{t.experienceSource}</span>
              <h2 className="text-6xl md:text-8xl font-serif italic leading-tight">{language === 'en' ? 'Visit Our' : 'ನಮ್ಮ ತೋಟಕ್ಕೆ'} <br /> <span className="text-brand-mango">{language === 'en' ? 'Farm' : 'ಭೇಟಿ ನೀಡಿ'}</span></h2>
              <p className="text-xl text-stone-500 font-serif italic leading-relaxed">
                {t.farmDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Button 
                  variant="mango" 
                  className="w-full sm:w-fit px-12 py-5"
                  onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=13.315970,78.153239', '_blank')}
                >
                  {t.getDirections}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-fit px-12 py-5 border-brand-olive/20 text-brand-olive hover:bg-brand-olive hover:text-white"
                  onClick={onOpenBooking}
                >
                  {t.bookSlot}
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.21, 0.45, 0.32, 0.9] }}
                className="relative"
              >
                <img 
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200" 
                  className="rounded-[40px] warm-shadow w-full aspect-[4/3] object-cover"
                  alt="Our Farm in Srinivasapura"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                
                {/* Decorative Leaf */}
                <motion.div 
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                  className="absolute -bottom-10 -right-10 w-32 h-32 text-brand-olive/10 pointer-events-none"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
                  </svg>
                </motion.div>

                {/* Caption */}
                <div className="absolute -bottom-10 left-0 right-0 text-center">
                  <p className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-stone-400">
                    {language === 'en' ? 'Our Farm in Srinivasapura' : 'ಶ್ರೀನಿವಾಸಪುರದಲ್ಲಿರುವ ನಮ್ಮ ತೋಟ'}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Testimonials t={t} language={language} testimonials={testimonials} />

      {/* Order History Section */}
      <section id="history" className="bg-brand-cream py-32">
        <div className="max-w-7xl mx-auto px-6">
          <OrderHistory initialEmail={buyerEmail} t={t} language={language} isSection={true} />
        </div>
      </section>
    </div>
  );
};

const getDeliveryCharge = (weight: number) => {
  if (weight > 15) return 0;
  if (weight > 10) return 25;
  if (weight > 5) return 50;
  return 100;
};

const formatDate = (timestamp: any, language: string = 'en') => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString(language === 'en' ? 'en-IN' : 'kn-IN', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

const formatDateTime = (timestamp: any) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString();
};

const OrderHistory = ({ onBack, initialEmail, t, language, isSection = false }: any) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchHistory = async (searchEmail = email, searchPhone = phone) => {
    if (!searchEmail && !searchPhone) return;
    setLoading(true);
    try {
      let q = query(collection(db, "orders"), orderBy("created_at", "desc"));
      
      if (searchEmail) {
        q = query(q, where("customer_email", "==", searchEmail));
      } else if (searchPhone) {
        q = query(q, where("phone", "==", searchPhone));
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setOrders(data);
      setSearched(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, "orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialEmail) {
      fetchHistory(initialEmail, '');
    }
  }, [initialEmail]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("max-w-4xl mx-auto", !isSection && "px-6 py-12 md:py-32")}
    >
      {!isSection && (
        <button onClick={onBack} className="flex items-center gap-3 text-stone-400 mb-12 hover:text-brand-olive transition-all group">
          <div className="p-2 bg-white rounded-full warm-shadow group-hover:scale-110 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest">{t.backToStore}</span>
        </button>
      )}

      <div className="mb-12">
        <span className="text-brand-olive font-sans text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">{language === 'en' ? 'Track Your' : 'ನಿಮ್ಮ ಆರ್ಡರ್'}</span>
        <h2 className="text-5xl md:text-7xl font-serif italic leading-tight">{language === 'en' ? 'Order' : 'ಆರ್ಡರ್'} <br />{language === 'en' ? 'History' : 'ಇತಿಹಾಸ'}</h2>
      </div>

      <Card className="mb-16 p-8 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-sans font-bold">{t.emailAddress}</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-stone-50 border-2 border-stone-50 rounded-[24px] px-8 py-4 font-sans text-sm focus:border-brand-mango focus:ring-4 focus:ring-brand-mango/5 outline-none transition-all"
              placeholder="your@email.com"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-sans font-bold">{t.phoneNumber}</label>
            <input 
              type="tel" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-stone-50 border-2 border-stone-50 rounded-[24px] px-8 py-4 font-sans text-sm focus:border-brand-mango focus:ring-4 focus:ring-brand-mango/5 outline-none transition-all"
              placeholder="+91 97430 25459 / 91645 02728"
            />
          </div>
        </div>
        <Button variant="mango" onClick={() => fetchHistory()} disabled={loading || (!email && !phone)} className="w-full py-5">
          {loading ? (language === 'en' ? 'Searching...' : 'ಹುಡುಕಲಾಗುತ್ತಿದೆ...') : t.findMyOrders}
        </Button>
      </Card>

      {searched && (
        <div className="space-y-8">
          {orders.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[32px] warm-shadow">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBasket className="w-10 h-10 text-stone-300" />
              </div>
              <p className="text-stone-500 font-serif italic text-xl">{t.noOrdersFound}</p>
              <p className="text-stone-400 font-sans text-[10px] font-bold uppercase tracking-widest mt-2">{t.tryDifferentSearch}</p>
            </div>
          ) : (
            orders.map(order => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={order.id}
              >
                <Card className="p-8 md:p-10 hover:scale-[1.02] transition-all duration-500">
                  <div className="flex flex-wrap justify-between items-start gap-6 mb-8 pb-8 border-b border-stone-100">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-sans font-bold mb-2">{t.orderId}: #{order.id}</p>
                      <p className="text-stone-500 font-serif italic text-lg">
                        {formatDate(order.created_at, language)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-[0.2em] shadow-sm",
                        order.status === 'delivered' ? "bg-emerald-50 text-emerald-600" : 
                        order.status === 'shipped' ? "bg-blue-50 text-blue-600" :
                        "bg-brand-cream text-brand-olive"
                      )}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {(order.status === 'shipped' || order.status === 'delivered' || order.tracking_id) && (
                    <div className="mb-10 p-6 bg-stone-50 rounded-3xl space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-sans font-bold uppercase tracking-widest text-stone-500">Tracking Status</h4>
                        {order.tracking_id && (
                          <span className="text-[10px] font-sans text-stone-400">ID: {order.tracking_id}</span>
                        )}
                      </div>
                      
                      <div className="relative flex justify-between">
                        <div className="absolute top-4 left-0 right-0 h-0.5 bg-stone-200" />
                        <div className={cn(
                          "absolute top-4 left-0 h-0.5 bg-brand-olive transition-all duration-1000",
                          order.status === 'pending' ? "w-0" : 
                          order.status === 'shipped' ? "w-1/2" : "w-full"
                        )} />
                        
                        <div className="relative z-10 flex flex-col items-center gap-2">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                            order.status !== 'none' ? "bg-brand-olive text-white" : "bg-stone-200 text-stone-400"
                          )}>
                            <Package className="w-4 h-4" />
                          </div>
                          <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-stone-500">Confirmed</span>
                        </div>

                        <div className="relative z-10 flex flex-col items-center gap-2">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                            (order.status === 'shipped' || order.status === 'delivered') ? "bg-brand-olive text-white" : "bg-stone-200 text-stone-400"
                          )}>
                            <Clock className="w-4 h-4" />
                          </div>
                          <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-stone-500">Shipped</span>
                        </div>

                        <div className="relative z-10 flex flex-col items-center gap-2">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                            order.status === 'delivered' ? "bg-brand-olive text-white" : "bg-stone-200 text-stone-400"
                          )}>
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-stone-500">Delivered</span>
                        </div>
                      </div>

                      {order.estimated_delivery && order.status !== 'delivered' && (
                        <div className="pt-4 border-t border-stone-200/50 flex items-center gap-2 text-brand-olive">
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px] font-sans font-bold uppercase tracking-widest">Est. Delivery: {order.estimated_delivery}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-4 mb-8">
                    {order.items.split(',').map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="font-serif italic text-lg text-stone-700">{item}</span>
                        <div className="h-px flex-1 mx-4 bg-stone-100 border-dashed border-t" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 space-y-3">
                    <div className="flex justify-between text-stone-400 font-sans text-[10px] font-bold uppercase tracking-widest">
                      <span>{t.subtotal}</span>
                      <span>₹{order.total - order.delivery_charge}</span>
                    </div>
                    <div className="flex justify-between text-stone-400 font-sans text-[10px] font-bold uppercase tracking-widest">
                      <span>{t.delivery}</span>
                      <span>{order.delivery_charge === 0 ? 'FREE' : `₹${order.delivery_charge}`}</span>
                    </div>
                    {order.promo_code && (
                      <div className="flex justify-between text-emerald-600 font-sans text-[10px] font-bold uppercase tracking-widest">
                        <span>Promo ({order.promo_code})</span>
                        <span>Applied</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-6 border-t border-stone-100">
                      <span className="font-sans text-stone-900 font-bold uppercase tracking-widest text-xs">{t.totalPaid}</span>
                      <span className="text-3xl font-serif italic text-brand-olive">₹{order.total}</span>
                    </div>
                    <div className="pt-4 text-center">
                      <p className="text-[9px] text-stone-400 font-sans font-bold uppercase tracking-[0.2em]">
                        {t.deliveryTime}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
};

const CartDrawer = ({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout, onApplyPromo, appliedOffer, t, language }: any) => {
  const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.selectedWeight * item.quantity, 0);
  const discount = appliedOffer ? (subtotal * appliedOffer.discount_percent) / 100 : 0;
  const totalWeight = items.reduce((sum: number, item: any) => sum + item.selectedWeight * item.quantity, 0);
  const deliveryCharge = getDeliveryCharge(totalWeight);
  const total = subtotal - discount + deliveryCharge;
  const [promoCode, setPromoCode] = useState('');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-brand-cream z-50 shadow-2xl flex flex-col"
          >
            <div className="p-8 md:p-10 border-b border-stone-200 flex items-center justify-between bg-white">
              <h2 className="text-3xl md:text-4xl font-serif italic">{t.yourBasket}</h2>
              <button onClick={onClose} className="p-3 hover:bg-stone-100 rounded-full transition-all hover:rotate-90">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-8">
              {items.length === 0 ? (
                <div className="text-center py-24">
                  <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBasket className="w-10 h-10 text-stone-300" />
                  </div>
                  <p className="text-stone-500 font-serif italic text-xl">{t.emptyBasket}</p>
                  <button onClick={onClose} className="mt-6 text-brand-olive font-sans text-[10px] font-bold uppercase tracking-widest border-b-2 border-brand-olive/20 hover:border-brand-olive transition-all">
                    {t.startShopping}
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-8">
                    {items.map((item: CartItem) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={`${item.id}-${item.selectedWeight}`} 
                        className="flex gap-6"
                      >
                        <div className="relative">
                          <img 
                            src={item.image_url} 
                            alt={item.name} 
                            className="w-24 h-24 rounded-[24px] object-cover shadow-md"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                          <span className="absolute -top-2 -right-2 bg-brand-olive text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-sans font-bold shadow-lg">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-serif text-xl italic leading-tight">{item.name}</h4>
                            <button 
                              onClick={() => onRemove(item.id, item.selectedWeight)}
                              className="p-1 text-stone-300 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-stone-400 text-[10px] font-sans font-bold uppercase tracking-widest mb-4">₹{item.price} / kg • {item.selectedWeight}kg pack</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center bg-stone-100 rounded-full p-1">
                              <button 
                                onClick={() => onUpdateQuantity(item.id, item.selectedWeight, item.quantity - 1)}
                                className="p-1.5 hover:bg-white rounded-full transition-all shadow-sm disabled:opacity-30"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-sans text-xs font-bold w-8 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => onUpdateQuantity(item.id, item.selectedWeight, item.quantity + 1)}
                                className="p-1.5 hover:bg-white rounded-full transition-all shadow-sm"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="ml-auto font-serif text-lg italic text-brand-olive">₹{item.price * item.selectedWeight * item.quantity}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="pt-8 border-t border-stone-200">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-sans font-bold mb-4">{language === 'en' ? 'Promo Code' : 'ಪ್ರೋಮೋ ಕೋಡ್'}</p>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value)}
                        className="flex-1 bg-white border-2 border-stone-100 rounded-2xl px-6 py-3 font-sans text-xs font-bold uppercase tracking-widest outline-none focus:border-brand-mango transition-all"
                        placeholder={language === 'en' ? 'Enter code' : 'ಕೋಡ್ ಹಾಕಿ'}
                      />
                      <Button 
                        variant="secondary" 
                        className="px-6 py-3 text-[10px]"
                        onClick={() => {
                          if (onApplyPromo(promoCode)) {
                            setPromoCode('');
                          } else {
                            alert(language === 'en' ? 'Invalid or inactive promo code' : 'ತಪ್ಪಾದ ಅಥವಾ ನಿಷ್ಕ್ರಿಯ ಪ್ರೋಮೋ ಕೋಡ್');
                          }
                        }}
                      >
                        {language === 'en' ? 'Apply' : 'ಅನ್ವಯಿಸು'}
                      </Button>
                    </div>
                    {appliedOffer && (
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-emerald-600 text-[10px] font-sans font-bold uppercase tracking-widest mt-4 flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> {language === 'en' ? 'Applied' : 'ಅನ್ವಯಿಸಲಾಗಿದೆ'}: {appliedOffer.title} ({appliedOffer.discount_percent}% off)
                      </motion.p>
                    )}
                  </div>
                </>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-8 md:p-10 bg-white border-t border-stone-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe">
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-stone-400 font-sans text-[10px] font-bold uppercase tracking-widest">
                    <span>{t.subtotal}</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-sans text-[10px] font-bold uppercase tracking-widest">
                      <span>{t.discount}</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-400 font-sans text-[10px] font-bold uppercase tracking-widest">
                    <span>{t.delivery}</span>
                    <span className={deliveryCharge === 0 ? 'text-emerald-600 font-bold' : ''}>
                      {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-stone-100">
                    <span className="font-sans text-stone-900 font-bold uppercase tracking-widest text-xs">{t.totalAmount}</span>
                    <span className="text-3xl md:text-4xl font-serif italic text-brand-olive">₹{total}</span>
                  </div>
                  <div className="pt-2 text-center">
                    <p className="text-[9px] text-stone-400 font-sans font-bold uppercase tracking-[0.2em]">
                      {t.deliveryTime}
                    </p>
                  </div>
                </div>
                
                <div className="mb-8 p-4 bg-brand-cream rounded-2xl text-center">
                  {deliveryCharge > 0 ? (
                    <p className="text-[10px] text-stone-500 font-sans font-bold uppercase tracking-widest leading-relaxed">
                      {t.addMoreForFree.replace('{weight}', Math.max(0, 15.1 - totalWeight).toFixed(1).toString())}
                    </p>
                  ) : (
                    <p className="text-[10px] text-emerald-600 font-sans font-bold uppercase tracking-widest">
                      {t.freeDeliveryUnlocked}
                    </p>
                  )}
                </div>
                
                <Button variant="mango" onClick={onCheckout} className="w-full py-6">
                  {t.checkoutNow}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const CheckoutForm = ({ items, onBack, onSubmit, appliedOffer, t, language }: any) => {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'split'>('online');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.selectedWeight * item.quantity, 0);
  const discount = appliedOffer ? (subtotal * appliedOffer.discount_percent) / 100 : 0;
  const totalWeight = items.reduce((sum: number, item: any) => sum + item.selectedWeight * item.quantity, 0);
  const deliveryCharge = getDeliveryCharge(totalWeight);
  const total = subtotal - discount + deliveryCharge;

  const depositAmount = Math.round(total * 0.3); // 30% deposit
  const balanceAmount = total - depositAmount;

  const handleRazorpayPayment = async (amount: number, isSplit: boolean) => {
    setIsProcessing(true);
    
    let razorpayKey = (import.meta as any).env.VITE_RAZORPAY_KEY_ID;
    
    // Use the provided live key as a fallback if not set in environment
    if (!razorpayKey || razorpayKey === "rzp_test_dummy") {
      razorpayKey = "rzp_live_SMeoMTpuUMS7rB";
    }

    const paymentPageUrl = "https://razorpay.me/@varatanahalliramakrishnareddy";

    try {
      // 1. Create order on server
      const orderRes = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount), // Ensure it's a whole number for the API
          receipt: `order_rcptid_${Date.now()}`
        })
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.error || 'Failed to create Razorpay order');
      }

      const orderData = await orderRes.json();
      
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Namma Kolar Mangoes",
        description: isSplit ? "Security Deposit for Mango Order" : "Full Payment for Mango Order",
        image: "https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=200",
        order_id: orderData.id,
        handler: function (response: any) {
          setIsProcessing(false);
          onSubmit({
            ...formData,
            payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            payment_status: isSplit ? 'partially_paid' : 'paid',
            payment_method: paymentMethod,
            paid_amount: amount
          }, deliveryCharge);
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#F27D26"
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Razorpay integration error:", error);
      setIsProcessing(false);
      alert(language === 'en' 
        ? `Payment initialization failed: ${error.message}. Please try again or contact support.` 
        : `ಪಾವತಿ ಪ್ರಾರಂಭಿಸಲು ವಿಫಲವಾಗಿದೆ: ${error.message}. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.`);
    }
  };

  const handleFinalSubmit = () => {
    if (paymentMethod === 'online') {
      handleRazorpayPayment(total, false);
    } else {
      handleRazorpayPayment(depositAmount, true);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-6 py-12 md:py-32"
    >
      <button onClick={step === 1 ? onBack : () => setStep(1)} className="flex items-center gap-3 text-stone-400 mb-12 hover:text-brand-olive transition-all group">
        <div className="p-2 bg-white rounded-full warm-shadow group-hover:scale-110 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest">
          {step === 1 ? t.backToStore : (language === 'en' ? 'Back to details' : 'ವಿವರಗಳಿಗೆ ಹಿಂತಿರುಗಿ')}
        </span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-sans font-bold text-xs transition-colors",
              step === 1 ? "bg-brand-mango text-stone-900" : "bg-emerald-500 text-white"
            )}>
              {step === 1 ? '1' : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div className="h-px w-8 bg-stone-200" />
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-sans font-bold text-xs transition-colors",
              step === 2 ? "bg-brand-mango text-stone-900" : "bg-stone-100 text-stone-400"
            )}>
              2
            </div>
          </div>

          <h2 className="text-5xl md:text-7xl font-serif italic mb-12 leading-tight">
            {step === 1 ? t.deliveryDetails : t.paymentMethod}
          </h2>
          
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-sans font-bold">{t.fullName}</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white border-2 border-stone-100 rounded-[24px] px-8 py-5 font-sans text-sm focus:border-brand-mango focus:ring-4 focus:ring-brand-mango/5 outline-none transition-all"
                    placeholder={language === 'en' ? 'John Doe' : 'ನಿಮ್ಮ ಹೆಸರು'}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-sans font-bold">{t.emailAddress}</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white border-2 border-stone-100 rounded-[24px] px-8 py-5 font-sans text-sm focus:border-brand-mango focus:ring-4 focus:ring-brand-mango/5 outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-sans font-bold">{t.phoneNumber}</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-white border-2 border-stone-100 rounded-[24px] px-8 py-5 font-sans text-sm focus:border-brand-mango focus:ring-4 focus:ring-brand-mango/5 outline-none transition-all"
                    placeholder="+91 97430 25459 / 91645 02728"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-sans font-bold">{t.address}</label>
                  <textarea 
                    rows={4}
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-white border-2 border-stone-100 rounded-[24px] px-8 py-5 font-sans text-sm focus:border-brand-mango focus:ring-4 focus:ring-brand-mango/5 outline-none transition-all resize-none"
                    placeholder={language === 'en' ? 'House No, Street, Area, Bangalore - 560XXX' : 'ಮನೆ ಸಂಖ್ಯೆ, ರಸ್ತೆ, ಏರಿಯಾ, ಬೆಂಗಳೂರು - 560XXX'}
                  />
                </div>
                <Button 
                  variant="mango" 
                  className="w-full py-6"
                  onClick={() => setStep(2)}
                  disabled={!formData.name || !formData.email || !formData.phone || !formData.address}
                >
                  {t.continueToPayment}
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-serif italic">{t.selectPayment}</h3>
                  <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-emerald-600">{language === 'en' ? 'Secure & Encrypted' : 'ಸುರಕ್ಷಿತ ಮತ್ತು ಎನ್ಕ್ರಿಪ್ಟ್ ಮಾಡಲಾಗಿದೆ'}</span>
                  </div>
                </div>

                <div 
                  onClick={() => setPaymentMethod('online')}
                  className={cn(
                    "p-6 rounded-[32px] border-2 cursor-pointer transition-all flex items-center gap-6 relative overflow-hidden group",
                    paymentMethod === 'online' ? "border-brand-mango bg-brand-mango/5" : "border-stone-100 hover:border-stone-200"
                  )}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                    paymentMethod === 'online' ? "bg-brand-mango text-stone-900 scale-110" : "bg-stone-100 text-stone-400"
                  )}>
                    <CreditCard className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <p className="font-serif text-xl italic leading-none">{t.payOnline}</p>
                    <p className="text-[10px] text-stone-400 font-sans mt-2 uppercase tracking-widest font-bold">{language === 'en' ? 'Full Payment' : 'ಪೂರ್ಣ ಪಾವತಿ'}</p>
                    <p className="text-[10px] text-stone-400 font-sans mt-1">{language === 'en' ? 'UPI, Cards, or Netbanking' : 'UPI, ಕಾರ್ಡ್‌ಗಳು ಅಥವಾ ನೆಟ್‌ಬ್ಯಾಂಕಿಂಗ್'}</p>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                    paymentMethod === 'online' ? "border-brand-mango bg-brand-mango" : "border-stone-200"
                  )}>
                    <motion.div 
                      initial={false}
                      animate={{ scale: paymentMethod === 'online' ? 1 : 0 }}
                      className="w-2 h-2 bg-white rounded-full" 
                    />
                  </div>
                </div>

                <div 
                  onClick={() => setPaymentMethod('split')}
                  className={cn(
                    "p-6 rounded-[32px] border-2 cursor-pointer transition-all flex flex-col gap-6 relative overflow-hidden group",
                    paymentMethod === 'split' ? "border-brand-mango bg-brand-mango/5" : "border-stone-100 hover:border-stone-200"
                  )}
                >
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                      paymentMethod === 'split' ? "bg-brand-mango text-stone-900 scale-110" : "bg-stone-100 text-stone-400"
                    )}>
                      <Wallet className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <p className="font-serif text-xl italic leading-none">{t.splitPayment}</p>
                      <p className="text-[10px] text-stone-400 font-sans mt-2 uppercase tracking-widest font-bold">{language === 'en' ? 'Pay 30% Now' : 'ಈಗ 30% ಪಾವತಿಸಿ'}</p>
                      <p className="text-[10px] text-stone-400 font-sans mt-1">{language === 'en' ? 'Rest on delivery (COD)' : 'ಉಳಿದ ಮೊತ್ತ ಡೆಲಿವರಿ ಸಮಯದಲ್ಲಿ'}</p>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                      paymentMethod === 'split' ? "border-brand-mango bg-brand-mango" : "border-stone-200"
                    )}>
                      <motion.div 
                        initial={false}
                        animate={{ scale: paymentMethod === 'split' ? 1 : 0 }}
                        className="w-2 h-2 bg-white rounded-full" 
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {paymentMethod === 'split' && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pt-6 border-t border-brand-mango/20 relative"
                      >
                        <div className="absolute top-6 right-0 opacity-[0.03] pointer-events-none">
                          <Wallet className="w-24 h-24 rotate-12" />
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-mango" />
                              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-500">{t.payNowDeposit}</span>
                            </div>
                            <span className="font-serif italic text-lg text-brand-olive">₹{depositAmount}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-500">{t.payOnDelivery}</span>
                            </div>
                            <span className="font-serif italic text-lg text-stone-400">₹{balanceAmount}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button 
                    variant="secondary" 
                    className="flex-1 py-6"
                    onClick={() => setStep(1)}
                  >
                    {language === 'en' ? 'Back' : 'ಹಿಂದಕ್ಕೆ'}
                  </Button>
                  <Button 
                    variant="mango" 
                    className="flex-[2] py-6 relative overflow-hidden group"
                    onClick={handleFinalSubmit}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        <span>{paymentMethod === 'online' ? t.paySecurely : t.payDeposit}</span>
                      </div>
                    )}
                    <motion.div 
                      className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
                    />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:sticky lg:top-32 h-fit">
          <Card className="p-10 md:p-12">
            <h3 className="text-3xl font-serif italic mb-10">{t.orderSummary}</h3>
            
            <div className="space-y-6 mb-10">
              {items.map((item: any) => (
                <div key={`${item.id}-${item.selectedWeight}`} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-[10px] font-sans font-bold text-stone-500">{item.quantity}x</span>
                    <div>
                      <p className="font-serif italic text-lg leading-none">{item.name}</p>
                      <p className="text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest mt-1">{item.selectedWeight}kg pack</p>
                    </div>
                  </div>
                  <span className="font-serif italic text-lg">₹{item.price * item.selectedWeight * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-10 border-t border-stone-100">
              <div className="flex justify-between text-stone-400 font-sans text-[10px] font-bold uppercase tracking-widest">
                <span>{t.subtotal}</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-sans text-[10px] font-bold uppercase tracking-widest">
                  <span>{t.discount}</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-400 font-sans text-[10px] font-bold uppercase tracking-widest">
                <span>{t.delivery}</span>
                <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
              </div>
              <div className="flex justify-between pt-6 border-t border-stone-100">
                <span className="font-sans text-stone-900 font-bold uppercase tracking-widest text-xs">{t.totalAmount}</span>
                <span className="text-4xl font-serif italic text-brand-olive">₹{total}</span>
              </div>
              <div className="pt-4 text-center">
                <p className="text-[10px] text-stone-400 font-sans font-bold uppercase tracking-[0.2em]">
                  {t.deliveryTime}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

const showToast = (message: string) => {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-stone-900 text-white px-6 py-3 rounded-full text-xs font-sans font-bold uppercase tracking-widest z-[100] animate-in fade-in slide-in-from-bottom-4';
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-4');
    setTimeout(() => toast.remove(), 500);
  }, 3000);
};

const SmartInventoryAnalysis = ({ inventory }: { inventory: any[] }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeInventory = async () => {
    if (inventory.length === 0) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const inventoryData = inventory.map(p => `${p.name} (${p.variety}): ${p.stock}kg at ₹${p.price}/kg`).join('\n');
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Analyze this mango inventory and provide 3 actionable business tips for the seller. Focus on pricing, stock management, and variety mix. Inventory:\n${inventoryData}`
      });
      setAnalysis(response.text || "No analysis available.");
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="bg-brand-olive/5 border-brand-olive/10">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-olive" />
          <h3 className="font-serif italic text-lg">Smart Inventory Insights</h3>
        </div>
        <Button 
          onClick={analyzeInventory} 
          disabled={isAnalyzing || inventory.length === 0}
          variant="secondary"
          className="text-[10px] px-4 py-2"
        >
          {isAnalyzing ? "Analyzing..." : "Run AI Analysis"}
        </Button>
      </div>
      {analysis ? (
        <div className="prose prose-stone prose-sm max-w-none">
          <Markdown>{analysis}</Markdown>
        </div>
      ) : (
        <p className="text-xs text-stone-400 font-sans italic">
          Click the button to get AI-powered insights on your current stock and pricing.
        </p>
      )}
    </Card>
  );
};

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  const handleOpenKey = async () => {
    await (window as any).aistudio.openSelectKey();
    setHasKey(true);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: size
          }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      if (error.message?.includes("Requested entity was not found")) {
        setHasKey(false);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (hasKey === false) {
    return (
      <Card className="p-12 text-center space-y-6">
        <div className="w-16 h-16 bg-brand-mango/10 text-brand-mango rounded-full flex items-center justify-center mx-auto">
          <Lock size={32} />
        </div>
        <h3 className="text-2xl font-serif italic">AI Key Required</h3>
        <p className="text-stone-500 font-sans max-w-md mx-auto">
          To generate high-quality marketing images, you need to select a paid Gemini API key.
          <br />
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-brand-olive underline">Learn about billing</a>
        </p>
        <Button onClick={handleOpenKey} className="px-8 py-4">
          Select API Key
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif italic">AI Image Studio</h2>
        <div className="flex gap-2 bg-white p-1 rounded-full warm-shadow">
          {(['1K', '2K', '4K'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest transition-all",
                size === s ? "bg-brand-olive text-white shadow-sm" : "text-stone-400 hover:text-stone-600"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">Describe your image</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. A vibrant basket of fresh Raspuri mangoes on a rustic wooden table with sunlight filtering through leaves..."
              className="w-full h-40 bg-white p-6 rounded-[32px] warm-shadow-sm font-sans text-sm resize-none focus:ring-2 focus:ring-brand-olive/20 outline-none"
            />
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-6 flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Masterpiece...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Marketing Image
              </>
            )}
          </Button>
        </div>

        <div className="aspect-square bg-white rounded-[32px] warm-shadow flex items-center justify-center overflow-hidden border border-stone-100 relative group">
          {generatedImage ? (
            <>
              <img src={generatedImage} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = generatedImage;
                    link.download = `mango-marketing-${Date.now()}.png`;
                    link.click();
                  }}
                  className="p-4 bg-white rounded-full text-brand-olive hover:scale-110 transition-transform"
                >
                  <Upload className="w-6 h-6 rotate-180" />
                </button>
                <button 
                  onClick={() => window.open(generatedImage, '_blank')}
                  className="p-4 bg-white rounded-full text-brand-olive hover:scale-110 transition-transform"
                >
                  <Maximize2 className="w-6 h-6" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center p-12 space-y-4">
              <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto">
                <ImageIcon className="w-10 h-10 text-stone-200" />
              </div>
              <p className="text-stone-300 font-sans text-sm italic">Your AI-generated image will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SellerDashboard = ({ products, orders, offers, bookings, onUpdateProduct, onAddProduct, onDeleteProduct, onUpdateOffer, onDeleteOffer, onAddOffer, onUpdateOrder, onUpdateBooking, onDeleteBooking, onLogout, isLoading, dbStatus }: any) => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingOffer, setIsAddingOffer] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  const handleUpdateBooking = async (id: string, status: string) => {
    onUpdateBooking(id, { status });
  };
  const [newProduct, setNewProduct] = useState({
    name: '',
    variety: '',
    description: '',
    price: 0,
    stock: 0,
    available: 1,
    image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800'
  });
  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    code: '',
    discount_percent: 0,
    active: 1,
    image_url: 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=800'
  });

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <nav className="bg-white warm-shadow px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4 md:gap-8">
          <h1 className="text-xl md:text-2xl font-serif italic">Seller Portal</h1>
          <div className="hidden md:flex gap-6">
            <button 
              onClick={() => setActiveTab('inventory')}
              className={cn(
                "font-sans text-sm transition-colors",
                activeTab === 'inventory' ? "text-brand-olive font-semibold" : "text-stone-400"
              )}
            >
              Inventory
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={cn(
                "font-sans text-sm transition-colors",
                activeTab === 'orders' ? "text-brand-olive font-semibold" : "text-stone-400"
              )}
            >
              Orders
            </button>
            <button 
              onClick={() => setActiveTab('offers')}
              className={cn(
                "font-sans text-sm transition-colors",
                activeTab === 'offers' ? "text-brand-olive font-semibold" : "text-stone-400"
              )}
            >
              Offers
            </button>
            <button 
              onClick={() => setActiveTab('bookings')}
              className={cn(
                "font-sans text-sm transition-colors",
                activeTab === 'bookings' ? "text-brand-olive font-semibold" : "text-stone-400"
              )}
            >
              Bookings
            </button>
            <button 
              onClick={() => setActiveTab('marketing')}
              className={cn(
                "font-sans text-sm transition-colors",
                activeTab === 'marketing' ? "text-brand-olive font-semibold" : "text-stone-400"
              )}
            >
              Marketing
            </button>
          </div>
        </div>
        <button onClick={onLogout} className="p-2 hover:bg-stone-100 rounded-full text-stone-400">
          <LogOut className="w-5 h-5" />
        </button>
      </nav>

      {/* Mobile Seller Nav */}
      <div className="md:hidden flex bg-white border-b border-stone-200 px-6 py-2 sticky top-[68px] z-20">
        <button 
          onClick={() => setActiveTab('inventory')}
          className={cn(
            "flex-1 py-2 text-center font-sans text-xs uppercase tracking-widest",
            activeTab === 'inventory' ? "text-brand-olive font-bold border-b-2 border-brand-olive" : "text-stone-400"
          )}
        >
          Inventory
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={cn(
            "flex-1 py-2 text-center font-sans text-xs uppercase tracking-widest",
            activeTab === 'orders' ? "text-brand-olive font-bold border-b-2 border-brand-olive" : "text-stone-400"
          )}
        >
          Orders
        </button>
        <button 
          onClick={() => setActiveTab('offers')}
          className={cn(
            "flex-1 py-2 text-center font-sans text-xs uppercase tracking-widest",
            activeTab === 'offers' ? "text-brand-olive font-bold border-b-2 border-brand-olive" : "text-stone-400"
          )}
        >
          Offers
        </button>
        <button 
          onClick={() => setActiveTab('bookings')}
          className={cn(
            "flex-1 py-2 text-center font-sans text-xs uppercase tracking-widest",
            activeTab === 'bookings' ? "text-brand-olive font-bold border-b-2 border-brand-olive" : "text-stone-400"
          )}
        >
          Bookings
        </button>
        <button 
          onClick={() => setActiveTab('marketing')}
          className={cn(
            "flex-1 py-2 text-center font-sans text-xs uppercase tracking-widest",
            activeTab === 'marketing' ? "text-brand-olive font-bold border-b-2 border-brand-olive" : "text-stone-400"
          )}
        >
          Marketing
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-12">
        {dbStatus && (
          <div className="flex items-center gap-2 mb-8 bg-white px-4 py-2 rounded-full warm-shadow w-fit group relative">
            <div className={cn("w-2 h-2 rounded-full", dbStatus.connected ? "bg-emerald-500" : "bg-red-500")} />
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">
              Database: {dbStatus.type} {dbStatus.details && `(${dbStatus.details})`}
            </span>
            {dbStatus.details && (
              <div className="absolute bottom-full left-0 mb-2 p-2 bg-stone-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {dbStatus.details}
              </div>
            )}
          </div>
        )}
        {activeTab === 'inventory' ? (
          <div className="space-y-8">
            <SmartInventoryAnalysis inventory={products} />
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-serif italic">Manage Stock</h2>
              <Button onClick={() => setIsAdding(true)} className="px-4 py-2 text-xs">
                <Plus className="w-4 h-4" /> Add Variety
              </Button>
            </div>

            {isAdding && (
              <Card className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4">
                <div className="md:col-span-1 flex flex-col gap-4">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border-2 border-dashed border-stone-200 flex flex-col items-center justify-center group">
                    {newProduct.image_url ? (
                      <>
                        <img src={newProduct.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                        <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">Upload Image</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={e => handleImageUpload(e, (url) => setNewProduct({...newProduct, image_url: url}))}
                    />
                  </div>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    placeholder="Name" 
                    className="bg-stone-50 p-3 rounded-xl font-sans text-sm"
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
                  <input 
                    placeholder="Variety" 
                    className="bg-stone-50 p-3 rounded-xl font-sans text-sm"
                    value={newProduct.variety}
                    onChange={e => setNewProduct({...newProduct, variety: e.target.value})}
                  />
                  <input 
                    type="number" 
                    placeholder="Price" 
                    className="bg-stone-50 p-3 rounded-xl font-sans text-sm"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                  />
                  <input 
                    type="number" 
                    placeholder="Stock (kg)" 
                    className="bg-stone-50 p-3 rounded-xl font-sans text-sm"
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                  />
                    <div className="md:col-span-2 relative">
                      <textarea 
                        placeholder="Description" 
                        className="w-full bg-stone-50 p-3 rounded-xl font-sans text-sm resize-none pr-24"
                        rows={2}
                        value={newProduct.description}
                        onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                      />
                      <div className="absolute right-3 top-3 flex gap-1">
                        <button
                          onClick={async () => {
                            if (!newProduct.name || isGeneratingDesc) return;
                            setIsGeneratingDesc(true);
                            try {
                              const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
                              const response = await ai.models.generateContent({
                                model: "gemini-3.1-flash-lite-preview",
                                contents: `Write a short, mouth-watering marketing description for a mango variety named "${newProduct.name}" of variety "${newProduct.variety}". Keep it under 150 characters.`
                              });
                              setNewProduct(prev => ({ ...prev, description: response.text || prev.description }));
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setIsGeneratingDesc(false);
                            }
                          }}
                          className="p-2 text-brand-olive hover:bg-brand-olive/10 rounded-lg transition-colors"
                          title="AI Generate Description"
                        >
                          {isGeneratingDesc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        </button>
                        {newProduct.description && (
                          <button
                            onClick={async () => {
                              if (isGeneratingDesc) return;
                              setIsGeneratingDesc(true);
                              try {
                                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
                                const response = await ai.models.generateContent({
                                  model: "gemini-3.1-pro-preview",
                                  contents: `Improve this mango product description to be more professional and enticing: "${newProduct.description}"`
                                });
                                setNewProduct(prev => ({ ...prev, description: response.text || prev.description }));
                              } catch (e) {
                                console.error(e);
                              } finally {
                                setIsGeneratingDesc(false);
                              }
                            }}
                            className="p-2 text-brand-olive hover:bg-brand-olive/10 rounded-lg transition-colors"
                            title="AI Polish Description"
                          >
                            <Wand2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  <div className="md:col-span-2 flex gap-4">
                    <Button onClick={() => { onAddProduct(newProduct); setIsAdding(false); }} className="flex-1">Save Product</Button>
                    <Button variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <Card key={i} className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 py-6 md:py-4 animate-pulse">
                    <div className="w-16 h-16 rounded-xl bg-stone-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-stone-100 rounded w-1/3" />
                      <div className="h-3 bg-stone-50 rounded w-1/4" />
                    </div>
                    <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 md:gap-8 w-full md:flex-1">
                      <div className="h-8 bg-stone-50 rounded w-16" />
                      <div className="h-8 bg-stone-50 rounded w-16" />
                      <div className="h-8 bg-stone-50 rounded w-24" />
                    </div>
                  </Card>
                ))
              ) : (
                products.map((product: Product) => (
                  <Card key={product.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 py-6 md:py-4">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group">
                      <img src={product.image_url} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" loading="lazy" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl cursor-pointer">
                        <Upload className="w-4 h-4 text-white" />
                        <input 
                          type="file" 
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={e => handleImageUpload(e, (url) => onUpdateProduct(product.id, { ...product, image_url: url }))}
                        />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <input 
                        type="text"
                        value={product.name}
                        onChange={e => onUpdateProduct(product.id, { ...product, name: e.target.value })}
                        className="w-full bg-transparent font-serif text-lg italic outline-none focus:ring-1 focus:ring-brand-olive/20 rounded px-1"
                      />
                      <input 
                        type="text"
                        value={product.variety}
                        onChange={e => onUpdateProduct(product.id, { ...product, variety: e.target.value })}
                        className="w-full bg-transparent text-stone-400 text-xs font-sans outline-none focus:ring-1 focus:ring-brand-olive/20 rounded px-1"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 md:gap-8 w-full md:flex-1">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] uppercase tracking-widest text-stone-400 font-sans">Price</p>
                      <div className="flex items-center gap-1">
                        <span className="text-stone-400 text-sm">₹</span>
                        <input 
                          type="number" 
                          value={product.price}
                          onChange={e => onUpdateProduct(product.id, { ...product, price: Number(e.target.value) })}
                          className="w-16 bg-transparent font-serif text-lg md:text-right outline-none"
                        />
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-[10px] uppercase tracking-widest text-stone-400 font-sans">Stock (kg)</p>
                      <input 
                        type="number" 
                        value={product.stock}
                        onChange={e => onUpdateProduct(product.id, { ...product, stock: Number(e.target.value) })}
                        className="w-16 bg-transparent font-serif text-lg md:text-right outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-sans">Status</p>
                        <p className={cn("text-[10px] font-bold uppercase", product.available ? "text-emerald-500" : "text-stone-400")}>
                          {product.available ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <button 
                        onClick={() => onUpdateProduct(product.id, { ...product, available: product.available ? 0 : 1 })}
                        className={cn(
                          "w-12 h-7 rounded-full transition-colors relative",
                          product.available ? "bg-emerald-500" : "bg-stone-300"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-5 h-5 bg-white rounded-full transition-all",
                          product.available ? "left-6" : "left-1"
                        )} />
                      </button>
                    </div>
                    <button 
                      onClick={() => onDeleteProduct(product.id)}
                      className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
        ) : activeTab === 'orders' ? (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-serif italic">Incoming Orders</h2>
              <Button
                variant="secondary"
                className="text-[10px] px-4 py-2 flex items-center gap-2"
                onClick={async () => {
                  if (orders.length === 0) return;
                  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
                  const response = await ai.models.generateContent({
                    model: "gemini-3.1-flash-lite-preview",
                    contents: `Summarize these orders for a seller. Total orders: ${orders.length}. Total revenue: ₹${orders.reduce((s: number, o: any) => s + o.total, 0)}. List top varieties ordered. Keep it very brief and professional.`
                  });
                  showToast(response.text || "Summary generated");
                }}
              >
                <Sparkles className="w-3 h-3" />
                AI Summary
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {orders.map((order: Order) => (
                <Card key={order.id} className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-sans text-stone-400">Order #{order.id}</span>
                        <span className="px-2 py-0.5 bg-brand-olive/10 text-brand-olive text-[10px] rounded-full uppercase tracking-wider font-bold">
                          {order.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-serif italic">{order.customer_name}</h3>
                    </div>
                    <span className="text-2xl font-serif italic">₹{order.total}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-y border-stone-100">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-stone-400 mt-1" />
                      <p className="text-xs font-sans text-stone-500 leading-relaxed">{order.address}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-stone-400 mt-1" />
                      <p className="text-xs font-sans text-stone-500">{order.phone}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Package className="w-4 h-4 text-stone-400 mt-1" />
                      <p className="text-xs font-sans text-stone-500">{order.items}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-b border-stone-100">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-stone-400 font-sans font-bold">Tracking ID</label>
                      <input 
                        type="text"
                        placeholder="Enter Tracking ID"
                        value={order.tracking_id || ''}
                        onChange={e => onUpdateOrder(order.id, { tracking_id: e.target.value })}
                        className="w-full bg-stone-50 border-none rounded-xl px-4 py-2 font-sans text-xs focus:ring-2 focus:ring-brand-olive/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-stone-400 font-sans font-bold">Est. Delivery</label>
                      <input 
                        type="text"
                        placeholder="e.g. 12th March"
                        value={order.estimated_delivery || ''}
                        onChange={e => onUpdateOrder(order.id, { estimated_delivery: e.target.value })}
                        className="w-full bg-stone-50 border-none rounded-xl px-4 py-2 font-sans text-xs focus:ring-2 focus:ring-brand-olive/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-sans text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDateTime(order.created_at)}
                    </span>
                    <div className="flex gap-2">
                      {order.status !== 'delivered' && (
                        <Button 
                          onClick={() => onUpdateOrder(order.id, { status: 'shipped' })}
                          variant="secondary" 
                          className="px-4 py-2 text-xs"
                          disabled={order.status === 'shipped'}
                        >
                          {order.status === 'shipped' ? 'Shipped' : 'Mark as Shipped'}
                        </Button>
                      )}
                      <Button 
                        onClick={() => onUpdateOrder(order.id, { status: 'delivered' })}
                        className="px-4 py-2 text-xs"
                        disabled={order.status === 'delivered'}
                      >
                        {order.status === 'delivered' ? 'Delivered' : 'Mark as Delivered'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : activeTab === 'bookings' ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <h2 className="text-3xl font-serif italic">Farm Visit Bookings</h2>
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => setBookingFilter(status)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest transition-all border",
                      bookingFilter === status 
                        ? "bg-brand-olive text-white border-brand-olive shadow-md" 
                        : "bg-white text-stone-400 border-stone-100 hover:border-brand-olive/20"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {bookings.filter(b => bookingFilter === 'all' || b.status === bookingFilter).length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[32px] warm-shadow">
                  <Calendar className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                  <p className="text-stone-400 font-serif italic">No {bookingFilter !== 'all' ? bookingFilter : ''} bookings found</p>
                </div>
              ) : (
                bookings
                  .filter(b => bookingFilter === 'all' || b.status === bookingFilter)
                  .map((booking: any) => (
                  <Card key={booking.id} className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-sans text-stone-400">Booking #{booking.id}</span>
                          <span className={cn(
                            "px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wider font-bold",
                            booking.status === 'confirmed' ? "bg-emerald-50 text-emerald-600" : 
                            booking.status === 'cancelled' ? "bg-red-50 text-red-600" :
                            booking.status === 'completed' ? "bg-blue-50 text-blue-600" :
                            "bg-stone-100 text-stone-400"
                          )}>
                            {booking.status}
                          </span>
                        </div>
                        <h3 className="text-xl font-serif italic">{booking.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-serif italic text-brand-olive">{booking.date}</p>
                        <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">{booking.time}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-y border-stone-100">
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-stone-400 mt-1" />
                        <p className="text-xs font-sans text-stone-500">{booking.phone}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <User className="w-4 h-4 text-stone-400 mt-1" />
                        <p className="text-xs font-sans text-stone-500">{booking.guests} Guests</p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
                      <span className="text-[10px] font-sans text-stone-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Booked on {formatDateTime(booking.created_at)}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {booking.status !== 'confirmed' && booking.status !== 'completed' && booking.status !== 'cancelled' && (
                          <Button 
                            onClick={() => handleUpdateBooking(booking.id, 'confirmed')}
                            className="px-4 py-2 text-[10px]"
                          >
                            Confirm
                          </Button>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button 
                            onClick={() => handleUpdateBooking(booking.id, 'completed')}
                            variant="mango"
                            className="px-4 py-2 text-[10px]"
                          >
                            Mark Completed
                          </Button>
                        )}
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <Button 
                            onClick={() => handleUpdateBooking(booking.id, 'cancelled')}
                            variant="danger" 
                            className="px-4 py-2 text-[10px]"
                          >
                            Cancel
                          </Button>
                        )}
                        {(booking.status === 'cancelled' || booking.status === 'completed') && (
                          <Button 
                            onClick={() => handleUpdateBooking(booking.id, 'pending')}
                            variant="secondary"
                            className="px-4 py-2 text-[10px]"
                          >
                            Reset to Pending
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        ) : activeTab === 'offers' ? (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-serif italic">Manage Offers</h2>
              <Button onClick={() => setIsAddingOffer(true)} className="px-4 py-2 text-xs">
                <Plus className="w-4 h-4" /> Add Offer
              </Button>
            </div>

            {isAddingOffer && (
              <Card className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4">
                <input 
                  placeholder="Offer Title" 
                  className="bg-stone-50 p-3 rounded-xl font-sans text-sm"
                  value={newOffer.title}
                  onChange={e => setNewOffer({...newOffer, title: e.target.value})}
                />
                <input 
                  placeholder="Promo Code" 
                  className="bg-stone-50 p-3 rounded-xl font-sans text-sm"
                  value={newOffer.code}
                  onChange={e => setNewOffer({...newOffer, code: e.target.value})}
                />
                <input 
                  type="number" 
                  placeholder="Discount %" 
                  className="bg-stone-50 p-3 rounded-xl font-sans text-sm"
                  value={newOffer.discount_percent}
                  onChange={e => setNewOffer({...newOffer, discount_percent: Number(e.target.value)})}
                />
                <textarea 
                  placeholder="Description" 
                  className="md:col-span-3 bg-stone-50 p-3 rounded-xl font-sans text-sm resize-none"
                  rows={2}
                  value={newOffer.description}
                  onChange={e => setNewOffer({...newOffer, description: e.target.value})}
                />
                <div className="md:col-span-3 flex gap-4">
                  <Button onClick={() => { onAddOffer(newOffer); setIsAddingOffer(false); }} className="flex-1">Save Offer</Button>
                  <Button variant="secondary" onClick={() => setIsAddingOffer(false)}>Cancel</Button>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
              {isLoading ? (
                [1, 2].map(i => (
                  <Card key={i} className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 py-6 md:py-4 animate-pulse">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-stone-100 rounded w-1/3" />
                      <div className="h-3 bg-stone-50 rounded w-1/2" />
                      <div className="h-2 bg-stone-50 rounded w-20" />
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="h-8 bg-stone-50 rounded w-16" />
                      <div className="h-8 bg-stone-50 rounded w-24" />
                    </div>
                  </Card>
                ))
              ) : (
                offers.map((offer: Offer) => (
                  <Card key={offer.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 py-6 md:py-4">
                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-sans">Title</p>
                          <input 
                            type="text"
                            value={offer.title}
                            onChange={e => onUpdateOffer(offer.id, { ...offer, title: e.target.value })}
                            className="w-full bg-transparent font-serif text-lg italic outline-none focus:ring-1 focus:ring-brand-olive/20 rounded px-1"
                          />
                        </div>
                        <div className="w-full md:w-32 space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-sans">Promo Code</p>
                          <input 
                            type="text"
                            value={offer.code}
                            onChange={e => onUpdateOffer(offer.id, { ...offer, code: e.target.value.toUpperCase() })}
                            className="w-full bg-transparent text-brand-olive text-sm font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-brand-olive/20 rounded px-1"
                          />
                        </div>
                        <div className="w-full md:w-24 space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-sans">Discount %</p>
                          <input 
                            type="number"
                            value={offer.discount_percent}
                            onChange={e => onUpdateOffer(offer.id, { ...offer, discount_percent: Number(e.target.value) })}
                            className="w-full bg-transparent font-serif text-lg italic outline-none focus:ring-1 focus:ring-brand-olive/20 rounded px-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-sans">Description</p>
                        <textarea 
                          value={offer.description || ''}
                          onChange={e => onUpdateOffer(offer.id, { ...offer, description: e.target.value })}
                          className="w-full bg-transparent text-stone-400 text-xs font-sans outline-none focus:ring-1 focus:ring-brand-olive/20 rounded px-1 resize-none"
                          rows={1}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto">
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-sans">Status</p>
                          <p className={cn("text-[10px] font-bold uppercase", offer.active ? "text-emerald-500" : "text-stone-400")}>
                            {offer.active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <button 
                          onClick={() => onUpdateOffer(offer.id, { ...offer, active: offer.active ? 0 : 1 })}
                          className={cn(
                            "w-12 h-7 rounded-full transition-colors relative",
                            offer.active ? "bg-emerald-500" : "bg-stone-300"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-5 h-5 bg-white rounded-full transition-all",
                            offer.active ? "left-6" : "left-1"
                          )} />
                        </button>
                      </div>
                      <button 
                        onClick={() => onDeleteOffer(offer.id)}
                        className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        ) : activeTab === 'marketing' ? (
          <ImageGenerator />
        ) : null}
      </main>
    </div>
  );
};


const FarmBookingModal = ({ isOpen, onClose, onBook }: any) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState(1);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onBook({ date, time, name, phone, guests });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none"
          >
            <Card className="w-full max-w-lg pointer-events-auto overflow-hidden">
              <div className="relative h-32 bg-brand-olive flex items-center justify-center">
                <div className="absolute inset-0 opacity-20">
                  <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                </div>
                <div className="relative text-center">
                  <Calendar className="w-8 h-8 text-white mx-auto mb-2" />
                  <h3 className="text-2xl font-serif italic text-white">Book Your Farm Visit</h3>
                </div>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-sans font-bold">Select Date</label>
                    <input 
                      required
                      type="date" 
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-stone-50 border-none rounded-2xl px-4 py-3 font-sans text-sm focus:ring-2 focus:ring-brand-olive/20 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-sans font-bold">Select Time</label>
                    <select 
                      required
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      className="w-full bg-stone-50 border-none rounded-2xl px-4 py-3 font-sans text-sm focus:ring-2 focus:ring-brand-olive/20 outline-none"
                    >
                      <option value="">Choose Time</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-stone-400 font-sans font-bold">Full Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Enter your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-stone-50 border-none rounded-2xl px-4 py-3 font-sans text-sm focus:ring-2 focus:ring-brand-olive/20 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-sans font-bold">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      placeholder="Your contact number"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-stone-50 border-none rounded-2xl px-4 py-3 font-sans text-sm focus:ring-2 focus:ring-brand-olive/20 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-sans font-bold">No. of Guests</label>
                    <input 
                      required
                      type="number" 
                      min="1"
                      max="10"
                      value={guests}
                      onChange={e => setGuests(parseInt(e.target.value))}
                      className="w-full bg-stone-50 border-none rounded-2xl px-4 py-3 font-sans text-sm focus:ring-2 focus:ring-brand-olive/20 outline-none"
                    />
                  </div>
                </div>

                <Button type="submit" variant="mango" className="w-full py-5 text-sm uppercase tracking-widest font-bold">
                  Confirm Booking
                </Button>
                <p className="text-[10px] text-center text-stone-400 font-sans">
                  * Visits are free. We only charge for the mangoes you pick.
                </p>
              </form>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Toast = ({ message, isVisible, onHide }: any) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.8 }}
        className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] bg-brand-olive text-white px-8 py-4 rounded-full warm-shadow flex items-center gap-4 border border-white/20"
      >
        <div className="w-6 h-6 bg-brand-mango rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-stone-900" />
        </div>
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest">{message}</span>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'store' | 'checkout' | 'seller' | 'history'>('store');
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedOffer, setAppliedOffer] = useState<Offer | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const t = useMemo(() => translations[language], [language]);

  const [bookings, setBookings] = useState<any[]>([]);
  const [heroBg, setHeroBg] = useState('https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=2000');
  const [toast, setToast] = useState({ message: '', visible: false });
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<{ type: string, connected: boolean, details?: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };
  const [sellerPin, setSellerPin] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [isSellerAuthenticated, setIsSellerAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
      if (user) {
        setBuyerEmail(user.email || '');
        // Auto-authenticate seller if admin
        if (user.email === "ksndmc.nandishavr@gmail.com") {
          setIsSellerAuthenticated(true);
        }
      } else {
        setIsSellerAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setDbStatus({ type: 'Firestore', connected: true });
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
          setDbStatus({ type: 'Firestore', connected: false, details: 'Offline' });
        }
      }
    };
    testConnection();

    // Real-time listeners
    const productsUnsubscribe = onSnapshot(collection(db, "products"), 
      (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setProducts(productsData);
        setIsLoading(false);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "products")
    );

    const offersUnsubscribe = onSnapshot(collection(db, "offers"),
      (snapshot) => {
        const offersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setOffers(offersData);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "offers")
    );

    const testimonialsQuery = query(collection(db, "testimonials"), where("active", "==", 1), where("language", "==", language));
    const testimonialsUnsubscribe = onSnapshot(testimonialsQuery,
      (snapshot) => {
        const testimonialsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setTestimonials(testimonialsData);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "testimonials")
    );

    return () => {
      productsUnsubscribe();
      offersUnsubscribe();
      testimonialsUnsubscribe();
    };
  }, [isAuthReady, language]);

  useEffect(() => {
    if (isSellerAuthenticated) {
      const ordersUnsubscribe = onSnapshot(query(collection(db, "orders"), orderBy("created_at", "desc")),
        (snapshot) => {
          const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          setOrders(ordersData);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, "orders")
      );

      const bookingsUnsubscribe = onSnapshot(collection(db, "bookings"),
        (snapshot) => {
          const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          setBookings(bookingsData);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, "bookings")
      );

      return () => {
        ordersUnsubscribe();
        bookingsUnsubscribe();
      };
    } else {
      setOrders([]);
      setBookings([]);
    }
  }, [isSellerAuthenticated]);

  const fetchDbStatus = async () => {
    setDbStatus({ type: 'Firestore', connected: true });
  };

  const handleBookFarmVisit = async (bookingData: any) => {
    try {
      await addDoc(collection(db, "bookings"), {
        ...bookingData,
        status: 'pending',
        created_at: serverTimestamp()
      });
      showToast(`Farm visit booked for ${bookingData.date} at ${bookingData.time}!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "bookings");
      showToast("Failed to book farm visit. Please try again.");
    }
  };

  const handleUpdateBooking = async (id: string, data: Partial<any>) => {
    try {
      await updateDoc(doc(db, "bookings", id), data);
      showToast("Booking updated");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteDoc(doc(db, "bookings", id));
        showToast("Booking deleted");
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `bookings/${id}`);
      }
    }
  };

  const handleUpdateQuantity = (id: number, weight: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => !(item.id === id && item.selectedWeight === weight)));
    } else {
      setCart(prev => prev.map(item => (item.id === id && item.selectedWeight === weight) ? { ...item, quantity } : item));
    }
  };

  const handleRemoveFromCart = (id: number, weight: number) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.selectedWeight === weight)));
  };

  const handleAddToCart = (product: Product, weight: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedWeight === weight);
      if (existing) {
        return prev.map(item => (item.id === product.id && item.selectedWeight === weight) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, selectedWeight: weight }];
    });
    showToast(`${product.name} added to basket`);
  };

  const handleBuyNow = (product: Product, weight: number) => {
    handleAddToCart(product, weight);
    setIsCartOpen(true);
  };

  const handleCheckout = async (formData: any, deliveryCharge: number) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.selectedWeight * item.quantity, 0);
    const discount = appliedOffer ? (subtotal * appliedOffer.discount_percent) / 100 : 0;
    const total = subtotal - discount + deliveryCharge;

    try {
      const orderData = {
        customer_name: formData.name,
        customer_email: formData.email,
        address: formData.address,
        phone: formData.phone,
        items: cart.map(item => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          selectedWeight: item.selectedWeight
        })),
        total,
        delivery_charge: deliveryCharge,
        promo_code: appliedOffer?.code || null,
        payment_id: formData.payment_id || null,
        payment_status: formData.payment_status || 'pending',
        payment_method: formData.payment_method || 'cod',
        paid_amount: formData.paid_amount || 0,
        status: 'pending',
        created_at: serverTimestamp()
      };

      await addDoc(collection(db, "orders"), orderData);

      // Update stock
      for (const item of cart) {
        const productRef = doc(db, "products", String(item.id));
        await updateDoc(productRef, {
          stock: increment(-item.quantity)
        });
      }

      let successMessage = 'Order placed successfully!';
      if (formData.payment_status === 'paid') {
        successMessage = `Full payment of ₹${total} received. Your order is confirmed!`;
      } else if (formData.payment_status === 'partially_paid') {
        successMessage = `Security deposit of ₹${formData.paid_amount} received. Please pay the balance of ₹${total - formData.paid_amount} on delivery.`;
      } else if (formData.payment_status === 'pending_link') {
        successMessage = 'Order received! Please ensure you have completed the payment on the Razorpay page. Our team will verify and confirm your order shortly.';
      }
      
      showToast(successMessage);
      setCart([]);
      setAppliedOffer(null);
      setBuyerEmail(formData.email);
      setView('history');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "orders");
      showToast("Failed to place order. Please try again.");
    }
  };

  const handleApplyPromo = (code: string) => {
    const offer = offers.find(o => o.code.toUpperCase() === code.toUpperCase() && o.active);
    if (offer) {
      setAppliedOffer(offer);
      return true;
    }
    return false;
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsAuthOpen(false);
      showToast("Signed in successfully");
    } catch (error) {
      console.error("Login error:", error);
      showToast("Failed to sign in");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsSellerAuthenticated(false);
      setView('store');
      showToast("Signed out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSellerLogin = async () => {
    const adminEmail = "ksndmc.nandishavr@gmail.com";
    if (sellerPin === "1234" || (currentUser && currentUser.email === adminEmail)) {
      setIsSellerAuthenticated(true);
      setIsAuthOpen(false);
      setView('seller');
      showToast("Seller authenticated");
    } else {
      showToast('Invalid PIN or Unauthorized');
    }
  };

  const handleUpdateProduct = async (id: string, data: Partial<Product>) => {
    try {
      await updateDoc(doc(db, "products", id), data);
      showToast("Product updated");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const handleAddProduct = async (data: any) => {
    try {
      await addDoc(collection(db, "products"), {
        ...data,
        available: 1
      });
      showToast("Product added");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "products");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this variety?')) {
      try {
        await deleteDoc(doc(db, "products", id));
        showToast("Product deleted");
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      }
    }
  };

  const handleUpdateOffer = async (id: string, data: Partial<Offer>) => {
    try {
      await updateDoc(doc(db, "offers", id), data);
      showToast("Offer updated");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `offers/${id}`);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await deleteDoc(doc(db, "offers", id));
        showToast("Offer deleted");
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `offers/${id}`);
      }
    }
  };

  const handleUpdateOrder = async (id: string, data: Partial<Order>) => {
    try {
      await updateDoc(doc(db, "orders", id), data);
      showToast("Order updated");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${id}`);
    }
  };

  const handleAddOffer = async (data: any) => {
    try {
      await addDoc(collection(db, "offers"), {
        ...data,
        active: 1
      });
      showToast("Offer added");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "offers");
    }
  };

  if (products.length === 0) {
    return (
      <div className="h-screen w-full bg-brand-cream flex flex-col items-center justify-center">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 10, 0]
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-24 h-24 mb-8"
        >
          <img src="https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-contain leaf-mask" referrerPolicy="no-referrer" loading="lazy" />
        </motion.div>
        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-serif italic text-brand-olive">Namma Kolar Mangoes</h2>
          <div className="flex items-center justify-center gap-2">
            <motion.div 
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
              className="w-2 h-2 rounded-full bg-brand-mango" 
            />
            <motion.div 
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
              className="w-2 h-2 rounded-full bg-brand-mango" 
            />
            <motion.div 
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
              className="w-2 h-2 rounded-full bg-brand-mango" 
            />
          </div>
          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-stone-400">Harvest 2026 Now Available</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-brand-cream">
      <Toast 
        message={toast.message} 
        isVisible={toast.visible} 
        onHide={() => setToast(prev => ({ ...prev, visible: false }))} 
      />

      <Header 
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenHistory={() => setView('history')}
        setView={setView}
        t={t}
        language={language}
        onLanguageChange={setLanguage}
      />

      <main className="pt-20">
        {view === 'store' && (
          <Storefront 
            products={products} 
            offers={offers}
            testimonials={testimonials}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onOpenCart={() => setIsCartOpen(true)}
            cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenHistory={() => {
              setView('store');
              setTimeout(() => document.getElementById('history')?.scrollIntoView({ behavior: 'smooth' }), 100);
            }}
            onOpenBooking={() => setIsBookingModalOpen(true)}
            heroBg={heroBg}
            onHeroBgChange={setHeroBg}
            isLoading={isLoading}
            t={t}
            language={language}
            onLanguageChange={setLanguage}
            buyerEmail={buyerEmail}
          />
        )}

        {view === 'history' && (
          <OrderHistory 
            onBack={() => setView('store')} 
            initialEmail={buyerEmail} 
            t={t}
            language={language}
          />
        )}

        {view === 'checkout' && (
          <CheckoutForm 
            items={cart} 
            appliedOffer={appliedOffer}
            onBack={() => setView('store')}
            onSubmit={handleCheckout}
            t={t}
            language={language}
          />
        )}

        {view === 'seller' && isSellerAuthenticated && (
          <SellerDashboard 
            products={products}
            orders={orders}
            offers={offers}
            bookings={bookings}
            onUpdateProduct={handleUpdateProduct}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOffer={handleUpdateOffer}
            onDeleteOffer={handleDeleteOffer}
            onAddOffer={handleAddOffer}
            onUpdateOrder={handleUpdateOrder}
            onUpdateBooking={handleUpdateBooking}
            onDeleteBooking={handleDeleteBooking}
            onLogout={handleLogout}
            isLoading={isLoading}
            dbStatus={dbStatus}
          />
        )}
      </main>

      <Footer 
        t={t} 
        language={language} 
        onOpenHistory={() => {
          setView('store');
          setTimeout(() => document.getElementById('history')?.scrollIntoView({ behavior: 'smooth' }), 100);
        }} 
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        onCheckout={() => { setIsCartOpen(false); setView('checkout'); }}
        onApplyPromo={handleApplyPromo}
        appliedOffer={appliedOffer}
        t={t}
        language={language}
      />

      <FarmBookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBook={handleBookFarmVisit}
      />

      <AnimatePresence>
        {isAuthOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
            >
              <Card className="w-full max-w-sm pointer-events-auto">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-serif italic">{language === 'en' ? 'Login' : 'ಲಾಗಿನ್'}</h3>
                  <button onClick={() => setIsAuthOpen(false)} className="p-2 hover:bg-stone-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {currentUser ? (
                    <div className="p-6 bg-stone-50 rounded-[32px] text-center space-y-4">
                      <div className="w-16 h-16 bg-brand-olive text-white rounded-full flex items-center justify-center mx-auto text-2xl font-serif italic">
                        {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-serif italic text-lg">{currentUser.displayName || 'User'}</p>
                        <p className="text-xs text-stone-400 font-sans">{currentUser.email}</p>
                      </div>
                      <Button variant="outline" onClick={handleLogout} className="w-full border-stone-200 text-stone-600">
                        {language === 'en' ? 'Sign Out' : 'ಸೈನ್ ಔಟ್'}
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={handleGoogleLogin} 
                      className="w-full py-4 border-2 border-stone-100 flex items-center justify-center gap-3 hover:bg-stone-50 transition-all"
                    >
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                      <span className="font-sans font-bold uppercase tracking-widest text-[10px]">
                        {language === 'en' ? 'Sign in with Google' : 'ಗೂಗಲ್ ಮೂಲಕ ಸೈನ್ ಇನ್'}
                      </span>
                    </Button>
                  )}

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100"></div></div>
                    <div className="relative flex justify-center text-xs uppercase tracking-widest text-stone-300 font-sans bg-white px-2">{language === 'en' ? 'Seller Access' : 'ಮಾರಾಟಗಾರರ ಪ್ರವೇಶ'}</div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-stone-400 font-sans">{language === 'en' ? 'Seller PIN' : 'ಮಾರಾಟಗಾರರ ಪಿನ್'}</label>
                    <input 
                      type="password" 
                      maxLength={4}
                      value={sellerPin}
                      onChange={e => setSellerPin(e.target.value)}
                      className="w-full bg-stone-50 border-none rounded-2xl px-4 py-3 font-sans text-center text-2xl tracking-[1em] focus:ring-2 focus:ring-brand-olive/20 outline-none"
                      placeholder="••••"
                    />
                    <Button onClick={handleSellerLogin} className="w-full mt-2">{language === 'en' ? 'Verify PIN' : 'ಪಿನ್ ಪರಿಶೀಲಿಸಿ'}</Button>
                  </div>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100"></div></div>
                    <div className="relative flex justify-center text-xs uppercase tracking-widest text-stone-300 font-sans bg-white px-2">{language === 'en' ? 'OR' : 'ಅಥವಾ'}</div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-stone-400 font-sans">{language === 'en' ? 'Buyer Email/Phone' : 'ಖರೀದಿದಾರರ ಇಮೇಲ್/ಫೋನ್'}</label>
                    <input 
                      type="text" 
                      value={buyerEmail}
                      onChange={e => setBuyerEmail(e.target.value)}
                      className="w-full bg-stone-50 border-none rounded-2xl px-4 py-3 font-sans text-sm focus:ring-2 focus:ring-brand-olive/20 outline-none"
                      placeholder={language === 'en' ? 'Email or Phone' : 'ಇಮೇಲ್ ಅಥವಾ ಫೋನ್'}
                    />
                    <Button 
                      variant="secondary" 
                      className="w-full mt-2"
                      onClick={() => {
                        setView('history');
                        setIsAuthOpen(false);
                      }}
                    >
                      {language === 'en' ? 'View Order History' : 'ಆರ್ಡರ್ ಇತಿಹಾಸ ನೋಡಿ'}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <HelpChat t={t} language={language} />

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-8 left-6 right-6 h-20 bg-white/80 backdrop-blur-lg rounded-[32px] px-8 z-40 md:hidden flex justify-around items-center shadow-2xl border border-stone-100">
        <button 
          onClick={() => { setView('store'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
          className={cn("flex flex-col items-center gap-1", view === 'store' ? "text-brand-olive" : "text-stone-400")}
        >
          <Package className="w-6 h-6" />
          <span className="text-[10px] font-sans uppercase tracking-widest font-bold">{t.home}</span>
        </button>
        <button 
          onClick={() => setIsCartOpen(true)} 
          className="relative flex flex-col items-center gap-1 text-stone-400"
        >
          <ShoppingBasket className="w-6 h-6" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-brand-mango text-stone-900 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-sans font-bold shadow-lg">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          )}
          <span className="text-[10px] font-sans uppercase tracking-widest font-bold">{t.basket}</span>
        </button>
        <button 
          onClick={() => {
            setView('store');
            setTimeout(() => document.getElementById('history')?.scrollIntoView({ behavior: 'smooth' }), 100);
          }} 
          className="flex flex-col items-center gap-1 text-stone-400"
        >
          <Clock className="w-6 h-6" />
          <span className="text-[10px] font-sans uppercase tracking-widest font-bold">{language === 'en' ? 'History' : 'ಇತಿಹಾಸ'}</span>
        </button>
        <button 
          onClick={() => setIsAuthOpen(true)} 
          className="flex flex-col items-center gap-1 text-stone-400"
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-sans uppercase tracking-widest font-bold">{language === 'en' ? 'Account' : 'ಖಾತೆ'}</span>
        </button>
      </div>

      {dbStatus && (
        <div 
          className="fixed bottom-4 left-4 z-[60] flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-stone-100 warm-shadow-sm pointer-events-auto opacity-50 hover:opacity-100 transition-opacity cursor-help"
        >
          <div className={cn("w-1.5 h-1.5 rounded-full", dbStatus.connected ? "bg-emerald-500" : "bg-red-500")} />
          <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-stone-400">
            {dbStatus.type}
          </span>
          {!dbStatus.connected && (
            <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-red-400 ml-1">
              Error
            </span>
          )}
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}
