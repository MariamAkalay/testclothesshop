'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Product } from '@/lib/airtable';

interface CartItem {
  product: Product;
  quantity: number;
}

interface ClientInfo {
  nomComplet: string;
  localisation: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['12deg', '-12deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-12deg', '12deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="relative w-full max-w-sm mx-auto perspective-1000"
    >
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{ transform: 'translateZ(40px)' }}
      >
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
          <div className="relative h-80 w-full overflow-hidden">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.nom}
                fill
                className="object-cover transition-transform duration-500 hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center">
                <span className="text-stone-400">No Image</span>
              </div>
            )}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-stone-900/60 backdrop-blur-md text-stone-200 border border-stone-700/50">
              {product.categorie}
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-semibold text-stone-100 mb-2 truncate">
              {product.nom}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-amber-400">
                {product.prix}DH
              </span>
              <motion.button
                onClick={() => onAddToCart(product)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-sm font-medium shadow-lg hover:shadow-xl transition-shadow"
              >
                Ajouter au panier
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface CartProps {
  cart: CartItem[];
  onRemoveItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  isOpen: boolean;
  onClose: () => void;
  clientInfo: ClientInfo;
  onUpdateClientInfo: (info: Partial<ClientInfo>) => void;
}

function Cart({ cart, onRemoveItem, onUpdateQuantity, isOpen, onClose, clientInfo, onUpdateClientInfo }: CartProps) {
  const total = cart.reduce((sum, item) => sum + item.product.prix * item.quantity, 0);

  const handleWhatsAppCheckout = () => {
    const message = cart.map(item => 
      `- ${item.quantity}x ${item.product.nom} (${item.product.prix} DH)`
    ).join('%0A');
    
    const fullMessage = `Bonjour, je souhaite commander :%0A${message}%0ATotal : ${total} DH%0A%0AMon nom complet : ${clientInfo.nomComplet}%0AMa localisation : ${clientInfo.localisation}`;
    const whatsappUrl = `https://wa.me/212696044246?text=${fullMessage}`;
    window.open(whatsappUrl, '_blank');
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-stone-700 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-stone-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-stone-100">Panier</h2>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-stone-800 text-stone-300 flex items-center justify-center"
              >
                ✕
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-stone-400 text-lg">Votre panier est vide</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex items-center gap-4 p-4 bg-stone-800/50 rounded-xl border border-stone-700"
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.nom}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-stone-700 flex items-center justify-center">
                            <span className="text-stone-400 text-xs">No img</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-stone-100 font-medium truncate">{item.product.nom}</h3>
                        <p className="text-amber-400 font-bold">{item.product.prix}DH</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 rounded-lg bg-stone-700 text-stone-300 flex items-center justify-center"
                        >
                          -
                        </motion.button>
                        <span className="text-stone-100 w-8 text-center">{item.quantity}</span>
                        <motion.button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 rounded-lg bg-stone-700 text-stone-300 flex items-center justify-center"
                        >
                          +
                        </motion.button>
                      </div>
                      <motion.button
                        onClick={() => onRemoveItem(item.product.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center"
                      >
                        🗑
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-stone-700 space-y-4">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nom complet"
                    value={clientInfo.nomComplet}
                    onChange={(e) => onUpdateClientInfo({ nomComplet: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-stone-800 border border-stone-600 text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Localisation (ville, quartier)"
                    value={clientInfo.localisation}
                    onChange={(e) => onUpdateClientInfo({ localisation: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-stone-800 border border-stone-600 text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-300 text-lg">Total</span>
                  <span className="text-2xl font-bold text-amber-400">{total}DH</span>
                </div>
                <motion.button
                  onClick={handleWhatsAppCheckout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl bg-green-500 text-white font-bold text-lg shadow-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!clientInfo.nomComplet || !clientInfo.localisation}
                >
                  Confirmer la commande sur WhatsApp
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-12">
      <motion.button
        onClick={() => onSelectCategory('all')}
        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          selectedCategory === 'all'
            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25 border-amber-400'
            : 'bg-transparent text-stone-300 border border-stone-600 hover:border-stone-400 hover:text-stone-100'
        } border`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Toutes
      </motion.button>
      {categories.map((category) => (
        <motion.button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            selectedCategory === category
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25 border-amber-400'
              : 'bg-transparent text-stone-300 border border-stone-600 hover:border-stone-400 hover:text-stone-100'
          } border`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {category}
        </motion.button>
      ))}
    </div>
  );
}

interface ShopContentProps {
  products: Product[];
}

export default function ShopContent({ products }: ShopContentProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [clientInfo, setClientInfo] = useState<ClientInfo>({ nomComplet: '', localisation: '' });

  // Dynamically extract unique categories from products
  const categories = [...new Set(products.map(p => p.categorie).filter(Boolean))].sort();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from localStorage');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const updateClientInfo = (info: Partial<ClientInfo>) => {
    setClientInfo(prev => ({ ...prev, ...info }));
  };

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.categorie === selectedCategory);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Cart Button */}
      <motion.button
        onClick={() => setIsCartOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-30 px-6 py-3 rounded-full bg-amber-500 text-white font-bold shadow-lg flex items-center gap-2"
      >
        <span>🛒</span>
        <span>Panier</span>
        {cartCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-white text-amber-500 text-sm">
            {cartCount}
          </span>
        )}
      </motion.button>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/90" />

        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 mb-6"
          >
            Luxe Clothing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="text-xl text-stone-300 max-w-2xl mx-auto mb-8"
          >
            Discover our exclusive collection of premium fashion pieces
          </motion.p>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <ProductCard product={product} onAddToCart={addToCart} />
            </motion.div>
          ))}
        </motion.div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-stone-400">Aucun produit trouvé dans cette catégorie</p>
          </div>
        )}
      </div>

      <Cart
        cart={cart}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        clientInfo={clientInfo}
        onUpdateClientInfo={updateClientInfo}
      />

      <footer className="relative z-10 border-t border-stone-800 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-stone-400">
          <p>&copy; 2024 Luxe Clothing. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
