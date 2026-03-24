import * as React from 'react';
import { useState, useEffect, ChangeEvent, useMemo, useRef, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  MessageSquare
} from 'lucide-react';
import { Product, CartItem, Order, Offer, Testimonial, ProductReview } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

declare const Razorpay: any;

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
    primary: 'bg-brand-olive text-white hover:bg-stone-700 shadow-lg shadow-brand-olive/20 hover:shadow-brand-olive/40 active:scale-95',
    secondary: 'bg-white border border-brand-olive text-brand-olive hover:bg-stone-50 active:scale-95',
    mango: 'bg-gradient-to-r from-brand-mango to-brand-mango-dark text-stone-900 hover:brightness-110 shadow-lg shadow-brand-mango/30 hover:shadow-brand-mango/50 active:scale-95',
    outline: 'bg-transparent border-2 border-brand-olive text-brand-olive hover:bg-brand-olive hover:text-white active:scale-95',
    white: 'bg-white text-brand-olive hover:bg-stone-50 shadow-xl active:scale-95',
    ghost: 'hover:bg-stone-100 text-stone-600 active:scale-95',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 active:scale-95'
  };
  
  const isPulsing = props.pulsing;
  
  return (
    <motion.button 
      whileTap={{ scale: 0.96 }}
      animate={isPulsing ? {
        boxShadow: ["0 0 0 0px rgba(242, 125, 38, 0.4)", "0 0 0 20px rgba(242, 125, 38, 0)", "0 0 0 0px rgba(242, 125, 38, 0)"]
      } : {}}
      transition={isPulsing ? {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut"
      } : {}}
      className={cn(
        'px-6 py-3 rounded-xl transition-all font-sans font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 text-center',
        variants[variant as keyof typeof variants],
        className
      )} 
      {...props} 
    />
  );
};

const Card = ({ children, className, glass = false }: any) => (
  <div className={cn(
    'rounded-3xl warm-shadow p-6 md:p-8 transition-all duration-500 border border-stone-100', 
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
    <aside className="hidden md:flex flex-col w-[var(--sidebar-width)] h-screen sticky top-0 bg-white border-r border-stone-100 z-50">
      <div className="p-8">
        <div 
          onClick={() => { setView('store'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-brand-mango rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
            <Leaf className="text-stone-900 w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif italic text-xl leading-none text-stone-900">Namma Kolar</h1>
            <p className="text-[8px] font-sans font-bold uppercase tracking-[0.3em] mt-1 text-stone-400">Mangoes</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          if (item.adminOnly && !user?.isSeller) return null;
          const isActive = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group relative",
                isActive 
                  ? "bg-brand-olive text-white shadow-lg shadow-brand-olive/20" 
                  : "text-stone-400 hover:bg-stone-50 hover:text-stone-600"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-stone-300")} />
              <span className="font-sans font-bold text-[11px] uppercase tracking-widest">{item.label}</span>
              {item.count > 0 && (
                <span className={cn(
                  "ml-auto text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold",
                  isActive ? "bg-white text-brand-olive" : "bg-brand-mango text-stone-900"
                )}>
                  {item.count}
                </span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-6 bg-brand-mango rounded-r-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-stone-50">
        {user ? (
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-stone-50">
            <img src={user.photoURL || ''} className="w-10 h-10 rounded-xl" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <p className="font-sans font-bold text-xs truncate">{user.displayName}</p>
              <button 
                onClick={onLogout}
                className="text-[10px] font-sans font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
              >
                {language === 'en' ? 'Logout' : 'ನಿರ್ಗಮಿಸಿ'}
              </button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" className="w-full" onClick={onOpenAuth}>
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
    <header className="h-[var(--topbar-height)] bg-white/80 backdrop-blur-xl border-b border-stone-100 sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 group-focus-within:text-brand-olive transition-colors" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'en' ? "Search varieties, harvest..." : "ಹುಡುಕಿ..."}
            className="w-full bg-stone-50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm font-sans focus:ring-2 focus:ring-brand-olive/10 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 ml-8">
        <button 
          onClick={() => onLanguageChange(language === 'en' ? 'kn' : 'en')}
          className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400 hover:text-brand-olive transition-colors"
        >
          {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
        </button>

        <div className="h-6 w-px bg-stone-100" />

        <button className="relative p-2 text-stone-400 hover:text-brand-olive transition-colors group">
          <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-mango rounded-full border-2 border-white" />
        </button>

        <button 
          onClick={onOpenCart}
          className="md:hidden relative p-2 text-stone-400 hover:text-brand-olive transition-colors"
        >
          <ShoppingBasket className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-mango text-stone-900 text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </button>
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9] }}
      className="group relative h-full"
    >
      <Card className="h-full p-0 overflow-hidden bg-white border border-stone-100/50 hover:shadow-2xl transition-all duration-500 rounded-[40px] flex flex-col md:flex-row">
        {/* Image Container */}
        <div className="md:w-2/5 aspect-square md:aspect-auto overflow-hidden relative p-4 md:p-6 bg-stone-50/50">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-full h-full rounded-[24px] md:rounded-[32px] overflow-hidden bg-white shadow-inner"
          >
            {!imageLoaded && (
              <div className="absolute inset-0 bg-stone-100 animate-pulse flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-mango/20 border-t-brand-mango rounded-full animate-spin" />
              </div>
            )}
            <motion.img 
              initial={{ opacity: 0 }}
              animate={{ opacity: imageLoaded ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              onLoad={() => setImageLoaded(true)}
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </motion.div>
          
          {/* Badges */}
          <div className="absolute top-8 left-8 flex flex-col gap-2">
            <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-brand-olive shadow-sm border border-white/50">
              {product.variety}
            </span>
          </div>

          {product.available === 1 && (
            <div className="absolute top-8 right-8">
              <div className="bg-brand-mango text-stone-900 p-2 rounded-full shadow-lg animate-pulse">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="p-6 md:p-10 flex flex-col flex-1 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-2xl md:text-3xl font-serif italic leading-tight">{product.name}</h3>
              <div className="flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-lg">
                <Star className="w-3 h-3 fill-brand-mango text-brand-mango" />
                <span className="text-[10px] font-sans font-bold text-stone-600">{averageRating || '5.0'}</span>
              </div>
            </div>
            <p className="text-stone-400 text-[11px] font-sans leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Weight Selection */}
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-stone-400">{t.selectWeight}</span>
              <span className="text-xl md:text-2xl font-serif italic text-brand-olive">₹{product.price * selectedWeight}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {weights.map(w => (
                <button
                  key={w}
                  onClick={() => setSelectedWeight(w)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-sans font-bold transition-all border",
                    selectedWeight === w 
                      ? "bg-brand-olive text-white border-brand-olive shadow-md scale-105" 
                      : "bg-white text-stone-400 border-stone-100 hover:border-brand-olive/20"
                  )}
                >
                  {w}kg
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-stone-100">
            <Button 
              variant="outline" 
              className="flex-1 py-4 rounded-2xl text-[10px] uppercase tracking-widest font-bold border-stone-200 hover:bg-stone-50"
              onClick={() => onAddToCart(product, selectedWeight)}
            >
              {t.addToCart}
            </Button>
            <Button 
              variant="mango" 
              className="flex-1 py-4 rounded-2xl text-[10px] uppercase tracking-widest font-bold"
              onClick={() => onBuyNow(product, selectedWeight)}
            >
              {t.buyNow}
            </Button>
          </div>

          {/* Reviews Toggle */}
          <div className="flex justify-center">
            <button 
              onClick={() => setShowReviews(!showReviews)}
              className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400 hover:text-brand-olive transition-colors flex items-center gap-2"
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
    <div className="relative min-h-screen bg-stone-50/30">
      {/* Hero Section - More compact for web app feel */}
      <section id="home" className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden bg-brand-olive rounded-b-[60px] md:rounded-b-[100px] shadow-2xl">
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

        <div className="absolute inset-0 bg-gradient-to-b from-brand-olive/40 via-transparent to-brand-olive/60 z-[1]" />
        
        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full mb-8"
          >
            <div className="w-2 h-2 bg-brand-mango rounded-full animate-pulse" />
            <span className="text-white text-[10px] font-sans font-bold uppercase tracking-[0.3em]">
              {t.harvestAvailable}
            </span>
          </motion.div>

          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 1.2 }}
            className="text-6xl md:text-[8rem] text-white font-serif mb-8 italic leading-[0.8] tracking-tighter"
          >
            {language === 'en' ? (
              <>Namma <span className="text-brand-mango">Kolar</span> <br /> Mangoes</>
            ) : (
              <>ನಮ್ಮ <span className="text-brand-mango">ಕೋಲಾರ</span> <br /> ಮಾವು</>
            )}
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-base md:text-xl text-white/80 font-serif italic max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            {t.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8"
          >
            <Button 
              variant="mango" 
              className="w-full sm:w-auto px-12 py-6 text-xs rounded-2xl shadow-2xl shadow-brand-mango/40 font-bold uppercase tracking-[0.2em]"
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.exploreHarvest}
              <ChevronRight className="w-5 h-5 ml-3" />
            </Button>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20">
        {/* Featured Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {featuredProducts.map((product: any, idx: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/80 backdrop-blur-xl p-8 rounded-[40px] border border-white/50 shadow-xl flex items-center gap-6 group cursor-pointer hover:bg-white transition-all"
              onClick={() => document.getElementById(`product-${product.id}`)?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0">
                <img src={product.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
              </div>
              <div>
                <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-mango mb-1">Featured</p>
                <h4 className="text-xl font-serif italic text-stone-800">{product.name}</h4>
                <p className="text-xs text-stone-400 font-sans">₹{product.price}/kg</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden lg:block w-64 flex-shrink-0 space-y-12">
            <div className="space-y-6">
              <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-stone-400">Categories</h3>
              <div className="flex flex-col gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-sans font-bold uppercase tracking-widest transition-all text-left",
                      selectedCategory === cat 
                        ? "bg-brand-olive text-white shadow-lg shadow-brand-olive/20" 
                        : "bg-white text-stone-500 hover:bg-stone-100 border border-stone-100"
                    )}
                  >
                    {cat}
                    {selectedCategory === cat && <ChevronRight className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8 bg-brand-mango/10 rounded-[40px] border border-brand-mango/20 space-y-6">
              <div className="w-12 h-12 bg-brand-mango rounded-2xl flex items-center justify-center text-stone-900">
                <Leaf className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-serif italic text-stone-800">100% Organic</h4>
              <p className="text-xs text-stone-500 leading-relaxed font-sans">
                All our mangoes are grown using traditional organic methods in Kolar.
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

            <div id="products" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 md:gap-12">
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

      {/* Product Grid */}
      <section id="products" className="max-w-7xl mx-auto px-6 py-24 md:py-48">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-20 md:mb-40 gap-12 md:gap-16">
          <div className="max-w-2xl text-left">
            <span className="text-brand-olive font-sans text-[10px] font-bold uppercase tracking-[0.4em] mb-6 block">
              {t.theCollection}
            </span>
            <h2 className="text-6xl md:text-9xl font-serif italic leading-[0.85] tracking-tighter">
              {language === 'en' ? 'The Varieties' : 'ಕೋಲಾರದ ವಿವಿಧ'} <br /> 
              {language === 'en' ? 'of Kolar' : 'ತಳಿಗಳು'}
            </h2>
            <p className="mt-8 text-stone-400 font-sans text-[10px] uppercase tracking-[0.3em] font-bold">
              {language === 'en' ? 'All Varieties on Single Screen' : 'ಎಲ್ಲಾ ತಳಿಗಳು ಒಂದೇ ಪರದೆಯಲ್ಲಿ'}
            </p>
            
            {/* Search Bar */}
            <div className="mt-12 relative max-w-md group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-stone-400 group-focus-within:text-brand-mango transition-colors" />
              </div>
              <input
                type="text"
                placeholder={t.searchVariety}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-50/50 border-2 border-stone-50 rounded-full pl-14 pr-8 py-5 font-sans text-sm focus:border-brand-mango focus:bg-white focus:ring-4 focus:ring-brand-mango/5 outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)
          ) : (
            finalFilteredProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onBuyNow={onBuyNow} t={t} buyerEmail={buyerEmail} showToast={showToast} />
            ))
          )}
        </div>
        
        {!isLoading && finalFilteredProducts.length === 0 && (
          <div className="text-center py-32">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-stone-300" />
            </div>
            <p className="text-stone-500 font-serif italic text-xl">{t.noProductsFound}</p>
          </div>
        )}
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("max-w-4xl mx-auto", !isSection && "px-6 py-8 md:px-6 md:py-32")}
    >
      {!isSection && (
        <button onClick={onBack} className="flex items-center gap-3 text-stone-400 mb-8 md:mb-12 hover:text-brand-olive transition-all group">
          <div className="p-2 bg-white rounded-full shadow-sm border border-stone-100 group-hover:scale-110 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest">{t.backToStore}</span>
        </button>
      )}

      <div className="mb-8 md:mb-12">
        <span className="text-brand-olive font-sans text-[10px] font-bold uppercase tracking-[0.4em] mb-3 md:mb-4 block">{language === 'en' ? 'Track Your' : 'ನಿಮ್ಮ ಆರ್ಡರ್'}</span>
        <h2 className="text-4xl md:text-7xl font-serif italic leading-tight">{language === 'en' ? 'Order' : 'ಆರ್ಡರ್'} <br />{language === 'en' ? 'History' : 'ಇತಿಹಾಸ'}</h2>
      </div>

      <Card className="mb-12 md:mb-16 p-6 md:p-10 bg-white/80 backdrop-blur-sm border-stone-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-sans font-bold">{t.emailAddress}</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-stone-50/50 border-2 border-stone-50 rounded-[20px] px-6 py-4 font-sans text-sm focus:border-brand-mango focus:ring-4 focus:ring-brand-mango/5 outline-none transition-all"
              placeholder="your@email.com"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-sans font-bold">{t.phoneNumber}</label>
            <input 
              type="tel" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-stone-50/50 border-2 border-stone-50 rounded-[20px] px-6 py-4 font-sans text-sm focus:border-brand-mango focus:ring-4 focus:ring-brand-mango/5 outline-none transition-all"
              placeholder="+91 97430 25459 / 91645 02728"
            />
          </div>
        </div>
        <Button variant="mango" onClick={() => fetchHistory()} disabled={loading || (!email && !phone)} className="w-full py-5 rounded-[20px]">
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
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-4 bg-white rounded-2xl shadow-sm border border-stone-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <div className="text-center flex-1">
            <h2 className="text-4xl font-serif italic">{t.yourBasket}</h2>
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
                  className="flex gap-6 md:gap-8 group"
                >
                  <div className="relative flex-shrink-0">
                    <img 
                      src={item.image_url} 
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

const SellerDashboard = ({ products, orders, offers, onUpdateProduct, onAddProduct, onDeleteProduct, onUpdateOffer, onDeleteOffer, onAddOffer, onUpdateOrder, onLogout, isLoading, showToast }: any) => {
  const [activeTab, setActiveTab] = useState('inventory');
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
            {['inventory', 'orders', 'offers', 'bookings'].map((tab) => (
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
        {activeTab === 'inventory' ? (
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
              <div className="relative h-40 bg-brand-olive flex items-center justify-center overflow-hidden">
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
          <img src="https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-contain leaf-mask" referrerPolicy="no-referrer" loading="lazy" />
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
              />
            )}
          </motion.main>
        </AnimatePresence>

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
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none"
            >
              <Card className="w-full max-w-sm pointer-events-auto">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-serif italic">{language === 'en' ? 'Login' : 'ಲಾಗಿನ್'}</h3>
                  <button onClick={() => setIsAuthOpen(false)} className="p-2 hover:bg-stone-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-6">
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
                    <Button onClick={handleSellerLogin} className="w-full mt-2">{language === 'en' ? 'Seller Access' : 'ಮಾರಾಟಗಾರರ ಪ್ರವೇಶ'}</Button>
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
