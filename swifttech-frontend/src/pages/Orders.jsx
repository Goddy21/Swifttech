import { useQuery } from '@tanstack/react-query';
import { SwiftTech } from '@/api/SwiftTechClient';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package, ArrowLeft, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatKES } from '@/lib/currency';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function Orders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => SwiftTech.entities.Order.list('-created_date'),
    initialData: [],
  });

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-4 lg:p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold">Order History</h1>
            <p className="text-muted-foreground text-sm mt-1">Track all your Swift Technologies orders</p>
          </div>
          <Link to="/">
            <Button variant="outline" className="rounded-xl hidden sm:flex">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-white rounded-3xl border border-border shadow-sm"
          >
            <div className="w-16 h-16 gradient-blue rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Start shopping to see your orders here.</p>
            <Link to="/">
              <Button className="gradient-blue text-white rounded-xl px-8">Browse Products</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                          #{order.id?.slice(-8).toUpperCase()}
                        </span>
                        <Badge className={`text-xs font-medium px-3 py-1 rounded-full border-0 flex items-center gap-1.5 ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1.5">
                        {order.created_date ? format(new Date(order.created_date), 'dd MMM yyyy, HH:mm') : ''}
                        {order.shipping_name && ` · ${order.shipping_name}`}
                        {order.shipping_city && `, ${order.shipping_city}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs text-muted-foreground">Order Total</p>
                      <p className="font-heading text-xl font-bold text-primary">{formatKES(order.total)}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex flex-wrap gap-2">
                    {order.items?.map((item, j) => (
                      <div key={j} className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
                        <span className="font-mono text-[10px] text-primary font-bold">{item.quantity}×</span>
                        <span className="text-xs font-medium truncate max-w-[160px]">{item.product_name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{formatKES(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}