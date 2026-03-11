import { useState, useEffect, ChangeEvent, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from './translations';
import { GoogleGenAI } from "@google/genai";
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
  Star
} from 'lucide-react';
import { Product, CartItem, Order, Offer, Testimonial } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

declare const Razorpay: any;

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

// --- Components ---

const HelpChat = ({ t, language }: { t: any, language: Language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
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
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
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
            User asked: ${userMessage}` }] }
        ],
      });

      const aiText = response.text || (language === 'en' ? "I'm sorry, I couldn't process that." : "ಕ್ಷಮಿಸಿ, ನನಗೆ ಅದನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.");
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
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
                <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    msg.role === 'user' ? "bg-brand-olive/10" : "bg-brand-mango/20"
                  )}>
                    {msg.role === 'user' ? <User size={16} className="text-brand-olive" /> : <MessageCircle size={16} className="text-brand-mango" />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-[20px] shadow-sm text-sm leading-relaxed max-w-[80%]",
                    msg.role === 'user' 
                      ? "bg-brand-olive text-white rounded-tr-none" 
                      : "bg-white text-stone-700 rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>
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

const ProductCard = ({ product, onAddToCart, onBuyNow, t }: any) => {
  const [selectedWeight, setSelectedWeight] = useState(5);
  const weights = [5, 7.5, 10, 15];

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
          {product.stock < 10 && (
            <div className="absolute top-10 right-10">
              <span className="bg-red-500 text-white px-5 py-2 rounded-full text-[10px] font-sans font-bold uppercase tracking-[0.2em] shadow-lg animate-pulse">
                Limited
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

          <div className="mb-8 flex items-center gap-2 text-stone-400">
            <Clock className="w-3 h-3" />
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest">{t.deliveryTime}</span>
          </div>
          
          <div className="flex gap-4">
            <Button 
              variant="secondary"
              disabled={product.stock < selectedWeight}
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
              disabled={product.stock < selectedWeight}
              onClick={() => onBuyNow(product, selectedWeight)}
              className="flex-[2] py-5 group/btn overflow-hidden relative"
            >
              <span className="relative z-10">
                {product.stock < selectedWeight ? t.outOfStock : t.buyNow}
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

const Testimonials = ({ t, language }: any) => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: language === 'en' ? "Amrutesh oli" : "ಅಮೃತೇಶ್ ಓಲಿ",
      rating: 5,
      review: language === 'en' ? "The best Alphonso mangoes I've ever had. They arrived perfectly ripe and the sweetness is unmatched. Reminds me of my childhood summers in Kolar." : "ನಾನು ತಿಂದ ಅತ್ಯುತ್ತಮ ಆಲ್ಪಾನ್ಸೋ ಮಾವಿನ ಹಣ್ಣುಗಳು. ಅವು ಸರಿಯಾಗಿ ಹಣ್ಣಾಗಿದ್ದವು ಮತ್ತು ಸಿಹಿ ಅದ್ಭುತವಾಗಿದೆ. ಕೋಲಾರದಲ್ಲಿ ಕಳೆದ ನನ್ನ ಬಾಲ್ಯದ ದಿನಗಳನ್ನು ನೆನಪಿಸುತ್ತದೆ.",
      date: "May 2025"
    },
    {
      id: 2,
      name: language === 'en' ? "Priya Sharma" : "ಪ್ರಿಯಾ ಶರ್ಮಾ",
      rating: 5,
      review: language === 'en' ? "Ordered 10kg for a family gathering. Everyone was asking where I got them from. The packaging was very secure and eco-friendly." : "ಕುಟುಂಬದ ಸಮಾರಂಭಕ್ಕಾಗಿ 10 ಕೆಜಿ ಆರ್ಡರ್ ಮಾಡಿದ್ದೆ. ಎಲ್ಲರೂ ಇವುಗಳನ್ನು ಎಲ್ಲಿಂದ ತಂದೆ ಎಂದು ಕೇಳುತ್ತಿದ್ದರು. ಪ್ಯಾಕೇಜಿಂಗ್ ತುಂಬಾ ಸುರಕ್ಷಿತವಾಗಿತ್ತು.",
      date: "June 2025"
    },
    {
      id: 3,
      name: language === 'en' ? "Suresh Kumar" : "ಸುರೇಶ್ ಕುಮಾರ್",
      rating: 4,
      review: language === 'en' ? "Authentic taste. You can really tell the difference between these organic mangoes and the ones from the local market. Will definitely order again." : "ಅಪ್ಪಟ ರುಚಿ. ಈ ಸಾವಯವ ಮಾವಿನ ಹಣ್ಣುಗಳು ಮತ್ತು ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆಯ ಹಣ್ಣುಗಳ ನಡುವಿನ ವ್ಯತ್ಯಾಸವನ್ನು ನೀವು ಸುಲಭವಾಗಿ ಗುರುತಿಸಬಹುದು.",
      date: "May 2025"
    }
  ];

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

const Storefront = ({ products, offers, onAddToCart, onBuyNow, onOpenCart, cartCount, onOpenAuth, onOpenHistory, onOpenBooking, heroBg, onHeroBgChange, isLoading, t, language, onLanguageChange }: any) => {
  return (
    <div className="min-h-screen pb-0">
      {/* Hero Section */}
      <section className="relative h-[90vh] md:h-screen flex items-center justify-center overflow-hidden bg-brand-olive">
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

        {/* Header Controls */}
        <div className="absolute top-10 right-10 z-30 flex items-center gap-4">
          {/* Language Toggle */}
          <button 
            onClick={() => onLanguageChange(language === 'en' ? 'kn' : 'en')}
            className="flex items-center gap-2 bg-brand-mango/90 backdrop-blur-md border border-brand-mango/20 px-6 py-2 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest text-stone-900 hover:bg-brand-mango transition-all shadow-lg shadow-brand-mango/20"
          >
            {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
          </button>

          {/* Change Background Button */}
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
          <img src="https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-contain leaf-mask" referrerPolicy="no-referrer" />
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
            <h2 className="text-6xl md:text-9xl font-serif italic leading-[0.9] tracking-tighter">{language === 'en' ? 'The Varieties' : 'ಕೋಲಾರದ ವಿವಿಧ'} <br /> {language === 'en' ? 'of Kolar' : 'ತಳಿಗಳು'}</h2>
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
            products.filter((p: Product) => p.available).map((product: Product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onBuyNow={onBuyNow} t={t} />
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
                  src="https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=1200" 
                  className="rounded-[40px] warm-shadow w-full aspect-[4/3] object-cover"
                  alt="Our Farm in Srinivasapura"
                  referrerPolicy="no-referrer"
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

      <Testimonials t={t} language={language} />

      {/* Footer */}
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
                <li><button onClick={onOpenHistory} className="hover:text-white transition-colors">{t.trackOrder}</button></li>
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

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-8 left-6 right-6 h-20 glass-card rounded-[32px] px-8 z-40 md:hidden flex justify-around items-center shadow-2xl border border-white/40">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-center gap-1 text-brand-olive">
          <Package className="w-6 h-6" />
          <span className="text-[10px] font-sans uppercase tracking-widest font-bold">{t.home}</span>
        </button>
        <button onClick={onOpenCart} className="relative flex flex-col items-center gap-1 text-stone-400">
          <ShoppingBasket className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-brand-mango text-stone-900 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-sans font-bold shadow-lg">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] font-sans uppercase tracking-widest font-bold">{t.basket}</span>
        </button>
        <button onClick={onOpenHistory} className="flex flex-col items-center gap-1 text-stone-400">
          <Clock className="w-6 h-6" />
          <span className="text-[10px] font-sans uppercase tracking-widest font-bold">{language === 'en' ? 'History' : 'ಇತಿಹಾಸ'}</span>
        </button>
        <button onClick={onOpenAuth} className="flex flex-col items-center gap-1 text-stone-400">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-sans uppercase tracking-widest font-bold">{language === 'en' ? 'Account' : 'ಖಾತೆ'}</span>
        </button>
      </div>
    </div>
  );
};

const getDeliveryCharge = (weight: number) => {
  if (weight > 15) return 0;
  if (weight > 10) return 25;
  if (weight > 5) return 50;
  return 100;
};

const OrderHistory = ({ onBack, initialEmail, t, language }: any) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchHistory = async (searchEmail = email, searchPhone = phone) => {
    if (!searchEmail && !searchPhone) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/history?email=${encodeURIComponent(searchEmail)}&phone=${encodeURIComponent(searchPhone)}`);
      const data = await res.json();
      setOrders(data);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialEmail) {
      fetchHistory(initialEmail, '');
    }
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-6 py-12 md:py-32"
    >
      <button onClick={onBack} className="flex items-center gap-3 text-stone-400 mb-12 hover:text-brand-olive transition-all group">
        <div className="p-2 bg-white rounded-full warm-shadow group-hover:scale-110 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest">{t.backToStore}</span>
      </button>

      <h2 className="text-5xl md:text-7xl font-serif italic mb-12 leading-tight">{language === 'en' ? 'Order' : 'ಆರ್ಡರ್'} <br />{language === 'en' ? 'History' : 'ಇತಿಹಾಸ'}</h2>

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
                        {new Date(order.created_at).toLocaleDateString(language === 'en' ? 'en-IN' : 'kn-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
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
          amount,
          receipt: `order_rcptid_${Date.now()}`
        })
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create Razorpay order on server');
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

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay integration error:", error);
      setIsProcessing(false);
      
      // Fallback: Provide the payment link if server-side order creation fails or modal fails
      const confirmFallback = confirm("Direct payment integration is currently unavailable. Would you like to proceed with our secure Razorpay payment page instead?");
      if (confirmFallback) {
        window.open(paymentPageUrl, "_blank");
        onSubmit({
          ...formData,
          payment_status: 'pending_link',
          payment_method: paymentMethod,
          paid_amount: 0
        }, deliveryCharge);
      }
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

const SellerDashboard = ({ products, orders, offers, onUpdateProduct, onAddProduct, onDeleteProduct, onUpdateOffer, onDeleteOffer, onAddOffer, onUpdateOrder, onLogout, isLoading }: any) => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingOffer, setIsAddingOffer] = useState(false);
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
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-8 py-8 md:py-12">
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
                        <img src={newProduct.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
                      <img src={product.image_url} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
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
                      <Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleString()}
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedOffer, setAppliedOffer] = useState<Offer | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const t = useMemo(() => translations[language], [language]);

  const [heroBg, setHeroBg] = useState('https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=2000');
  const [toast, setToast] = useState({ message: '', visible: false });
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };
  const [sellerPin, setSellerPin] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [isSellerAuthenticated, setIsSellerAuthenticated] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchOffers();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/offers');
      const data = await res.json();
      setOffers(data);
    } catch (error) {
      console.error("Failed to fetch offers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(data);
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
    setView('checkout');
  };

  const handleBookFarmVisit = (bookingData: any) => {
    console.log('Farm Visit Booked:', bookingData);
    showToast(`Farm visit booked for ${bookingData.date} at ${bookingData.time}!`);
    // In a real app, we would send this to the backend
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

  const handleCheckout = (formData: any, deliveryCharge: number) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.selectedWeight * item.quantity, 0);
    const discount = appliedOffer ? (subtotal * appliedOffer.discount_percent) / 100 : 0;
    const total = subtotal - discount + deliveryCharge;

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: formData.name,
        customer_email: formData.email,
        address: formData.address,
        phone: formData.phone,
        items: cart,
        total,
        delivery_charge: deliveryCharge,
        promo_code: appliedOffer?.code,
        payment_id: formData.payment_id,
        payment_status: formData.payment_status,
        payment_method: formData.payment_method,
        paid_amount: formData.paid_amount
      })
    }).then(() => {
      let successMessage = 'Order placed successfully!';
      if (formData.payment_status === 'paid') {
        successMessage = `Full payment of ₹${total} received. Your order is confirmed!`;
      } else if (formData.payment_status === 'partially_paid') {
        successMessage = `Security deposit of ₹${formData.paid_amount} received. Please pay the balance of ₹${total - formData.paid_amount} on delivery.`;
      } else if (formData.payment_status === 'pending_link') {
        successMessage = 'Order received! Please ensure you have completed the payment on the Razorpay page. Our team will verify and confirm your order shortly.';
      }
      
      alert(successMessage);
      setCart([]);
      setAppliedOffer(null);
      setView('store');
      fetchProducts();
    });
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
      fetchOrders();
    } else {
      alert('Invalid PIN');
    }
  };

  const handleUpdateProduct = async (id: number, data: Product) => {
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    fetchProducts();
  };

  const handleAddProduct = async (data: any) => {
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    fetchProducts();
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Are you sure you want to delete this variety?')) {
      await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      fetchProducts();
    }
  };

  const handleUpdateOffer = async (id: number, data: Offer) => {
    await fetch(`/api/offers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    fetchOffers();
  };

  const handleDeleteOffer = async (id: number) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      await fetch(`/api/offers/${id}`, {
        method: 'DELETE'
      });
      fetchOffers();
    }
  };

  const handleUpdateOrder = async (id: number, data: Partial<Order>) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    fetchOrders();
  };

  const handleAddOffer = async (data: any) => {
    await fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    fetchOffers();
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
          <img src="https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-contain leaf-mask" referrerPolicy="no-referrer" />
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
    <div className="min-h-screen">
      <Toast 
        message={toast.message} 
        isVisible={toast.visible} 
        onHide={() => setToast(prev => ({ ...prev, visible: false }))} 
      />
      {view === 'store' && (
        <Storefront 
          products={products} 
          offers={offers}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenHistory={() => setView('history')}
          onOpenBooking={() => setIsBookingModalOpen(true)}
          heroBg={heroBg}
          onHeroBgChange={setHeroBg}
          isLoading={isLoading}
          t={t}
          language={language}
          onLanguageChange={setLanguage}
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
        />
      )}

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

      <HelpChat t={t} language={language} />
    </div>
  );
}
