import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SwiftTech } from '@/api/SwiftTechClient';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { formatKES } from '@/lib/currency';

export default function Cart() {
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart-items'],
    queryFn: () => SwiftTech.entities.CartItem.list(),
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => SwiftTech.entities.CartItem.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart-items'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => SwiftTech.entities.CartItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart-items'] }),
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product_price || 0) * (item.quantity || 1), 0);
  const tax = subtotal * 0.16; // Kenya VAT 16%
  const total = subtotal + tax;

  if (!isLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-white rounded-3xl border border-border shadow-sm max-w-md mx-4"
        >
          <div className="w-20 h-20 gradient-blue rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ShoppingCart className="w-9 h-9 text-white" />
          </div>
          <h2 className="font-heading text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Browse our catalog of electronics, machinery, and home appliances.
          </p>
          <Link to="/">
            <Button className="gradient-blue text-white rounded-xl px-8 h-11 font-heading font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Products
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-4 lg:p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8">
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground text-sm mt-1">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {cartItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl bg-secondary shrink-0 overflow-hidden border border-border">
                      {item.product_image && (
                        <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product_id}`} className="block">
                        <h3 className="font-heading text-sm font-semibold hover:text-primary transition-colors truncate">
                          {item.product_name}
                        </h3>
                      </Link>
                      <p className="font-heading text-base font-bold text-primary mt-1">
                        {formatKES(item.product_price || 0)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-xl text-muted-foreground hover:text-destructive hover:bg-red-50"
                        onClick={() => deleteMutation.mutate(item.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <div className="flex items-center border border-border rounded-xl overflow-hidden">
                        <button
                          className="px-2 py-1.5 hover:bg-secondary transition-colors"
                          onClick={() => updateMutation.mutate({ id: item.id, data: { quantity: Math.max(1, (item.quantity || 1) - 1) } })}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-sm w-8 text-center border-x border-border py-1">{item.quantity || 1}</span>
                        <button
                          className="px-2 py-1.5 hover:bg-secondary transition-colors"
                          onClick={() => updateMutation.mutate({ id: item.id, data: { quantity: (item.quantity || 1) + 1 } })}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-[86px] lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
            >
              <div className="gradient-blue p-5">
                <h3 className="font-heading text-base font-bold text-white">Order Summary</h3>
                <p className="font-mono text-xs text-blue-200 mt-0.5">Swift Technologies Ltd.</p>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatKES(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT (16%)</span>
                  <span className="font-medium">{formatKES(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-emerald-600 font-medium text-xs">Calculated at checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-heading font-bold">Total</span>
                  <span className="font-heading text-xl font-bold text-primary">{formatKES(total)}</span>
                </div>
              </div>
              <div className="px-5 pb-5">
                <Link to="/checkout">
                  <Button className="w-full gradient-blue text-white rounded-xl font-heading font-semibold h-12 shadow-md hover:shadow-lg hover:shadow-primary/25 transition-all">
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}