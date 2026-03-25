import * as React from 'react';
import { useState, useEffect, ChangeEvent, useMemo, useRef, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, GenerateContentResponse, Modality, ThinkingLevel, VideoGenerationReferenceType, VideoGenerationReferenceImage } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { translations, Language } from './translations';
import { 
  ShoppingBasket, 
  Leaf,
  User, 
  LayoutDashboard, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ChevronRight,
  ChevronLeft,
  Tag,
  Package,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  ArrowLeft,
  Settings,
  LogOut,
  HelpCircle,
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
  AlertCircle,
  Search,
  Bell,
  MessageSquare,
  Sparkles,
  Send,
  Video,
  Mail,
  Palette,
  ExternalLink,
  Download,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Product, CartItem, Order, Offer, Testimonial, ProductReview } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

declare const Razorpay: any;

interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    aistudio: AIStudio;
  }
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

// --- Components ---

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-brand-cream flex flex-col items-center justify-center p-8"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative"
      >
        <div className="w-32 h-32 bg-brand-mango rounded-full flex items-center justify-center shadow-2xl mango-glow animate-float">
          <Package size={48} className="text-stone-900" />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <h1 className="font-serif italic text-4xl text-brand-olive mb-2">Namma kolar mango</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold">Premium Harvest • Since 1926</p>
        </motion.div>
      </motion.div>
      
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: "200px" }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute bottom-24 h-[1px] bg-brand-olive/20 overflow-hidden"
      >
        <motion.div 
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-full h-full bg-brand-olive"
        />
      </motion.div>
    </motion.div>
  );
};

const PullToRefresh = ({ isRefreshing }: { isRefreshing: boolean }) => (
  <AnimatePresence>
    {isRefreshing && (
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 60, opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="flex items-center justify-center overflow-hidden"
      >
        <Loader2 size={20} className="text-brand-olive animate-spin" />
      </motion.div>
    )}
  </AnimatePresence>
);

const Button = ({ className, variant = 'primary', ...props }: any) => {
  const variants = {
    primary: 'bg-brand-olive text-white hover:bg-stone-800 shadow-xl shadow-brand-olive/10 hover:shadow-brand-olive/20 active:scale-95',
    secondary: 'bg-white border border-brand-olive/20 text-brand-olive hover:bg-stone-50 active:scale-95',
    mango: 'bg-gradient-to-br from-brand-mango to-brand-mango-dark text-stone-900 hover:brightness-105 shadow-xl shadow-brand-mango/20 hover:shadow-brand-mango/40 active:scale-95',
    outline: 'bg-transparent border border-brand-olive/30 text-brand-olive hover:bg-brand-olive hover:text-white active:scale-95',
    white: 'bg-white text-brand-olive hover:bg-stone-50 shadow-2xl active:scale-95',
    ghost: 'hover:bg-stone-100/50 text-stone-500 active:scale-95',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 active:scale-95'
  };
  
  const isPulsing = props.pulsing;
  
  return (
    <motion.button 
      whileTap={{ scale: 0.96 }}
      animate={isPulsing ? {
        boxShadow: ["0 0 0 0px rgba(255, 179, 71, 0.4)", "0 0 0 20px rgba(255, 179, 71, 0)", "0 0 0 0px rgba(255, 179, 71, 0)"]
      } : {}}
      transition={isPulsing ? {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut"
      } : {}}
      className={cn(
        'px-8 py-4 rounded-2xl transition-all font-display font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50 text-center',
        variants[variant as keyof typeof variants],
        className
      )} 
      {...props} 
    />
  );
};

const Card = ({ children, className, glass = false }: any) => (
  <div className={cn(
    'rounded-[2rem] warm-shadow p-6 md:p-10 transition-all duration-700 border border-stone-100/50', 
    glass ? 'glass-card' : 'bg-white',
    className
  )}>
    {children}
  </div>
);

const Sidebar = ({ view, setView, t, language, cartCount, user, onOpenAuth, onLogout }: any) => {
  const navItems = [
    { id: 'store', label: t.home, icon: Package },
    { id: 'cart', label: t.basket, icon: ShoppingBasket, count: cartCount },
    { id: 'history', label: language === 'en' ? 'Orders' : 'ಆರ್ಡರ್ಗಳು', icon: Clock },
    { id: 'seller', label: language === 'en' ? 'Admin' : 'ನಿರ್ವಾಹಕ', icon: LayoutDashboard, adminOnly: true },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[var(--sidebar-width)] h-screen sticky top-0 bg-brand-cream border-r border-stone-200/50 z-50">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 h-64 flex items-center justify-center opacity-10 pointer-events-none">
        <span className="vertical-text text-stone-900 font-black">ESTD 1984 • KOLAR GOLD FIELDS</span>
      </div>

      <div className="p-10">
        <div 
          onClick={() => { setView('store'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex flex-col gap-4 cursor-pointer group"
        >
          <div className="w-14 h-14 bg-brand-olive rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
            <Leaf className="text-brand-mango w-7 h-7" />
          </div>
          <div>
            <h1 className="font-serif italic text-3xl leading-none text-stone-900 tracking-tight">Namma Kolar</h1>
            <p className="text-[9px] font-display font-black uppercase tracking-[0.4em] mt-2 text-brand-olive/60">Premium Mangoes</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-3 mt-8">
        {navItems.map((item) => {
          if (item.adminOnly && !user?.isSeller) return null;
          const isActive = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "w-full flex items-center gap-5 px-5 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden",
                isActive 
                  ? "bg-white text-stone-900 shadow-xl shadow-stone-200/50" 
                  : "text-stone-400 hover:bg-white/50 hover:text-stone-600"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform duration-500 group-hover:scale-110", isActive ? "text-brand-olive" : "text-stone-300")} />
              <span className="font-display font-bold text-[10px] uppercase tracking-[0.15em]">{item.label}</span>
              {item.count > 0 && (
                <span className={cn(
                  "ml-auto text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black",
                  isActive ? "bg-brand-mango text-stone-900" : "bg-stone-200 text-stone-500"
                )}>
                  {item.count}
                </span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-8 bg-brand-olive rounded-r-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-8">
        {user ? (
          <div className="flex items-center gap-4 p-4 rounded-3xl bg-white shadow-sm border border-stone-100">
            <div className="relative">
              <img src={user.photoURL || null} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-[10px] uppercase tracking-wider truncate">{user.displayName}</p>
              <button 
                onClick={onLogout}
                className="text-[9px] font-display font-black uppercase tracking-widest text-stone-400 hover:text-red-500 transition-colors mt-0.5"
              >
                {language === 'en' ? 'Logout' : 'ನಿರ್ಗಮಿಸಿ'}
              </button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full border-stone-200 text-stone-600 hover:bg-white hover:border-white hover:shadow-xl" onClick={onOpenAuth}>
            <User className="w-4 h-4" />
            {language === 'en' ? 'Login' : 'ಲಾಗಿನ್'}
          </Button>
        )}
      </div>
    </aside>
  );
};

const TopBar = ({ language, onLanguageChange, t, searchQuery, setSearchQuery, cartCount, onOpenCart }: any) => {
  return (
    <header className="h-[var(--topbar-height)] bg-white/80 backdrop-blur-3xl border-b border-stone-100/50 sticky top-0 z-40 px-6 md:px-10 flex items-center justify-between transition-all duration-500">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-brand-olive transition-all duration-500" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'en' ? "Search heritage varieties..." : "ಹುಡುಕಿ..."}
            className="w-full bg-stone-50/50 border border-stone-100 rounded-[2rem] pl-16 pr-8 py-4 text-[10px] font-display font-black uppercase tracking-[0.2em] focus:bg-white focus:ring-8 focus:ring-brand-olive/5 focus:border-brand-olive/20 outline-none transition-all duration-500 shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-10 ml-6 md:ml-10">
        <div className="hidden sm:flex items-center bg-stone-50 p-1.5 rounded-2xl border border-stone-100">
          <button 
            onClick={() => onLanguageChange('en')}
            className={cn("px-5 py-2.5 rounded-xl text-[9px] font-display font-black uppercase tracking-widest transition-all duration-500", language === 'en' ? "bg-white text-brand-olive shadow-xl" : "text-stone-400 hover:text-stone-600")}
          >
            EN
          </button>
          <button 
            onClick={() => onLanguageChange('kn')}
            className={cn("px-5 py-2.5 rounded-xl text-[9px] font-display font-black uppercase tracking-widest transition-all duration-500", language === 'kn' ? "bg-white text-brand-olive shadow-xl" : "text-stone-400 hover:text-stone-600")}
          >
            KN
          </button>
        </div>

        <div className="h-8 w-px bg-stone-200/50 hidden md:block" />

        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={onOpenCart}
          className="relative p-4 bg-brand-olive text-white rounded-2xl shadow-2xl shadow-brand-olive/20 group hover:bg-brand-olive/90 transition-all duration-500"
        >
          <ShoppingBasket className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-brand-mango text-stone-900 text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-sans font-black shadow-xl border-2 border-white animate-bounce">
              {cartCount}
            </span>
          )}
        </motion.button>
      </div>
    </header>
  );
};

// --- Views ---

const ProductCard = ({ product, onAddToCart, onBuyNow, t, buyerEmail, showToast }: any) => {
  const [selectedWeight, setSelectedWeight] = useState(5);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const weights = [5, 7.5, 10, 15];

  useEffect(() => {
    if (!product.id) return;
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/products/${product.id}/reviews`);
        const data = await res.json();
        setReviews(data);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    };
    fetchReviews();
  }, [product.id]);

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim() || !newReview.name.trim()) {
      showToast("Please provide your name and a comment.");
      return;
    }
    setIsSubmitting(true);
    try {
      const reviewData = {
        product_id: product.id,
        name: newReview.name,
        rating: newReview.rating,
        comment: newReview.comment
      };
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      if (res.ok) {
        setNewReview({ name: '', rating: 5, comment: '' });
        setIsReviewing(false);
        const updatedRes = await fetch(`/api/products/${product.id}/reviews`);
        const updatedData = await updatedRes.json();
        setReviews(updatedData);
        showToast("Review submitted successfully!");
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      showToast("Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.21, 0.45, 0.32, 0.9] }}
      className="group relative h-full"
    >
      <Card className="h-full p-0 overflow-hidden bg-white border border-stone-100/30 hover:shadow-2xl transition-all duration-700 rounded-[3rem] flex flex-col">
        {/* Image Container */}
        <div className="aspect-[4/5] overflow-hidden relative p-6 bg-stone-50/30">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="w-full h-full rounded-[2.5rem] overflow-hidden bg-white shadow-inner relative"
          >
            {!imageLoaded && (
              <div className="absolute inset-0 bg-stone-100 animate-shimmer flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-brand-mango/20 border-t-brand-mango rounded-full animate-spin" />
              </div>
            )}
            <motion.img 
              initial={{ opacity: 0 }}
              animate={{ opacity: imageLoaded ? 1 : 0 }}
              transition={{ duration: 0.8 }}
              onLoad={() => setImageLoaded(true)}
              src={product.image_url || null} 
              alt={product.name}
              className="w-full h-full object-cover leaf-mask transition-transform duration-1000 group-hover:scale-110"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </motion.div>
          
          {/* Badges */}
          <div className="absolute top-10 left-10 flex flex-col gap-2">
            <span className="bg-white/90 backdrop-blur-md px-5 py-2 rounded-full text-[9px] font-display font-black uppercase tracking-[0.2em] text-brand-olive shadow-sm border border-white/50">
              {product.variety}
            </span>
          </div>

          {product.available === 1 && (
            <div className="absolute top-10 right-10">
              <div className="bg-brand-mango text-stone-900 p-3 rounded-full shadow-xl animate-float">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="p-8 md:p-12 flex flex-col flex-1 space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-3xl md:text-4xl font-serif italic leading-none tracking-tight">{product.name}</h3>
              <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-100">
                <Star className="w-3 h-3 fill-brand-mango text-brand-mango" />
                <span className="text-[10px] font-display font-black text-stone-600">{averageRating || '5.0'}</span>
              </div>
            </div>
            <p className="text-stone-400 text-[11px] font-sans leading-relaxed line-clamp-2">
              {product.description}
            </p>
          </div>

          {/* Weight Selection */}
          <div className="space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-display font-black uppercase tracking-[0.2em] text-stone-400">{t.selectWeight}</span>
              <div className="flex flex-col items-end">
                <span className="text-sm text-stone-400 line-through font-serif italic">₹{Math.round(product.price * selectedWeight * 1.2)}</span>
                <span className="text-3xl font-serif italic text-brand-olive">₹{product.price * selectedWeight}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {weights.map(w => (
                <button
                  key={w}
                  onClick={() => setSelectedWeight(w)}
                  className={cn(
                    "px-5 py-2.5 rounded-2xl text-[10px] font-display font-black uppercase tracking-widest transition-all duration-500 border",
                    selectedWeight === w 
                      ? "bg-brand-olive text-white border-brand-olive shadow-xl shadow-brand-olive/20 scale-105" 
                      : "bg-white text-stone-400 border-stone-100 hover:border-brand-olive/20"
                  )}
                >
                  {w}kg
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-8 border-t border-stone-100/50">
            <Button 
              variant="outline" 
              className="flex-1 border-stone-200 text-stone-600 hover:bg-stone-50"
              onClick={() => onAddToCart(product, selectedWeight)}
            >
              {t.addToCart}
            </Button>
            <Button 
              variant="mango" 
              className="flex-1"
              onClick={() => onBuyNow(product, selectedWeight)}
            >
              {t.buyNow}
            </Button>
          </div>

          {/* Reviews Toggle */}
          <div className="flex justify-center">
            <button 
              onClick={() => setShowReviews(!showReviews)}
              className="text-[9px] font-display font-black uppercase tracking-[0.2em] text-stone-400 hover:text-brand-olive transition-all duration-500 flex items-center gap-2"
            >
              <MessageSquare className="w-3 h-3" />
              {showReviews ? 'Hide Reviews' : `View Reviews (${reviews.length})`}
            </button>
          </div>

          {/* Reviews Section */}
          <AnimatePresence>
            {showReviews && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-stone-100 pt-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-serif italic text-xl">Customer Reviews</h4>
                  <Button 
                    variant="ghost" 
                    className="text-[10px] uppercase tracking-widest font-bold text-brand-olive"
                    onClick={() => setIsReviewing(!isReviewing)}
                  >
                    {isReviewing ? 'Cancel' : 'Write a Review'}
                  </Button>
                </div>

                {isReviewing && (
                  <div className="bg-stone-50 p-4 rounded-2xl space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">Your Name</label>
                      <input 
                        type="text"
                        value={newReview.name}
                        onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-mango"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star}
                            onClick={() => setNewReview({...newReview, rating: star})}
                            className="focus:outline-none"
                          >
                            <Star className={cn("w-6 h-6", star <= newReview.rating ? "fill-brand-mango text-brand-mango" : "text-stone-200")} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">Comment</label>
                      <textarea 
                        value={newReview.comment}
                        onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-mango min-h-[80px]"
                        placeholder="Share your experience..."
                      />
                    </div>
                    <Button 
                      variant="mango" 
                      className="w-full py-3 text-[10px] font-bold uppercase tracking-widest"
                      onClick={handleSubmitReview}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                )}

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                  {reviews.length === 0 ? (
                    <p className="text-stone-400 text-sm italic text-center py-4">No reviews yet. Be the first to review!</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b border-stone-50 pb-4 last:border-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-sans font-bold text-xs text-stone-800">{review.name}</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} className={cn("w-2.5 h-2.5", star <= review.rating ? "fill-brand-mango text-brand-mango" : "text-stone-200")} />
                            ))}
                          </div>
                        </div>
                        <p className="text-stone-600 text-xs leading-relaxed">{review.comment}</p>
                        <span className="text-[9px] text-stone-300 mt-2 block">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <Card className="h-full p-0 overflow-hidden bg-white border border-stone-100/50 rounded-[40px] flex flex-col md:flex-row">
    <div className="md:w-2/5 aspect-square overflow-hidden relative p-4 md:p-6 bg-stone-50/50">
      <div className="w-full h-full bg-stone-100 rounded-[24px] md:rounded-[32px] leaf-mask animate-shimmer" />
    </div>
    <div className="flex-1 p-8 md:p-10 space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <div className="h-8 bg-stone-100 rounded-xl w-3/4 animate-shimmer" />
          <div className="h-4 bg-stone-50 rounded-full w-1/4 animate-shimmer" />
        </div>
        <div className="h-10 bg-stone-100 rounded-xl w-20 animate-shimmer" />
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-stone-50 rounded-full w-1/4 animate-shimmer" />
        <div className="flex gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-12 bg-stone-50 rounded-full animate-shimmer" />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-stone-50 rounded-full w-full animate-shimmer" />
        <div className="h-3 bg-stone-50 rounded-full w-2/3 animate-shimmer" />
      </div>
      <div className="flex gap-4">
        <div className="h-14 flex-1 bg-stone-100 rounded-full animate-shimmer" />
        <div className="h-14 flex-[2] bg-stone-100 rounded-full animate-shimmer" />
      </div>
    </div>
  </Card>
);

const Testimonials = ({ t, language, testimonials }: any) => {
  return (
    <section className="py-20 md:py-32 bg-stone-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 md:mb-24">
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
            className="text-4xl md:text-7xl font-serif italic text-brand-olive mb-8"
          >
            {t.testimonialsSubtitle}
          </motion.h2>
        </div>

        <div className="flex md:grid md:grid-cols-3 gap-8 md:gap-12 overflow-x-auto md:overflow-visible pb-8 md:pb-0 no-scrollbar snap-x snap-mandatory">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="min-w-[85vw] md:min-w-0 snap-center"
            >
              <Card className="h-full flex flex-col justify-between hover:translate-y-[-8px] transition-all duration-500 border border-stone-100 bg-white rounded-[32px] p-8">
                <div className="space-y-6">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-3.5 h-3.5 md:w-4 md:h-4",
                          i < testimonial.rating ? "fill-brand-mango text-brand-mango" : "text-stone-200"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-lg md:text-xl font-serif italic text-stone-600 leading-relaxed">
                    "{testimonial.review}"
                  </p>
                </div>
                <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-stone-100 flex justify-between items-center">
                  <div>
                    <p className="font-sans font-bold text-[10px] md:text-xs uppercase tracking-widest text-brand-olive">
                      {testimonial.name}
                    </p>
                    <p className="text-[9px] md:text-[10px] font-sans uppercase tracking-widest text-stone-400 mt-1">
                      {testimonial.date}
                    </p>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-mango/10 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-brand-mango" />
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

const Footer = ({ t, language, onOpenHistory, onOpenAuth }: any) => (
  <footer className="bg-brand-olive text-white pt-48 pb-48 md:pb-32 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-mango to-transparent opacity-30" />
    <div className="absolute -top-64 -right-64 w-[600px] h-[600px] bg-brand-mango/5 rounded-full blur-[120px]" />
    <div className="absolute -bottom-64 -left-64 w-[600px] h-[600px] bg-brand-olive/20 rounded-full blur-[120px]" />

    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-48">
        <div className="md:col-span-2 space-y-12">
          <div className="space-y-4">
            <h3 className="text-6xl md:text-8xl font-serif italic leading-[0.8] tracking-tighter">
              {language === 'en' ? 'Namma Kolar' : 'ನಮ್ಮ ಕೋಲಾರ'} <br /> 
              <span className="text-brand-mango font-light">{language === 'en' ? 'Mangoes' : 'ಮಾವು'}</span>
            </h3>
            <p className="text-white/40 font-display font-black text-[10px] uppercase tracking-[0.5em]">Harvesting Heritage Since 1984</p>
          </div>
          <p className="text-white/60 font-serif italic text-2xl max-w-lg leading-relaxed">
            {t.heroSubtitle}
          </p>
          <div className="flex gap-10">
            {['Instagram', 'Facebook', 'Twitter'].map(social => (
              <button key={social} className="text-[10px] font-display font-black uppercase tracking-[0.3em] text-white/30 hover:text-brand-mango transition-all duration-500 hover:-translate-y-1">
                {social}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-10">
          <p className="text-[11px] font-display font-black uppercase tracking-[0.4em] text-brand-mango/60">{t.quickLinks}</p>
          <ul className="space-y-6 font-serif italic text-xl text-white/50">
            <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-all duration-500 hover:translate-x-2">{t.home}</button></li>
            <li><button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-all duration-500 hover:translate-x-2">{t.shopHarvest}</button></li>
            <li><button onClick={() => document.getElementById('heritage')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-all duration-500 hover:translate-x-2">{t.ourStory}</button></li>
            <li><button onClick={() => document.getElementById('visit')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-all duration-500 hover:translate-x-2">{t.visitOurFarm}</button></li>
            <li><button onClick={() => document.getElementById('etiquette')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-all duration-500 hover:translate-x-2">{t.trackOrder}</button></li>
            <li><button onClick={onOpenAuth} className="hover:text-white transition-all duration-500 hover:translate-x-2">{language === 'en' ? 'Seller Access' : 'ಮಾರಾಟಗಾರರ ಪ್ರವೇಶ'}</button></li>
          </ul>
        </div>

        <div className="space-y-10">
          <p className="text-[11px] font-display font-black uppercase tracking-[0.4em] text-brand-mango/60">{t.contactUs}</p>
          <ul className="space-y-8 font-serif italic text-xl text-white/50">
            <li className="space-y-2">
              <span className="text-white font-black not-italic text-[10px] uppercase tracking-widest block">{language === 'en' ? 'Proprietor' : 'ಮಾಲೀಕರು'}</span>
              <p className="text-white/80">{language === 'en' ? 'Ramakrishnareddy V N' : 'ರಾಮಕೃಷ್ಣರೆಡ್ಡಿ ವಿ ಎನ್'}</p>
            </li>
            <li className="space-y-2">
              <span className="text-white font-black not-italic text-[10px] uppercase tracking-widest block">{language === 'en' ? 'Location' : 'ಸ್ಥಳ'}</span>
              <p className="text-white/80 leading-relaxed">{language === 'en' ? 'Varatanahalli, Srinivasapura, Kolar, Karnataka-563135' : 'ವರತನಹಳ್ಳಿ, ಶ್ರೀನಿವಾಸಪುರ, ಕೋಲಾರ, ಕರ್ನಾಟಕ-563135'}</p>
            </li>
            <li className="space-y-2">
              <span className="text-white font-black not-italic text-[10px] uppercase tracking-widest block">{language === 'en' ? 'Connect' : 'ಸಂಪರ್ಕಿಸಿ'}</span>
              <p className="text-white/80">+91 97430 25459 <br /> +91 91645 02728</p>
            </li>
          </ul>
        </div>
      </div>

      <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
          <p className="text-[9px] font-display font-black uppercase tracking-[0.4em] text-white/20">
            {t.allRightsReserved}
          </p>
          <div className="flex gap-10">
            <button className="text-[9px] font-display font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-all duration-500">{t.privacyPolicy}</button>
            <button className="text-[9px] font-display font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-all duration-500">{t.termsOfService}</button>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-full border border-white/5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-display font-black uppercase tracking-[0.3em] text-white/40">SERVER ONLINE • HARVEST 2026</span>
        </div>
      </div>
    </div>
  </footer>
);

const Storefront = ({ 
  products, 
  filteredProducts,
  searchQuery,
  setSearchQuery,
  offers, 
  testimonials, 
  onAddToCart, 
  onBuyNow, 
  onOpenCart, 
  cartCount, 
  onOpenAuth, 
  onOpenHistory, 
  onOpenBooking, 
  heroBg, 
  onHeroBgChange, 
  isLoading, 
  t, 
  language, 
  onLanguageChange, 
  buyerEmail,
  onRefresh,
  showToast
}: any) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Premium', 'Popular', 'Organic', 'Export Quality'];

  const finalFilteredProducts = filteredProducts.filter((p: any) => {
    if (selectedCategory === 'All') return true;
    return p.variety?.toLowerCase().includes(selectedCategory.toLowerCase()) || 
           p.description?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
           p.name?.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const featuredProducts = products.filter((p: any) => p.available === 1).slice(0, 3);

  return (
    <div className="relative min-h-screen bg-brand-cream/30">
      {/* Hero Section - Editorial / Magazine Style */}
      <section id="home" className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-brand-olive rounded-b-[60px] md:rounded-b-[160px] shadow-[0_40px_100px_rgba(0,0,0,0.3)]">
        <motion.div 
          key={heroBg}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={heroBg || null} 
            className="w-full h-full object-cover oval-mask brightness-75 contrast-125"
            alt="Mango Orchard"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-b from-brand-olive/80 via-transparent to-brand-olive/95 z-[1]" />
        
        <div className="relative z-10 text-center px-6 max-w-7xl mx-auto py-20">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
            className="inline-flex items-center gap-6 bg-white/5 backdrop-blur-3xl border border-white/10 px-10 py-4 rounded-full mb-16 shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
          >
            <div className="w-3 h-3 bg-brand-mango rounded-full mango-glow" />
            <span className="text-white text-[11px] font-display font-black uppercase tracking-[0.5em] whitespace-nowrap">
              {t.harvestAvailable} • ESTD 1984
            </span>
          </motion.div>

          <div className="relative mb-16">
            <motion.h1 
              initial={{ y: 100, opacity: 0, skewY: 5 }}
              animate={{ y: 0, opacity: 1, skewY: 0 }}
              transition={{ delay: 0.8, duration: 1.8, ease: [0.23, 1, 0.32, 1] }}
              className="text-8xl md:text-[16vw] text-white font-serif italic leading-[0.7] tracking-tighter drop-shadow-2xl"
            >
              {language === 'en' ? (
                <>Namma <span className="text-brand-mango italic font-light">Kolar</span> <br /> <span className="not-italic font-black text-white/90">Mangoes</span></>
              ) : (
                <>ನಮ್ಮ <span className="text-brand-mango italic font-light">ಕೋಲಾರ</span> <br /> <span className="not-italic font-black text-white/90">ಮಾವು</span></>
              )}
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 2, duration: 1.5, ease: "backOut" }}
              className="absolute -top-16 -right-16 hidden lg:block"
            >
              <div className="w-48 h-48 rounded-full border border-white/10 flex items-center justify-center animate-float backdrop-blur-sm bg-white/5">
                <div className="text-center space-y-2">
                  <span className="block text-[10px] font-display font-black text-brand-mango tracking-[0.3em]">PREMIUM</span>
                  <span className="block text-[8px] font-sans font-bold text-white/40 tracking-[0.5em]">HERITAGE</span>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 1.2 }}
            className="text-xl md:text-3xl text-white/60 font-serif italic max-w-4xl mx-auto mb-20 leading-relaxed tracking-tight"
          >
            {t.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-12"
          >
            <Button 
              variant="mango" 
              className="w-full sm:w-auto px-20 py-10 text-xs rounded-[2rem] shadow-[0_32px_64px_rgba(242,125,38,0.3)] font-black uppercase tracking-[0.4em] hover:scale-105 transition-all duration-500 group"
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.exploreHarvest}
              <ChevronRight className="w-6 h-6 ml-4 group-hover:translate-x-2 transition-transform" />
            </Button>
            
            <div className="flex items-center gap-6">
              <div className="flex -space-x-4">
                {[1,2,3].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-brand-olive overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/100/100`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-white font-display font-black text-[10px] tracking-widest">500+ HAPPY</p>
                <p className="text-white/40 font-sans text-[8px] tracking-[0.3em]">HARVESTERS</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-20">
        {/* Featured Section - Horizontal Scroll / Marquee Feel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-32">
          {featuredProducts.map((product: any, idx: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 1 }}
              className="bg-white/60 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/40 shadow-2xl flex flex-col items-center text-center gap-8 group cursor-pointer hover:bg-white transition-all duration-700"
              onClick={() => document.getElementById(`product-${product.id}`)?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="w-32 h-32 rounded-full overflow-hidden bg-stone-100 flex-shrink-0 shadow-xl">
                <img src={product.image_url || null} className="w-full h-full object-cover leaf-mask group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
              </div>
              <div>
                <span className="text-[9px] font-display font-black uppercase tracking-[0.3em] text-brand-mango mb-3 block">Featured Heritage</span>
                <h4 className="text-3xl font-serif italic text-stone-800 leading-none mb-4">{product.name}</h4>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm text-stone-400 font-serif italic">From</span>
                  <p className="text-lg text-brand-olive font-display font-black">₹{product.price}/kg</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Area */}
        <div id="products" className="py-32 md:py-48">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-24 md:mb-32 gap-12">
            <div className="max-w-3xl text-left">
              <span className="text-brand-olive font-display text-[10px] font-black uppercase tracking-[0.5em] mb-6 block">
                {t.theCollection}
              </span>
              <h2 className="text-6xl md:text-[10vw] font-serif italic leading-[0.75] tracking-tighter">
                {language === 'en' ? 'The Varieties' : 'ಕೋಲಾರದ ವಿವಿಧ'} <br /> 
                <span className="text-brand-mango/60">{language === 'en' ? 'of Kolar' : 'ತಳಿಗಳು'}</span>
              </h2>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-stone-400 group-focus-within:text-brand-olive transition-all duration-500" />
              </div>
              <input
                type="text"
                placeholder={t.searchVariety}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-stone-200/50 rounded-3xl pl-16 pr-8 py-5 font-display font-bold text-[10px] uppercase tracking-widest focus:border-brand-olive/30 focus:bg-white focus:ring-8 focus:ring-brand-olive/5 outline-none transition-all duration-500 shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-20">
            {/* Sidebar Filters (Desktop) */}
            <div className="hidden lg:block w-72 flex-shrink-0 space-y-16">
              <div className="space-y-8">
                <h3 className="text-[10px] font-display font-black uppercase tracking-[0.4em] text-stone-400">Categories</h3>
                <div className="flex flex-col gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "flex items-center justify-between px-8 py-5 rounded-2xl text-[10px] font-display font-black uppercase tracking-widest transition-all duration-500 text-left group",
                        selectedCategory === cat 
                          ? "bg-brand-olive text-white shadow-2xl shadow-brand-olive/20" 
                          : "bg-white text-stone-400 hover:bg-stone-50 border border-stone-100"
                      )}
                    >
                      {cat}
                      <ChevronRight className={cn("w-4 h-4 transition-transform duration-500", selectedCategory === cat ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100")} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-10 bg-brand-olive text-white rounded-[3rem] shadow-2xl space-y-8 relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="w-14 h-14 bg-brand-mango rounded-2xl flex items-center justify-center text-stone-900 shadow-xl">
                  <Leaf className="w-7 h-7" />
                </div>
                <h4 className="text-2xl font-serif italic leading-tight">100% Organic <br /> Heritage</h4>
                <p className="text-[11px] text-white/60 leading-relaxed font-sans font-medium">
                  All our mangoes are grown using traditional organic methods in the rich soil of Kolar.
                </p>
              </div>
            </div>

            {/* Product Grid Area */}
            <div className="flex-1 space-y-12">
              {/* Mobile Categories */}
              <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "flex-shrink-0 px-6 py-3 rounded-xl text-[10px] font-sans font-bold uppercase tracking-widest transition-all",
                      selectedCategory === cat 
                        ? "bg-brand-olive text-white shadow-lg shadow-brand-olive/20" 
                        : "bg-white text-stone-400 border border-stone-100"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 stagger-in">
                {isLoading ? (
                  [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
                ) : (
                  finalFilteredProducts.map((product: Product) => (
                    <div key={product.id} id={`product-${product.id}`}>
                      <ProductCard product={product} onAddToCart={onAddToCart} onBuyNow={onBuyNow} t={t} buyerEmail={buyerEmail} showToast={showToast} />
                    </div>
                  ))
                )}
              </div>
              
              {!isLoading && finalFilteredProducts.length === 0 && (
                <div className="text-center py-32 bg-white rounded-[60px] border border-stone-100">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-8 h-8 text-stone-300" />
                  </div>
                  <p className="text-stone-500 font-serif italic text-xl">{t.noProductsFound}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <HarvestCalendar language={language} />

      {/* Heritage Section */}
      <section id="heritage" className="py-24 md:py-48 bg-white overflow-hidden mt-32">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-32 items-center">
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <img 
                src="https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=1200" 
                className="rounded-[40px] md:rounded-[60px] warm-shadow w-full aspect-[4/5] object-cover"
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
              className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 bg-brand-olive p-6 md:p-10 rounded-[32px] md:rounded-[40px] text-white warm-shadow"
            >
              <p className="text-4xl md:text-5xl font-serif italic mb-1 md:mb-2">40+</p>
              <p className="text-[8px] md:text-[10px] font-sans font-bold uppercase tracking-widest opacity-60">{t.yearsOfExcellence}</p>
            </motion.div>
          </div>

          <div className="space-y-8 md:space-y-10">
            <div className="space-y-4">
              <span className="text-brand-olive font-sans text-[10px] font-bold uppercase tracking-[0.4em]">{t.ourStory}</span>
              <h2 className="text-5xl md:text-8xl font-serif italic leading-tight">{language === 'en' ? 'Grown with' : 'ಸಂಪ್ರದಾಯದೊಂದಿಗೆ'} <br /> <span className="text-brand-mango">{language === 'en' ? 'Tradition' : 'ಬೆಳೆದಿದೆ'}</span></h2>
            </div>
            <p className="text-lg md:text-xl text-stone-500 font-serif italic leading-relaxed">
              {t.farmDescription}
            </p>
            <div className="grid grid-cols-2 gap-8 md:gap-12 pt-4 md:pt-8">
              <div className="space-y-2">
                <p className="text-2xl md:text-3xl font-serif italic text-brand-olive">100%</p>
                <p className="text-[9px] md:text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">{t.organicMethods}</p>
              </div>
              <div className="space-y-2">
                <p className="text-2xl md:text-3xl font-serif italic text-brand-olive">{language === 'en' ? 'Direct' : 'ನೇರ'}</p>
                <p className="text-[9px] md:text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">{t.farmToHome}</p>
              </div>
            </div>
            <div className="pt-4 md:pt-8">
              <Button 
                variant="outline" 
                className="px-10 py-5 text-[10px] md:text-xs border-brand-olive/20 text-brand-olive hover:bg-brand-olive hover:text-white rounded-full"
                onClick={() => document.getElementById('visit')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t.planVisit}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Testimonials t={t} language={language} testimonials={testimonials} />

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
                  src="https://images.pexels.com/photos/36135710/pexels-photo-36135710.jpeg" 
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
      const params = new URLSearchParams();
      if (searchEmail) params.append('email', searchEmail);
      if (searchPhone) params.append('phone', searchPhone);
      
      const res = await fetch(`/api/orders/history?${params.toString()}`);
      const data = await res.json();
      setOrders(data);
      setSearched(true);
    } catch (err) {
      console.error("Failed to fetch history:", err);
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("min-h-screen bg-stone-50/50 pb-32", isSection ? "min-h-0 bg-transparent p-0" : "p-6")}
    >
      <div className="max-w-4xl mx-auto stagger-in">
        {!isSection && (
          <button onClick={onBack} className="flex items-center gap-3 text-stone-400 mb-12 md:mb-20 hover:text-brand-olive transition-all group">
            <div className="p-3 bg-white rounded-full shadow-sm border border-stone-100 group-hover:scale-110 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-sans text-[11px] font-black uppercase tracking-[0.3em]">{t.backToStore}</span>
          </button>
        )}

        <div className="mb-12 md:mb-20">
          <span className="text-brand-olive font-sans text-[11px] font-black uppercase tracking-[0.5em] mb-4 md:mb-6 block">{language === 'en' ? 'Track Your' : 'ನಿಮ್ಮ ಆರ್ಡರ್'}</span>
          <h2 className="text-5xl md:text-8xl font-serif italic leading-tight text-stone-800">{language === 'en' ? 'Order' : 'ಆರ್ಡರ್'} <br />{language === 'en' ? 'History' : 'ಇತಿಹಾಸ'}</h2>
        </div>

        <Card className="mb-16 md:mb-24 p-8 md:p-16 bg-white/90 backdrop-blur-xl border-stone-100 rounded-[3rem] shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-sans font-black ml-2">{t.emailAddress}</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-stone-50/50 border-2 border-stone-100 rounded-[2rem] pl-16 pr-8 py-6 font-sans text-sm font-bold focus:border-brand-mango focus:ring-12 focus:ring-brand-mango/5 outline-none transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-sans font-black ml-2">{t.phoneNumber}</label>
              <div className="relative">
                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                <input 
                  type="tel" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-stone-50/50 border-2 border-stone-100 rounded-[2rem] pl-16 pr-8 py-6 font-sans text-sm font-bold focus:border-brand-mango focus:ring-12 focus:ring-brand-mango/5 outline-none transition-all"
                  placeholder="+91 00000 00000"
                />
              </div>
            </div>
          </div>
          <Button 
            variant="mango" 
            onClick={() => fetchHistory()} 
            disabled={loading || (!email && !phone)} 
            className="w-full py-7 rounded-[2rem] text-lg shadow-2xl shadow-brand-mango/20"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{language === 'en' ? 'Searching...' : 'ಹುಡುಕಲಾಗುತ್ತಿದೆ...'}</span>
              </div>
            ) : t.findMyOrders}
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
                        {new Date(order.created_at).toLocaleDateString(language === 'en' ? 'en-IN' : 'kn-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-[0.2em] shadow-sm",
                        order.status === 'delivered' ? "bg-emerald-50 text-emerald-600" : 
                        order.status === 'shipped' ? "bg-blue-50 text-blue-600" :
                        "bg-brand-cream text-brand-olive"
                      )}>
                        {order.status}
                      </span>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[8px] font-sans font-bold uppercase tracking-widest flex items-center gap-1.5",
                        order.payment_status === 'paid' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                        order.payment_status === 'partially_paid' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                        order.payment_status === 'failed' ? "bg-red-50 text-red-600 border border-red-100" :
                        "bg-stone-50 text-stone-400 border border-stone-100"
                      )}>
                        {order.payment_status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                        {order.payment_status === 'partially_paid' && <Wallet className="w-3 h-3" />}
                        {order.payment_status === 'failed' && <AlertCircle className="w-3 h-3" />}
                        {order.payment_status === 'pending' && <Clock className="w-3 h-3" />}
                        {order.payment_status === 'partially_paid' ? (language === 'en' ? 'Deposit Paid' : 'ಮುಂಗಡ ಪಾವತಿಸಲಾಗಿದೆ') : order.payment_status}
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
                    {(Array.isArray(order.items) ? order.items.map(i => `${i.name} (${i.quantity} x ${i.selectedWeight}kg)`) : order.items.split(',')).map((item, idx) => (
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
    </div>
    </motion.div>
  );
};

const CartPage = ({ items, onUpdateQuantity, onRemove, onCheckout, onApplyPromo, appliedOffer, t, language, onBack }: any) => {
  const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.selectedWeight * item.quantity, 0);
  const discount = appliedOffer ? (subtotal * appliedOffer.discount_percent) / 100 : 0;
  const totalWeight = items.reduce((sum: number, item: any) => sum + item.selectedWeight * item.quantity, 0);
  const deliveryCharge = getDeliveryCharge(totalWeight);
  const total = subtotal - discount + deliveryCharge;
  const [promoCode, setPromoCode] = useState('');

  return (
    <div className="min-h-screen bg-stone-50/50 pb-32">
      <div className="max-w-3xl mx-auto px-6 py-12 stagger-in">
        <div className="flex items-center justify-between mb-12">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-4 bg-white rounded-2xl shadow-sm border border-stone-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <div className="text-center flex-1">
            <h2 className="text-4xl font-serif italic text-stone-800">{t.yourBasket}</h2>
            <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-stone-400 mt-2">{items.length} {t.items}</p>
          </div>
          <div className="w-14" /> {/* Spacer */}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[40px] border border-stone-100 shadow-sm">
            <div className="w-24 h-24 bg-brand-mango/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBasket className="w-12 h-12 text-brand-mango" />
            </div>
            <p className="text-stone-500 font-serif italic text-2xl mb-8">{t.emptyBasket}</p>
            <Button onClick={onBack} variant="mango" className="rounded-2xl px-12 py-6">
              {t.startShopping}
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-[40px] p-8 md:p-12 border border-stone-100 shadow-sm space-y-10">
              {items.map((item: CartItem) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`${item.id}-${item.selectedWeight}`} 
                  className="flex items-center gap-6 md:gap-8 group"
                >
                  <div className="relative flex-shrink-0">
                    <img 
                      src={item.image_url || null} 
                      alt={item.name} 
                      className="w-24 h-24 md:w-32 md:h-32 rounded-[24px] md:rounded-[32px] object-cover shadow-lg group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute -top-2 -right-2 bg-brand-mango text-stone-900 text-[10px] w-7 h-7 rounded-full flex items-center justify-center font-sans font-black shadow-lg border-2 border-white">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 py-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-serif text-xl md:text-2xl italic leading-tight">{item.name}</h4>
                      <motion.button 
                        whileTap={{ scale: 0.8 }}
                        onClick={() => onRemove(item.id, item.selectedWeight)}
                        className="p-2 text-stone-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                    <p className="text-stone-400 text-[9px] md:text-[10px] font-sans font-bold uppercase tracking-widest mb-4 md:mb-6">₹{item.price} / kg • {item.selectedWeight}kg pack</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-stone-50 rounded-xl p-1 border border-stone-100">
                        <motion.button 
                          whileTap={{ scale: 0.8 }}
                          onClick={() => onUpdateQuantity(item.id, item.selectedWeight, item.quantity - 1)}
                          className="p-2 hover:bg-white rounded-lg transition-all shadow-sm disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3 md:w-4 md:h-4" />
                        </motion.button>
                        <span className="font-sans text-xs md:text-sm font-bold w-8 md:w-10 text-center">{item.quantity}</span>
                        <motion.button 
                          whileTap={{ scale: 0.8 }}
                          onClick={() => onUpdateQuantity(item.id, item.selectedWeight, item.quantity + 1)}
                          className="p-2 hover:bg-white rounded-lg transition-all shadow-sm"
                        >
                          <Plus className="w-3 h-3 md:w-4 md:h-4" />
                        </motion.button>
                      </div>
                      <span className="font-serif text-xl md:text-2xl italic text-brand-olive">₹{item.price * item.selectedWeight * item.quantity}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-white rounded-[40px] p-8 md:p-12 border border-stone-100 shadow-sm space-y-8">
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-sans font-bold">{language === 'en' ? 'Promo Code' : 'ಪ್ರೋಮೋ ಕೋಡ್'}</p>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    className="flex-1 bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 font-sans text-xs font-bold uppercase tracking-widest outline-none focus:border-brand-mango focus:bg-white transition-all"
                    placeholder={language === 'en' ? 'Enter code' : 'ಕೋಡ್ ಹಾಕಿ'}
                  />
                  <Button 
                    variant="secondary" 
                    className="px-8 rounded-2xl"
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
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Tag className="w-4 h-4" />
                      <span className="text-[10px] font-sans font-bold uppercase tracking-widest">{appliedOffer.code} Applied</span>
                    </div>
                    <span className="text-xs font-bold">-{appliedOffer.discount_percent}%</span>
                  </motion.div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-stone-100">
                <div className="flex justify-between text-stone-400 text-[10px] font-sans font-bold uppercase tracking-widest">
                  <span>{t.subtotal}</span>
                  <span>₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 text-[10px] font-sans font-bold uppercase tracking-widest">
                    <span>{t.discount}</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-400 text-[10px] font-sans font-bold uppercase tracking-widest">
                  <span>{t.delivery}</span>
                  <span>{deliveryCharge === 0 ? t.free : `₹${deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-stone-900 text-sm font-sans font-black uppercase tracking-[0.2em]">{t.total}</span>
                  <span className="text-4xl font-serif italic text-brand-olive">₹{total}</span>
                </div>
              </div>

              <Button 
                variant="mango" 
                className="w-full py-8 text-sm rounded-3xl shadow-2xl shadow-brand-mango/20 group"
                onClick={onCheckout}
              >
                {t.proceedToCheckout}
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
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
    
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    
    if (!razorpayKey) {
      setIsProcessing(false);
      alert(language === 'en' 
        ? "Razorpay Key ID is missing. Please configure VITE_RAZORPAY_KEY_ID in your environment." 
        : "Razorpay ಕೀ ಐಡಿ ಕಾಣೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಪರಿಸರದಲ್ಲಿ VITE_RAZORPAY_KEY_ID ಅನ್ನು ಕಾನ್ಫಿಗರ್ ಮಾಡಿ.");
      return;
    }

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
        name: "Namma kolar mango",
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
      className="max-w-4xl mx-auto px-6 py-8 md:px-6 md:py-32"
    >
      <button onClick={step === 1 ? onBack : () => setStep(1)} className="flex items-center gap-3 text-stone-400 mb-8 md:mb-12 hover:text-brand-olive transition-all group">
        <div className="p-2 bg-white rounded-full shadow-sm border border-stone-100 group-hover:scale-110 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest">
          {step === 1 ? t.backToStore : (language === 'en' ? 'Back to details' : 'ವಿವರಗಳಿಗೆ ಹಿಂತಿರುಗಿ')}
        </span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24">
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-sans font-bold text-xs transition-all duration-500",
              step === 1 ? "bg-brand-mango text-stone-900 ring-4 ring-brand-mango/20" : "bg-emerald-500 text-white"
            )}>
              {step === 1 ? '1' : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div className="h-px w-8 bg-stone-200" />
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-sans font-bold text-xs transition-all duration-500",
              step === 2 ? "bg-brand-mango text-stone-900 ring-4 ring-brand-mango/20" : "bg-stone-100 text-stone-400"
            )}>
              2
            </div>
          </div>

          <h2 className="text-4xl md:text-7xl font-serif italic mb-8 md:mb-12 leading-tight">
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

const SellerDashboard = ({ products, orders, offers, onUpdateProduct, onAddProduct, onDeleteProduct, onUpdateOffer, onDeleteOffer, onAddOffer, onUpdateOrder, onLogout, isLoading, showToast, language }: any) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingOffer, setIsAddingOffer] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ type: string, connected: boolean, details?: string } | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  const handleUpdateBooking = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast("Booking updated successfully");
        fetchBookings();
      }
    } catch (error) {
      console.error("Failed to update booking:", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab]);
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
    <div className="min-h-screen bg-stone-50/50">
      {/* Sub-navigation for Seller Dashboard */}
      <div className="bg-white border-b border-stone-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
          <div className="flex overflow-x-auto no-scrollbar">
            {['overview', 'inventory', 'orders', 'offers', 'bookings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "px-6 py-5 text-[10px] font-sans font-bold uppercase tracking-[0.2em] transition-all relative whitespace-nowrap",
                  activeTab === tab ? "text-brand-olive" : "text-stone-400 hover:text-stone-600"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="seller-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-brand-olive rounded-t-full"
                  />
                )}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-300">Seller Portal</span>
            <div className="w-px h-4 bg-stone-100" />
            <Button 
              variant="ghost" 
              onClick={onLogout}
              className="px-3 py-2 text-red-400 hover:text-red-500 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-12">
        {dbStatus && (
          <div className="flex items-center gap-2 mb-8 bg-white px-4 py-2 rounded-full border border-stone-100 warm-shadow-sm w-fit">
            <div className={cn("w-1.5 h-1.5 rounded-full", dbStatus.connected ? "bg-emerald-500" : "bg-red-500")} />
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-stone-400">
              Database: {dbStatus.type}
            </span>
          </div>
        )}
        {activeTab === 'overview' ? (
          <SalesOverview orders={orders} products={products} language={language} />
        ) : activeTab === 'inventory' ? (
          // ... inventory content ...
          <div className="space-y-8">
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
                  <textarea 
                    placeholder="Description" 
                    className="md:col-span-2 bg-stone-50 p-3 rounded-xl font-sans text-sm resize-none"
                    rows={2}
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  />
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
                  <Card key={i} className="flex flex-col md:flex-row items-center gap-4 md:gap-6 py-6 md:py-4 animate-pulse">
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
                  <Card key={product.id} className="flex flex-col md:flex-row items-center gap-4 md:gap-6 py-6 md:py-4">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group">
                      <img src={product.image_url || null} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" loading="lazy" />
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
            <h2 className="text-3xl font-serif italic">Incoming Orders</h2>
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
                        <span className={cn(
                          "px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wider font-bold flex items-center gap-1",
                          order.payment_status === 'paid' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                          order.payment_status === 'partially_paid' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                          order.payment_status === 'failed' ? "bg-red-50 text-red-600 border border-red-100" :
                          "bg-stone-100 text-stone-400 border border-stone-200"
                        )}>
                          {order.payment_status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                          {order.payment_status === 'partially_paid' && <Wallet className="w-3 h-3" />}
                          {order.payment_status === 'failed' && <AlertCircle className="w-3 h-3" />}
                          {order.payment_status === 'pending' && <Clock className="w-3 h-3" />}
                          {order.payment_status}
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
                      <p className="text-xs font-sans text-stone-500">
                        {Array.isArray(order.items) ? order.items.map(i => `${i.name} (${i.quantity} x ${i.selectedWeight}kg)`).join(', ') : order.items}
                      </p>
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
                      <Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleString()}
                    </span>
                    <div className="flex gap-2">
                      {order.payment_status === 'partially_paid' && (
                        <Button 
                          onClick={() => onUpdateOrder(order.id, { payment_status: 'paid', paid_amount: order.total })}
                          variant="secondary" 
                          className="px-4 py-2 text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
                        >
                          Mark as Fully Paid
                        </Button>
                      )}
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
                        <Clock className="w-3 h-3" /> Booked on {new Date(booking.created_at).toLocaleString()}
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
        ) : (
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
                  <Card key={i} className="flex flex-col md:flex-row items-center gap-4 md:gap-6 py-6 md:py-4 animate-pulse">
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
                  <Card key={offer.id} className="flex flex-col md:flex-row items-center gap-4 md:gap-6 py-6 md:py-4">
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
                            className="w-full bg-transparent font-serif text-lg outline-none focus:ring-1 focus:ring-brand-olive/20 rounded px-1"
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
        )}
      </main>
    </div>
  );
};


const FarmBookingModal = ({ isOpen, onClose, onBook, t, language }: any) => {
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
            <Card className="w-full max-w-lg pointer-events-auto overflow-hidden rounded-[40px] md:rounded-[48px] border-none shadow-2xl">
              <div className="relative h-48 bg-brand-olive flex items-center justify-center overflow-hidden">
                <img 
                  src="https://images.pexels.com/photos/36135710/pexels-photo-36135710.jpeg" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
                  alt="Farm Visit"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-olive via-brand-olive/40 to-transparent" />
                <div className="absolute inset-0 opacity-20">
                  <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                </div>
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-mango/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                
                <div className="relative text-center">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif italic text-white">{language === 'en' ? 'Book Your Visit' : 'ನಿಮ್ಮ ಭೇಟಿಯನ್ನು ಕಾಯ್ದಿರಿಸಿ'}</h3>
                </div>
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors bg-white/10 rounded-full backdrop-blur-md">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6 md:space-y-8 bg-white">
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-sans font-bold ml-2">{t.selectDate}</label>
                    <input 
                      required
                      type="date" 
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-stone-50 border-2 border-stone-50 rounded-[20px] px-5 py-4 font-sans text-sm focus:border-brand-mango focus:ring-4 focus:ring-brand-mango/5 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-sans font-bold ml-2">{t.selectTime}</label>
                    <select 
                      required
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      className="w-full bg-stone-50 border-2 border-stone-50 rounded-[20px] px-5 py-4 font-sans text-sm focus:border-brand-mango focus:ring-4 focus:ring-brand-mango/5 outline-none transition-all appearance-none"
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
                  <label className="text-[10px] uppercase tracking-widest text-stone-400 font-sans font-bold ml-2">{t.fullName}</label>
                  <input 
                    required
                    type="text" 
                    placeholder={language === 'en' ? 'Enter your name' : 'ನಿಮ್ಮ ಹೆಸರು'}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-stone-50 border-2 border-stone-50 rounded-[20px] px-5 py-4 font-sans text-sm focus:border-brand-mango focus:ring-4 focus:ring-brand-mango/5 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-sans font-bold ml-2">{t.phoneNumber}</label>
                    <input 
                      required
                      type="tel" 
                      placeholder={language === 'en' ? 'Contact number' : 'ಫೋನ್ ಸಂಖ್ಯೆ'}
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-stone-50 border-2 border-stone-50 rounded-[20px] px-5 py-4 font-sans text-sm focus:border-brand-mango focus:ring-4 focus:ring-brand-mango/5 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-sans font-bold ml-2">{t.noOfGuests}</label>
                    <input 
                      required
                      type="number" 
                      min="1"
                      max="10"
                      value={guests}
                      onChange={e => setGuests(parseInt(e.target.value))}
                      className="w-full bg-stone-50 border-2 border-stone-50 rounded-[20px] px-5 py-4 font-sans text-sm focus:border-brand-mango focus:ring-4 focus:ring-brand-mango/5 outline-none transition-all"
                    />
                  </div>
                </div>

                <Button type="submit" variant="mango" className="w-full py-6 text-xs uppercase tracking-widest font-bold rounded-[20px] shadow-xl shadow-brand-mango/20">
                  {language === 'en' ? 'Confirm Booking' : 'ಬುಕಿಂಗ್ ದೃಢೀಕರಿಸಿ'}
                </Button>
                <p className="text-[9px] text-center text-stone-400 font-sans uppercase tracking-widest font-bold">
                  {language === 'en' ? '* Visits are free. Pay for what you pick.' : '* ಭೇಟಿ ಉಚಿತ. ನೀವು ಆರಿಸಿದ್ದಕ್ಕೆ ಮಾತ್ರ ಪಾವತಿಸಿ.'}
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

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): any {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if ((this as any).state.hasError) {
      let errorMessage = (this as any).state.error?.message || "Something went wrong.";
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
          <Card className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="text-red-500" />
            </div>
            <h2 className="text-2xl font-serif italic mb-4">Application Error</h2>
            <p className="text-stone-600 text-sm mb-8">{errorMessage}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Reload Application
            </Button>
          </Card>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const AIConcierge = ({ isOpen, onClose, language }: { isOpen: boolean, onClose: () => void, language: Language }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'art' | 'video'>('chat');
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string, groundingMetadata?: any }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const [imageToAnimate, setImageToAnimate] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [isKeySelected, setIsKeySelected] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setIsKeySelected(selected);
      }
    };
    checkKey();
  }, []);

  const handleOpenSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setIsKeySelected(true);
    }
  };

  const handleChat = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const isLocationQuery = /where|location|address|near|map|directions|ದಾರಿ|ಸ್ಥಳ|ವಿಳಾಸ/i.test(currentInput);
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, userMsg].map(m => ({ role: m.role, parts: [{ text: m.content }] })),
        config: {
          systemInstruction: language === 'en' 
            ? "You are the Namma Kolar Mango Concierge. Help users with mango varieties, recipes, farm visits, and Kolar heritage. Use Google Search and Maps for accurate info."
            : "ನೀವು ನಮ್ಮ ಕೋಲಾರ ಮಾವು ಕನ್ಸೈರ್ಜ್. ಮಾವಿನ ತಳಿಗಳು, ಪಾಕವಿಧಾನಗಳು, ಫಾರ್ಮ್ ಭೇಟಿಗಳು ಮತ್ತು ಕೋಲಾರ ಪರಂಪರೆಯ ಬಗ್ಗೆ ಬಳಕೆದಾರರಿಗೆ ಸಹಾಯ ಮಾಡಿ. ನಿಖರವಾದ ಮಾಹಿತಿಗಾಗಿ Google ಹುಡುಕಾಟ ಮತ್ತು ನಕ್ಷೆಗಳನ್ನು ಬಳಸಿ.",
          tools: isLocationQuery ? [{ googleMaps: {} }] : [{ googleSearch: {} }],
        },
      });

      const modelMsg = { 
        role: 'model' as const, 
        content: response.text || (language === 'en' ? "I'm sorry, I couldn't process that." : "ಕ್ಷಮಿಸಿ, ನನಗೆ ಅದನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ."),
        groundingMetadata: response.candidates?.[0]?.groundingMetadata
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      if (!isKeySelected) {
        await handleOpenSelectKey();
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: input }] },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: imageSize as any
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error("Image generation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setImageToEdit(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleApplyEdit = async () => {
    if (!imageToEdit || !input.trim()) return;
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = imageToEdit.split(',')[1];
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: "image/png" } },
            { text: input }
          ]
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error("Image edit error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnimateImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setImageToAnimate(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerateVideo = async () => {
    if (!imageToAnimate) return;
    setIsLoading(true);
    try {
      if (!isKeySelected) {
        await handleOpenSelectKey();
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = imageToAnimate.split(',')[1];
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: input || "Animate this mango scene beautifully",
        image: {
          imageBytes: base64Data,
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY! },
        });
        const blob = await response.blob();
        setGeneratedVideo(URL.createObjectURL(blob));
      }
    } catch (error) {
      console.error("Video generation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-12 bg-stone-900/40 backdrop-blur-xl">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white/90 backdrop-blur-2xl w-full max-w-6xl h-full md:h-[85vh] rounded-none md:rounded-[4rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.3)] flex flex-col border border-white/40"
      >
        <div className="p-8 md:p-12 border-b border-stone-100 flex justify-between items-center bg-white/50">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-brand-olive rounded-3xl flex items-center justify-center shadow-2xl shadow-brand-olive/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <Sparkles className="w-8 h-8 text-brand-mango animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-serif italic text-stone-800 leading-none mb-2">Mango AI Concierge</h2>
              <p className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-stone-400">Your Personal Harvest Guide</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-4 hover:bg-stone-100 rounded-full transition-all duration-300 hover:rotate-90"
          >
            <X className="w-8 h-8 text-stone-400" />
          </button>
        </div>

        <div className="flex border-b border-stone-100 bg-white/30 backdrop-blur-md">
          {[
            { id: 'chat', label: 'Chat', icon: MessageSquare },
            { id: 'art', label: 'Art', icon: Palette },
            { id: 'video', label: 'Video', icon: Video }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 py-8 flex items-center justify-center gap-3 text-[10px] font-display font-black uppercase tracking-[0.3em] transition-all duration-500 relative overflow-hidden group",
                activeTab === tab.id ? "text-brand-olive" : "text-stone-400 hover:text-stone-600"
              )}
            >
              <tab.icon className={cn("w-4 h-4 transition-transform duration-500", activeTab === tab.id ? "scale-110" : "group-hover:scale-110")} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="active-tab-line" 
                  className="absolute bottom-0 left-0 right-0 h-1 bg-brand-olive" 
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-16 space-y-10 custom-scrollbar">
          {activeTab === 'chat' && (
            <div className="space-y-8 max-w-3xl mx-auto">
              {messages.length === 0 && (
                <div className="text-center py-20 space-y-8">
                  <div className="w-24 h-24 bg-brand-cream rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Sparkles className="w-10 h-10 text-brand-mango" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-serif italic text-stone-800">How can I assist you today?</h3>
                    <p className="text-sm text-stone-400 font-serif italic">Ask about varieties, recipes, or farm visits.</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4">
                    {[
                      "Tell me about Alphonso",
                      "Best mango recipes",
                      "How to visit the farm?",
                      "Mango harvest season"
                    ].map(suggestion => (
                      <button 
                        key={suggestion}
                        onClick={() => { setInput(suggestion); handleChat(); }}
                        className="px-6 py-3 bg-white border border-stone-100 rounded-full text-[10px] font-display font-black uppercase tracking-widest text-stone-400 hover:border-brand-olive hover:text-brand-olive transition-all duration-300 shadow-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}
                >
                  <div className={cn(
                    "max-w-[85%] p-8 rounded-[2.5rem] shadow-2xl transition-all duration-500", 
                    m.role === 'user' 
                      ? "bg-brand-olive text-white rounded-tr-none shadow-brand-olive/20" 
                      : "bg-white text-stone-800 rounded-tl-none border border-stone-100 shadow-stone-200/50"
                  )}>
                    <div className={cn("prose prose-sm max-w-none font-serif italic text-lg leading-relaxed", m.role === 'user' ? "text-white prose-invert" : "text-stone-700")}>
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                    {m.groundingMetadata?.groundingChunks && (
                      <div className="mt-6 pt-6 border-t border-black/5 space-y-3">
                        <p className="text-[9px] font-display font-black uppercase tracking-[0.3em] opacity-40">Verified Sources</p>
                        <div className="flex flex-wrap gap-3">
                          {m.groundingMetadata.groundingChunks.map((chunk: any, ci: number) => (
                            <a 
                              key={ci} 
                              href={chunk.web?.uri || chunk.maps?.uri} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-50 rounded-full text-[10px] font-sans font-bold text-brand-olive hover:bg-brand-olive hover:text-white transition-all duration-300 border border-stone-100"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {chunk.web?.title || chunk.maps?.title || 'View Source'}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-stone-100 p-8 rounded-[2.5rem] rounded-tl-none shadow-xl flex items-center gap-4">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map(dot => (
                        <motion.div 
                          key={dot}
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 1, delay: dot * 0.2 }}
                          className="w-2 h-2 bg-brand-mango rounded-full"
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-display font-black uppercase tracking-[0.3em] text-stone-400">Concierge is thinking</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'art' && (
            <div className="space-y-12 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8 p-10 bg-stone-50 rounded-[3rem] border border-stone-100">
                  <div className="space-y-2">
                    <h4 className="text-2xl font-serif italic text-stone-800">Generate Art</h4>
                    <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">Create mango-inspired masterpieces</p>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-[9px] font-display font-black uppercase tracking-[0.2em] text-stone-400">Resolution</p>
                    <div className="flex gap-3">
                      {['1K', '2K', '4K'].map(size => (
                        <button 
                          key={size}
                          onClick={() => setImageSize(size as any)}
                          className={cn(
                            "flex-1 py-4 text-[10px] font-display font-black rounded-2xl border transition-all duration-500", 
                            imageSize === size 
                              ? "bg-brand-olive text-white border-brand-olive shadow-xl shadow-brand-olive/20" 
                              : "bg-white border-stone-200 text-stone-400 hover:border-brand-olive hover:text-brand-olive"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    variant="mango"
                    onClick={handleGenerateImage}
                    disabled={isLoading || !input}
                    className="w-full py-6 rounded-2xl shadow-xl shadow-brand-mango/20"
                  >
                    {isLoading ? "Creating..." : "Generate Masterpiece"}
                  </Button>
                </div>

                <div className="space-y-8 p-10 bg-brand-olive text-white rounded-[3rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                  <div className="space-y-2 relative z-10">
                    <h4 className="text-2xl font-serif italic">Edit Your Photo</h4>
                    <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-white/40">Enhance your harvest photos</p>
                  </div>
                  
                  <div className="relative z-10">
                    <input type="file" onChange={handleEditImage} className="hidden" id="edit-upload" />
                    <label htmlFor="edit-upload" className="block w-full py-12 border-2 border-dashed border-white/20 rounded-[2rem] text-center cursor-pointer hover:border-brand-mango hover:bg-white/5 transition-all duration-500 group">
                      {imageToEdit ? (
                        <div className="space-y-4">
                          <img src={imageToEdit} className="h-32 mx-auto rounded-xl shadow-2xl" alt="Preview" />
                          <p className="text-[10px] font-display font-black uppercase tracking-widest text-brand-mango">Change Photo</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-brand-mango group-hover:text-stone-900 transition-all duration-500">
                            <Upload className="w-8 h-8" />
                          </div>
                          <p className="text-[10px] font-display font-black uppercase tracking-widest">Upload Photo</p>
                        </div>
                      )}
                    </label>
                  </div>

                  <Button 
                    variant="mango"
                    onClick={handleApplyEdit}
                    disabled={isLoading || !input || !imageToEdit}
                    className="w-full py-6 rounded-2xl relative z-10"
                  >
                    {isLoading ? "Applying..." : "Apply AI Edit"}
                  </Button>
                </div>
              </div>

              {generatedImage && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-16 space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-2xl font-serif italic text-stone-800">Generated Result</h4>
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = generatedImage;
                        link.download = 'mango-ai-art.png';
                        link.click();
                      }}
                      className="flex items-center gap-2 text-[10px] font-display font-black uppercase tracking-widest text-stone-400 hover:text-brand-olive transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Art
                    </button>
                  </div>
                  <div className="relative aspect-square max-w-2xl mx-auto rounded-[4rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.2)] border-8 border-white group">
                    <img src={generatedImage} alt="Generated Art" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-12 max-w-3xl mx-auto text-center">
              <div className="space-y-4">
                <h3 className="text-4xl md:text-6xl font-serif italic text-stone-800">Bring Your Harvest <br /> <span className="text-brand-mango">To Life</span></h3>
                <p className="text-lg text-stone-400 font-serif italic">Upload a photo and let AI animate your mango moment.</p>
              </div>

              <div className="relative group">
                <input type="file" onChange={handleAnimateImage} className="hidden" id="video-upload" />
                <label htmlFor="video-upload" className="block w-full py-24 border-2 border-dashed border-stone-200 rounded-[4rem] cursor-pointer hover:border-brand-olive hover:bg-stone-50 transition-all duration-700 relative overflow-hidden">
                  {imageToAnimate ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative z-10"
                    >
                      <img src={imageToAnimate} className="max-h-80 mx-auto rounded-[2rem] shadow-2xl border-4 border-white" alt="To Animate" />
                      <div className="mt-8 flex items-center justify-center gap-3">
                        <div className="w-2 h-2 bg-brand-mango rounded-full animate-pulse" />
                        <p className="text-[10px] font-display font-black uppercase tracking-widest text-stone-400">Ready to animate</p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-6 relative z-10">
                      <div className="w-24 h-24 bg-stone-100 rounded-[2rem] flex items-center justify-center mx-auto group-hover:bg-brand-olive group-hover:text-white transition-all duration-500">
                        <Video className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-display font-black uppercase tracking-[0.4em] text-stone-400">Step 1: Upload Photo</p>
                        <p className="text-stone-300 font-serif italic">Click to browse your gallery</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-display font-black uppercase tracking-[0.4em] text-stone-400 text-left">Step 2: Describe the motion (Optional)</p>
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., Gentle breeze blowing through the leaves..."
                    className="w-full px-8 py-6 bg-stone-50 border border-stone-100 rounded-3xl font-serif italic text-lg focus:outline-none focus:ring-4 focus:ring-brand-olive/5 focus:border-brand-olive transition-all"
                  />
                </div>

                <Button 
                  variant="mango" 
                  onClick={handleGenerateVideo}
                  disabled={isLoading || !imageToAnimate}
                  className="w-full py-8 rounded-3xl shadow-2xl shadow-brand-mango/30 text-xs"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                      <span>Generating Your Video...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <Sparkles className="w-5 h-5" />
                      <span>Animate into Video</span>
                    </div>
                  )}
                </Button>
              </div>

              {generatedVideo && (
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-20 space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-2xl font-serif italic text-stone-800">Your Mango Moment</h4>
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = generatedVideo;
                        link.download = 'mango-moment.mp4';
                        link.click();
                      }}
                      className="flex items-center gap-2 text-[10px] font-display font-black uppercase tracking-widest text-stone-400 hover:text-brand-olive transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Save Video
                    </button>
                  </div>
                  <div className="relative rounded-[4rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.3)] border-8 border-white bg-stone-900">
                    <video src={generatedVideo} controls className="w-full aspect-video object-cover" />
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        <div className="p-8 md:p-12 border-t border-stone-100 bg-white/80 backdrop-blur-3xl">
          <div className="relative max-w-4xl mx-auto group">
            <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
              <Sparkles className="w-6 h-6 text-brand-mango animate-pulse" />
            </div>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (activeTab === 'chat' ? handleChat() : activeTab === 'art' ? handleGenerateImage() : null)}
              placeholder={activeTab === 'chat' ? (language === 'en' ? "Ask about varieties, recipes, or farm visits..." : "ತಳಿಗಳು, ಪಾಕವಿಧಾನಗಳು ಅಥವಾ ಫಾರ್ಮ್ ಭೇಟಿಗಳ ಬಗ್ಗೆ ಕೇಳಿ...") : (language === 'en' ? "Describe the art or edit you want..." : "ನೀವು ಬಯಸುವ ಕಲೆ ಅಥವಾ ಸಂಪಾದನೆಯನ್ನು ವಿವರಿಸಿ...")}
              className="w-full pl-20 pr-32 py-10 bg-stone-50 border-2 border-stone-100 rounded-[3rem] font-serif italic text-2xl focus:outline-none focus:ring-12 focus:ring-brand-mango/5 focus:border-brand-mango transition-all duration-700 group-focus-within:bg-white group-focus-within:shadow-[0_40px_100px_rgba(0,0,0,0.1)] shadow-inner"
            />
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => activeTab === 'chat' ? handleChat() : activeTab === 'art' ? handleGenerateImage() : null}
              disabled={isLoading || !input}
              className="absolute right-4 top-4 bottom-4 px-12 bg-brand-olive text-white rounded-[2.5rem] hover:bg-brand-olive/90 transition-all duration-500 disabled:opacity-50 shadow-2xl shadow-brand-olive/20 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-6 h-6" />
              )}
            </motion.button>
          </div>
          <p className="text-center mt-8 text-[9px] font-sans font-black uppercase tracking-[0.5em] text-stone-300">
            Powered by Gemini AI • Harvest Intelligence • Namma Kolar
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const AuthModal = ({ onClose, language, sellerPin, setSellerPin, handleSellerLogin, buyerEmail, setBuyerEmail, setView }: any) => {
  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-6"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none"
      >
        <Card className="w-full max-w-sm pointer-events-auto rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.2)] border-white/20">
          <div className="flex justify-between items-center mb-10">
            <div className="space-y-1">
              <h3 className="text-3xl font-serif italic text-stone-800">{language === 'en' ? 'Account' : 'ಖಾತೆ'}</h3>
              <p className="text-[9px] font-sans font-bold uppercase tracking-[0.3em] text-stone-400">Access your heritage harvest</p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-stone-100 rounded-full transition-all duration-300 hover:rotate-90">
              <X className="w-6 h-6 text-stone-400" />
            </button>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-3 h-3 text-brand-olive" />
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-sans font-black">{language === 'en' ? 'Seller Access' : 'ಮಾರಾಟಗಾರರ ಪ್ರವೇಶ'}</label>
              </div>
              <input 
                type="password" 
                maxLength={4}
                value={sellerPin}
                onChange={e => setSellerPin(e.target.value)}
                className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl px-6 py-5 font-sans text-center text-3xl tracking-[0.8em] focus:border-brand-mango focus:ring-8 focus:ring-brand-mango/5 outline-none transition-all"
                placeholder="••••"
              />
              <Button variant="primary" onClick={handleSellerLogin} className="w-full py-5 rounded-2xl shadow-xl shadow-brand-olive/10">{language === 'en' ? 'Login as Admin' : 'ನಿರ್ವಾಹಕರಾಗಿ ಲಾಗಿನ್'}</Button>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100"></div></div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-[9px] font-display font-black uppercase tracking-[0.4em] text-stone-300">OR</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBasket className="w-3 h-3 text-brand-mango" />
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-sans font-black">{language === 'en' ? 'Buyer Portal' : 'ಖರೀದಿದಾರರ ಪೋರ್ಟಲ್'}</label>
              </div>
              <input 
                type="text" 
                value={buyerEmail}
                onChange={e => setBuyerEmail(e.target.value)}
                className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl px-6 py-5 font-sans text-sm font-bold focus:border-brand-mango focus:ring-8 focus:ring-brand-mango/5 outline-none transition-all"
                placeholder={language === 'en' ? 'Email or Phone Number' : 'ಇಮೇಲ್ ಅಥವಾ ಫೋನ್ ಸಂಖ್ಯೆ'}
              />
              <Button 
                variant="secondary" 
                className="w-full py-5 rounded-2xl border-stone-200 text-stone-600 hover:bg-stone-50"
                onClick={() => {
                  setView('history');
                  onClose();
                }}
              >
                {language === 'en' ? 'Track My Orders' : 'ನನ್ನ ಆರ್ಡರ್ಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ'}
              </Button>
            </div>
          </div>
          
          <p className="text-center mt-10 text-[8px] font-sans font-bold uppercase tracking-[0.3em] text-stone-300">
            Secure Access • Namma Kolar Heritage
          </p>
        </Card>
      </motion.div>
    </>
  );
};

const HarvestCalendar = ({ language }: { language: Language }) => {
  const t = translations[language];
  const months = [
    { name: 'Mar', status: 'Flowering', color: 'bg-emerald-100 text-emerald-700', icon: <Leaf className="w-4 h-4" /> },
    { name: 'Apr', status: 'Fruit Set', color: 'bg-amber-100 text-amber-700', icon: <Sparkles className="w-4 h-4" /> },
    { name: 'May', status: 'Peak Harvest', color: 'bg-brand-mango/20 text-brand-mango-dark', icon: <Star className="w-4 h-4" />, active: true },
    { name: 'Jun', status: 'Late Harvest', color: 'bg-brand-mango/10 text-brand-mango-dark', icon: <Clock className="w-4 h-4" /> },
    { name: 'Jul', status: 'Post Harvest', color: 'bg-stone-100 text-stone-600', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-brand-olive block">
                {t.seasonalRhythm}
              </span>
              <h2 className="text-5xl md:text-6xl font-serif italic leading-tight">
                {t.theHarvest} <br />
                <span className="text-stone-300">{t.calendar}</span>
              </h2>
            </div>
            <p className="text-stone-500 font-sans leading-relaxed max-w-md">
              {t.harvestDescription}
            </p>
          </div>
          
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 gap-4">
              {months.map((m, idx) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className={cn(
                    "group flex items-center justify-between p-6 rounded-[24px] border transition-all duration-500",
                    m.active 
                      ? "bg-brand-mango/5 border-brand-mango/20 shadow-xl shadow-brand-mango/5 scale-105 z-10" 
                      : "bg-stone-50/50 border-stone-100 hover:bg-white hover:border-stone-200"
                  )}
                >
                  <div className="flex items-center gap-6">
                    <span className={cn(
                      "text-4xl font-serif italic transition-colors",
                      m.active ? "text-brand-mango-dark" : "text-stone-300 group-hover:text-stone-400"
                    )}>
                      {m.name}
                    </span>
                    <div className="h-8 w-px bg-stone-100" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">Status</p>
                      <div className="flex items-center gap-2">
                        <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1", m.color)}>
                          {m.icon}
                          {m.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  {m.active && (
                    <div className="flex items-center gap-2 text-brand-mango-dark animate-pulse">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-widest">Live Now</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-mango-dark" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SalesOverview = ({ orders, products, language }: { orders: Order[], products: Product[], language: Language }) => {
  const t = translations[language];
  const stats = useMemo(() => {
    const totalSales = orders.reduce((acc, o) => acc + o.total, 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    
    // Group orders by date for chart
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const chartData = last7Days.map(date => {
      const dayOrders = orders.filter(o => o.created_at.startsWith(date));
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        sales: dayOrders.reduce((acc, o) => acc + o.total, 0),
        count: dayOrders.length
      };
    });

    // Sales by variety
    const varietyData = products.map(p => {
      const productOrders = orders.filter(o => 
        Array.isArray(o.items) && o.items.some(item => item.id === p.id)
      );
      return {
        name: p.name,
        value: productOrders.reduce((acc, o) => acc + o.total, 0)
      };
    }).filter(v => v.value > 0);

    return { totalSales, totalOrders, pendingOrders, completedOrders, chartData, varietyData };
  }, [orders, products]);

  const COLORS = ['#5A5A40', '#FFB800', '#E4E3E0', '#141414', '#F27D26'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: t.totalRevenue, value: `₹${stats.totalSales}`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-emerald-600' },
          { label: t.totalOrders, value: stats.totalOrders, icon: <Package className="w-5 h-5" />, color: 'text-brand-olive' },
          { label: t.pending, value: stats.pendingOrders, icon: <Clock className="w-5 h-5" />, color: 'text-amber-600' },
          { label: t.completed, value: stats.completedOrders, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-blue-600' },
        ].map((stat, i) => (
          <Card key={i} className="p-6 flex items-center gap-4">
            <div className={cn("p-3 rounded-2xl bg-stone-50", stat.color)}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">{stat.label}</p>
              <p className="text-2xl font-serif italic">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-serif italic">{t.revenueTrend}</h3>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">{t.last7Days}</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F4" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#A8A29E', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#A8A29E', fontWeight: 600 }}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none', 
                    borderRadius: '16px', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#5A5A40" 
                  strokeWidth={3} 
                  dot={{ fill: '#5A5A40', strokeWidth: 2, r: 4, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-serif italic">{t.salesByVariety}</h3>
            <BarChart3 className="w-5 h-5 text-stone-300" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.varietyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.varietyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none', 
                    borderRadius: '16px', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {stats.varietyData.map((v, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-500">{v.name}</span>
                </div>
                <span className="text-xs font-serif italic">₹{v.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const MangoEtiquette = ({ language }: { language: Language }) => {
  const t = translations[language];
  const steps = [
    { title: t.ripening, desc: t.ripeningDesc, icon: <Sparkles className="w-6 h-6" /> },
    { title: t.cutting, desc: t.cuttingDesc, icon: <Palette className="w-6 h-6" /> },
    { title: t.storage, desc: t.storageDesc, icon: <ShieldCheck className="w-6 h-6" /> },
  ];

  return (
    <section id="etiquette" className="py-24 bg-stone-50/50">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center space-y-4 mb-20">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.4em] text-brand-olive block">
            {t.etiquetteSubtitle}
          </span>
          <h2 className="text-5xl md:text-7xl font-serif italic leading-tight">
            {t.etiquetteTitle}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="group space-y-6 text-center"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto warm-shadow group-hover:scale-110 transition-transform duration-500">
                <div className="text-brand-olive">
                  {step.icon}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-serif italic">{step.title}</h3>
                <p className="text-stone-500 font-sans text-sm leading-relaxed max-w-[250px] mx-auto">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [view, setView] = useState<'store' | 'checkout' | 'seller' | 'history' | 'cart'>('store');
  const [user, setUser] = useState<any | null>(null);

  const handleLogin = async () => {
    // Firebase auth removed
    showToast("Login feature currently unavailable");
  };

  const handleLogout = async () => {
    // Firebase auth removed
    setUser(null);
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedOffer, setAppliedOffer] = useState<Offer | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAIConciergeOpen, setIsAIConciergeOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const t = useMemo(() => translations[language], [language]);

  const [heroBg, setHeroBg] = useState('https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=2000');
  const [toast, setToast] = useState({ message: '', visible: false });
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<{ type: string, connected: boolean, details?: string } | null>(null);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };
  const [sellerPin, setSellerPin] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [isSellerAuthenticated, setIsSellerAuthenticated] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.variety.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch(`/api/testimonials?language=${language}`);
        const data = await res.json();
        setTestimonials(data);
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
      }
    };
    fetchTestimonials();
  }, [language]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch('/api/offers');
        const data = await res.json();
        setOffers(data);
      } catch (error) {
        console.error("Failed to fetch offers:", error);
      }
    };
    fetchOffers();
  }, []);

  useEffect(() => {
    fetchDbStatus();
  }, []);

  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/db-status');
      const data = await res.json();
      setDbStatus(data);
    } catch (e) {}
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  useEffect(() => {
    if (isSellerAuthenticated && view === 'seller') {
      const fetchOrders = async () => {
        try {
          const res = await fetch('/api/orders');
          const data = await res.json();
          setOrders(data);
        } catch (error) {
          console.error("Failed to fetch orders:", error);
        }
      };
      fetchOrders();
    }
  }, [isSellerAuthenticated, view]);

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
    setView('checkout');
  };

  const handleBookFarmVisit = async (bookingData: any) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      if (res.ok) {
        showToast(`Farm visit booked for ${bookingData.date} at ${bookingData.time}!`);
      }
    } catch (error) {
      console.error("Failed to book farm visit:", error);
      showToast("Failed to book farm visit. Please try again.");
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
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          selectedWeight: item.selectedWeight
        })),
        total,
        delivery_charge: deliveryCharge,
        promo_code: appliedOffer?.code || null,
        payment_id: formData.payment_id || null,
        payment_status: formData.payment_status,
        payment_method: formData.payment_method,
        paid_amount: formData.paid_amount || 0,
        status: 'pending',
        created_at: new Date().toISOString(),
        uid: 'guest'
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save order');
      }

      setCart([]);
      setAppliedOffer(null);
      setBuyerEmail(formData.email);
      setView('history');
    } catch (error) {
      console.error("Checkout error:", error);
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

  const handleSellerLogin = async () => {
    const res = await fetch('/api/seller/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: sellerPin })
    });
    if (res.ok) {
      setIsSellerAuthenticated(true);
      setIsAuthOpen(false);
      setView('seller');
    } else {
      alert('Invalid PIN');
    }
  };

  const handleUpdateProduct = async (id: string, data: Partial<Product>) => {
    try {
      const { id: _, ...updateData } = data as any;
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        showToast("Product updated successfully");
      }
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  const handleAddProduct = async (data: any) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        showToast("Product added successfully");
      }
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this variety?')) {
      try {
        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          showToast("Product deleted successfully");
        }
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  const handleUpdateOffer = async (id: string, data: Partial<Offer>) => {
    try {
      const { id: _, ...updateData } = data as any;
      const res = await fetch(`/api/offers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        showToast("Offer updated successfully");
      }
    } catch (error) {
      console.error("Failed to update offer:", error);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        const res = await fetch(`/api/offers/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          showToast("Offer deleted successfully");
        }
      } catch (error) {
        console.error("Failed to delete offer:", error);
      }
    }
  };

  const handleUpdateOrder = async (id: string, data: Partial<Order>) => {
    try {
      const { id: _, ...updateData } = data as any;
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        showToast("Order updated successfully");
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const handleAddOffer = async (data: any) => {
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        showToast("Offer added successfully");
      }
    } catch (error) {
      console.error("Failed to add offer:", error);
    }
  };

  const userObj = useMemo(() => {
    if (user) return { ...user, isSeller: isSellerAuthenticated };
    if (isSellerAuthenticated) return { displayName: 'Seller Admin', isSeller: true };
    return null;
  }, [user, isSellerAuthenticated]);

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
          <img src="https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover leaf-mask" referrerPolicy="no-referrer" loading="lazy" />
        </motion.div>
        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-serif italic text-brand-olive">Namma kolar mango</h2>
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
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-x-hidden bg-brand-cream">
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <Sidebar 
        view={view}
        setView={setView}
        t={t}
        language={language}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        user={userObj}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => {
          if (isSellerAuthenticated) setIsSellerAuthenticated(false);
          handleLogout();
          setView('store');
        }}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar 
          language={language}
          onLanguageChange={setLanguage}
          t={t}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
          onOpenCart={() => setView('cart')}
        />

        <PullToRefresh isRefreshing={isRefreshing} />
        
        <Toast 
          message={toast.message} 
          isVisible={toast.visible} 
          onHide={() => setToast(prev => ({ ...prev, visible: false }))} 
        />

        <AnimatePresence mode="wait">
          <motion.main 
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="flex-1 pb-32 md:pb-12"
          >
            {view === 'store' && (
              <Storefront 
                products={products} 
                filteredProducts={filteredProducts}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                offers={offers}
                testimonials={testimonials}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onOpenCart={() => setView('cart')}
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
                onRefresh={handleRefresh}
                showToast={showToast}
              />
            )}

            {view === 'cart' && (
              <CartPage 
                items={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveFromCart}
                onCheckout={() => setView('checkout')}
                onApplyPromo={handleApplyPromo}
                appliedOffer={appliedOffer}
                t={t}
                language={language}
                onBack={() => setView('store')}
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
                onUpdateProduct={handleUpdateProduct}
                onAddProduct={handleAddProduct}
                onDeleteProduct={handleDeleteProduct}
                onUpdateOffer={handleUpdateOffer}
                onDeleteOffer={handleDeleteOffer}
                onAddOffer={handleAddOffer}
                onUpdateOrder={handleUpdateOrder}
                onLogout={() => { setIsSellerAuthenticated(false); setView('store'); }}
                isLoading={isLoading}
                showToast={showToast}
                language={language}
              />
            )}
          </motion.main>
        </AnimatePresence>

        <MangoEtiquette language={language} />

        <Footer 
          t={t} 
          language={language} 
          onOpenHistory={() => {
            setView('store');
            setTimeout(() => document.getElementById('history')?.scrollIntoView({ behavior: 'smooth' }), 100);
          }} 
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      </div>

      <FarmBookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBook={handleBookFarmVisit}
        t={t}
        language={language}
      />

      <AnimatePresence>
        {isAuthOpen && (
          <AuthModal 
            onClose={() => setIsAuthOpen(false)}
            language={language}
            sellerPin={sellerPin}
            setSellerPin={setSellerPin}
            handleSellerLogin={handleSellerLogin}
            buyerEmail={buyerEmail}
            setBuyerEmail={setBuyerEmail}
            setView={setView}
          />
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md h-20 bg-white/95 backdrop-blur-3xl rounded-[40px] px-8 z-40 md:hidden flex justify-between items-center shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-white/50 ring-1 ring-black/5">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => { setView('store'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
          className={cn("flex flex-col items-center justify-center gap-1.5 transition-all relative", view === 'store' ? "text-brand-olive" : "text-stone-300")}
        >
          <div className={cn("p-2.5 rounded-2xl transition-all duration-300", view === 'store' ? "bg-brand-olive/10 scale-110" : "bg-transparent")}>
            <Package className="w-6 h-6" />
          </div>
          <span className={cn("text-[9px] font-sans uppercase tracking-[0.2em] font-black text-center transition-all", view === 'store' ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1")}>{t.home}</span>
          {view === 'store' && <motion.div layoutId="nav-dot" className="absolute -bottom-1 w-1 h-1 bg-brand-olive rounded-full" />}
        </motion.button>
        
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setView('cart')} 
          className={cn("relative flex flex-col items-center justify-center gap-1.5 transition-all", view === 'cart' ? "text-brand-olive" : "text-stone-300")}
        >
          <div className={cn("p-2.5 rounded-2xl transition-all duration-300", view === 'cart' ? "bg-brand-olive/10 scale-110" : "bg-transparent")}>
            <ShoppingBasket className="w-6 h-6" />
          </div>
          {cart.length > 0 && (
            <span className="absolute top-1 right-1 bg-brand-mango text-stone-900 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-sans font-black shadow-lg border-2 border-white ring-1 ring-brand-mango/20">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          )}
          <span className={cn("text-[9px] font-sans uppercase tracking-[0.2em] font-black text-center transition-all", view === 'cart' ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1")}>{t.basket}</span>
          {view === 'cart' && <motion.div layoutId="nav-dot" className="absolute -bottom-1 w-1 h-1 bg-brand-olive rounded-full" />}
        </motion.button>

        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setView('history')} 
          className={cn("flex flex-col items-center justify-center gap-1.5 transition-all relative", view === 'history' ? "text-brand-olive" : "text-stone-300")}
        >
          <div className={cn("p-2.5 rounded-2xl transition-all duration-300", view === 'history' ? "bg-brand-olive/10 scale-110" : "bg-transparent")}>
            <Clock className="w-6 h-6" />
          </div>
          <span className={cn("text-[9px] font-sans uppercase tracking-[0.2em] font-black text-center transition-all", view === 'history' ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1")}>{language === 'en' ? 'History' : 'ಇತಿಹಾಸ'}</span>
          {view === 'history' && <motion.div layoutId="nav-dot" className="absolute -bottom-1 w-1 h-1 bg-brand-olive rounded-full" />}
        </motion.button>

        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAuthOpen(true)} 
          className={cn("flex flex-col items-center justify-center gap-1.5 transition-all relative", isAuthOpen || view === 'seller' ? "text-brand-olive" : "text-stone-300")}
        >
          <div className={cn("p-2.5 rounded-2xl transition-all duration-300", isAuthOpen || view === 'seller' ? "bg-brand-olive/10 scale-110" : "bg-transparent")}>
            <User className="w-6 h-6" />
          </div>
          <span className={cn("text-[9px] font-sans uppercase tracking-[0.2em] font-black text-center transition-all", isAuthOpen || view === 'seller' ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1")}>{language === 'en' ? 'Account' : 'ಖಾತೆ'}</span>
          {(isAuthOpen || view === 'seller') && <motion.div layoutId="nav-dot" className="absolute -bottom-1 w-1 h-1 bg-brand-olive rounded-full" />}
        </motion.button>
      </div>

      <AIConcierge 
        isOpen={isAIConciergeOpen} 
        onClose={() => setIsAIConciergeOpen(false)} 
        language={language} 
      />

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAIConciergeOpen(true)}
        className="fixed bottom-24 md:bottom-6 right-6 z-50 w-14 h-14 bg-brand-olive text-white rounded-full shadow-2xl flex items-center justify-center border-2 border-brand-mango/30 backdrop-blur-md"
      >
        <Sparkles className="w-6 h-6 text-brand-mango" />
      </motion.button>

      {dbStatus && (
        <div 
          title={dbStatus.details}
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
  );
}
