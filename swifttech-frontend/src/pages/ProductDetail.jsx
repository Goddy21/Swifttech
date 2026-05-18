import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SwiftTech } from '@/api/SwiftTechClient';
import { Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart, Package, Zap, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { useState } from 'react';
import { motion } from 'framer-motion';
import ProductGallery from '@/components/products/ProductGallery';
import TechLabel from '@/components/shared/TechLabel';
import { formatKES } from '@/lib/currency';

const categoryLabels = {
  electronics: 'Electronics',
  home_appliances: 'Home Appliances',
  machinery: 'Industrial Machinery',
  tools: 'Tools & Equipment',
  components: 'Components',
};

export default function ProductDetail() {
  const productId = window.location.pathname.split('/product/')[1];
  const [quantity, setQuantity] = useState(1);
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const products = await SwiftTech.entities.Product.filter({ id: productId });
      return products[0];
    },
    enabled: !!productId,
  });

  const addToCartMutation = useMutation({
    mutationFn: (data) => SwiftTech.entities.CartItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
      toast({ title: '✓ Added to Cart', description: `${quantity}× ${product.name}` });
    },
  });

  const handleAddToCart = () => {
    addToCartMutation.mutate({
      product_id: product.id,
      quantity,
      product_name: product.name,
      product_price: product.price,
      product_image: product.images?.[0] || '',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] max-w-[1800px] mx-auto p-4 lg:p-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] max-w-[1800px] mx-auto p-8 text-center py-24">
        <h2 className="font-heading text-xl">Product Not Found</h2>
        <Link to="/">
          <Button className="mt-4 rounded-xl gradient-blue text-white">
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border px-4 lg:px-8 py-3">
        <div className="max-w-[1800px] mx-auto flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Products</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-muted-foreground">{categoryLabels[product.category] || product.category}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-4 lg:p-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left - Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-[86px] lg:self-start"
          >
            <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
              <ProductGallery images={product.images} productName={product.name} />
            </div>
          </motion.div>

          {/* Right - Dossier */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-3">
                <Badge className="bg-primary/10 text-primary border-0 rounded-full text-xs font-medium">
                  {categoryLabels[product.category]}
                </Badge>
                {product.sku && (
                  <span className="font-mono text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                    SKU: {product.sku}
                  </span>
                )}
              </div>

              {product.brand && (
                <p className="font-mono text-xs text-primary/70 tracking-widest uppercase mb-2">{product.brand}</p>
              )}
              <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight mb-4 text-foreground">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-heading text-3xl font-bold text-primary">
                  {formatKES(product.price)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <>
                    <span className="font-heading text-lg text-muted-foreground line-through">
                      {formatKES(product.original_price)}
                    </span>
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                    </span>
                  </>
                )}
                <span className="font-mono text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                  Incl. VAT
                </span>
              </div>

              {/* Stock indicator */}
              <div className="flex items-center gap-2 mt-4">
                {product.stock > 0 ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 text-sm font-medium">
                      In Stock — {product.stock} units available
                    </span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-destructive" />
                    <span className="text-destructive text-sm font-medium">Out of Stock</span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="font-heading text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Description</h3>
                <p className="text-sm text-foreground/80 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Specifications */}
            {product.specs?.length > 0 && (
              <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border gradient-blue-soft">
                  <h3 className="font-heading text-sm font-semibold text-primary uppercase tracking-wider">
                    Technical Specifications
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {product.specs.map((spec, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex justify-between items-center px-5 py-3 hover:bg-secondary/50 transition-colors"
                    >
                      <span className="font-mono text-xs text-muted-foreground">{spec.label}</span>
                      <span className="font-mono text-xs font-semibold text-foreground">{spec.value}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Dimensions & Weight */}
            {(product.weight || product.dimensions) && (
              <div className="grid grid-cols-2 gap-4">
                {product.weight && (
                  <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Weight</p>
                    <p className="font-heading text-base font-semibold">{product.weight}</p>
                  </div>
                )}
                {product.dimensions && (
                  <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Dimensions</p>
                    <p className="font-heading text-base font-semibold">{product.dimensions}</p>
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button
                    className="px-4 py-2.5 hover:bg-secondary transition-colors text-foreground"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-heading text-lg font-semibold w-14 text-center border-x border-border py-2">
                    {quantity}
                  </span>
                  <button
                    className="px-4 py-2.5 hover:bg-secondary transition-colors text-foreground"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <p className="font-mono text-xs text-muted-foreground">Total</p>
                  <p className="font-heading text-base font-bold text-primary">{formatKES(product.price * quantity)}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sticky CTA Bar */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-border shadow-[0_-4px_20px_rgba(33,83,200,0.1)] px-4 lg:px-8 py-4 z-30">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="font-heading text-sm font-semibold text-foreground truncate max-w-sm">{product.name}</p>
            <p className="font-heading text-lg font-bold text-primary">
              {formatKES(product.price * quantity)}
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Link to="/" className="hidden sm:block">
              <Button variant="outline" className="rounded-xl h-12 px-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button
              className="flex-1 sm:flex-none gradient-blue text-white rounded-xl font-heading font-semibold px-8 h-12 shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending || product.stock <= 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}