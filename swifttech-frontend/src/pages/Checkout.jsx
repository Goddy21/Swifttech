import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SwiftTech } from '@/api/SwiftTechClient';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle2, Loader2, MapPin, Mail, User, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatKES } from '@/lib/currency';

export default function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [shipping, setShipping] = useState({
    name: '', email: '', phone: '', address: '', city: '', zip: '', country: 'Kenya', notes: '',
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart-items'],
    queryFn: () => SwiftTech.entities.CartItem.list(),
    initialData: [],
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product_price || 0) * (item.quantity || 1), 0);
  const tax = subtotal * 0.16;
  const shippingCost = subtotal > 50000 ? 0 : 500;
  const total = subtotal + tax + shippingCost;

  const orderMutation = useMutation({
    mutationFn: async () => {
      const order = await SwiftTech.entities.Order.create({
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity || 1,
          price: item.product_price || 0,
        })),
        total,
        shipping_name: shipping.name,
        shipping_email: shipping.email,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_zip: shipping.zip,
        shipping_country: shipping.country,
        notes: shipping.notes,
        status: 'pending',
      });
      for (const item of cartItems) {
        await SwiftTech.entities.CartItem.delete(item.id);
      }
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
      toast({ title: '✓ Order Placed!', description: 'We will contact you shortly to confirm your order.' });
      navigate('/orders');
    },
  });

  const updateField = (field, value) => setShipping((prev) => ({ ...prev, [field]: value }));

  const fieldClass = "rounded-xl h-11 border-border focus-visible:ring-primary/30 bg-white";

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-4 lg:p-8">
      <div className="max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground text-sm mt-1">Swift Technologies Ltd. — Nairobi, Kenya</p>
        </motion.div>

        <form onSubmit={(e) => { e.preventDefault(); orderMutation.mutate(); }} className="grid lg:grid-cols-5 gap-6">
          {/* Shipping Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 space-y-5"
          >
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 gradient-blue rounded-xl flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-heading text-base font-semibold">Contact Information</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Full Name *</Label>
                  <Input required value={shipping.name} onChange={(e) => updateField('name', e.target.value)} className={fieldClass} placeholder="John Kamau" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Email Address *</Label>
                  <Input required type="email" value={shipping.email} onChange={(e) => updateField('email', e.target.value)} className={fieldClass} placeholder="john@example.co.ke" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 gradient-blue rounded-xl flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-heading text-base font-semibold">Delivery Address</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Street Address *</Label>
                  <Input required value={shipping.address} onChange={(e) => updateField('address', e.target.value)} className={fieldClass} placeholder="e.g. Moi Avenue, Building Name, Floor" />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">City *</Label>
                    <Input required value={shipping.city} onChange={(e) => updateField('city', e.target.value)} className={fieldClass} placeholder="Nairobi" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Postal Code</Label>
                    <Input value={shipping.zip} onChange={(e) => updateField('zip', e.target.value)} className={fieldClass} placeholder="00100" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Country</Label>
                    <Input value={shipping.country} onChange={(e) => updateField('country', e.target.value)} className={fieldClass} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Order Notes</Label>
                  <Textarea
                    value={shipping.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    className="rounded-xl border-border focus-visible:ring-primary/30 bg-white min-h-[80px]"
                    placeholder="Special instructions, landmarks, etc."
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={orderMutation.isPending || cartItems.length === 0}
              className="w-full gradient-blue text-white rounded-xl font-heading font-bold h-13 text-base shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all py-3.5"
            >
              {orderMutation.isPending ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing Order...</>
              ) : (
                <><CheckCircle2 className="w-5 h-5 mr-2" />Confirm Order — {formatKES(total)}</>
              )}
            </Button>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 lg:sticky lg:top-[86px] lg:self-start"
          >
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="gradient-blue p-5">
                <h3 className="font-heading text-base font-bold text-white">Order Summary</h3>
                <p className="font-mono text-xs text-blue-200 mt-0.5">{cartItems.length} items</p>
              </div>
              <div className="divide-y divide-border max-h-72 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary shrink-0 overflow-hidden">
                      {item.product_image && <img src={item.product_image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.product_name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{item.quantity || 1}×</p>
                    </div>
                    <span className="font-mono text-xs font-semibold text-primary whitespace-nowrap">
                      {formatKES((item.product_price || 0) * (item.quantity || 1))}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-5 border-t border-border space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatKES(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT (16%)</span>
                  <span>{formatKES(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={shippingCost === 0 ? 'text-emerald-600 font-medium' : ''}>
                    {shippingCost === 0 ? 'FREE' : formatKES(shippingCost)}
                  </span>
                </div>
                {shippingCost === 0 && (
                  <p className="text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
                    🎉 Free delivery on orders over KES 50,000!
                  </p>
                )}
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-heading font-bold text-base">Total</span>
                  <span className="font-heading text-xl font-bold text-primary">{formatKES(total)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}