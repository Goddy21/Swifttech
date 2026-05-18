import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Plus, LayoutGrid, Package, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { SwiftTech } from '@/api/SwiftTechClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart-items'],
    queryFn: () => SwiftTech.entities.CartItem.list(),
    initialData: [],
  });

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const navLinks = [
    { path: '/', label: 'Products', icon: LayoutGrid },
    { path: '/admin', label: 'Add Product', icon: Plus },
    { path: '/orders', label: 'Orders', icon: Package },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-[2px] left-0 right-0 z-40 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(33,83,200,0.12)] border-b border-blue-100'
        : 'bg-white border-b border-border'
    }`}>
      <div className="max-w-[1800px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 gradient-blue rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
              <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="hidden sm:block">
              <span className="font-heading text-lg font-bold text-foreground tracking-tight">
                Swift<span className="text-gradient-blue">Tech</span>
              </span>
              <p className="font-mono text-[9px] text-muted-foreground tracking-[0.15em] uppercase -mt-0.5">
                Technologies Ltd.
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`font-body text-sm font-medium rounded-lg px-4 transition-all ${
                    isActive(path)
                      ? 'bg-primary/10 text-primary hover:bg-primary/15'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Cart & Mobile */}
          <div className="flex items-center gap-2">
            <Link to="/cart">
              <Button
                variant="ghost"
                size="sm"
                className="relative rounded-lg hover:bg-primary/10 hover:text-primary"
              >
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.div
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1"
                    >
                      <Badge className="h-5 w-5 p-0 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full">
                        {cartCount}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border overflow-hidden pb-3 pt-2"
            >
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link key={path} to={path} onClick={() => setMobileOpen(false)}>
                  <div className={`flex items-center gap-3 px-3 py-3 rounded-lg mx-1 my-0.5 font-body text-sm font-medium transition-colors ${
                    isActive(path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}>
                    <Icon className="w-4 h-4" />
                    {label}
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}