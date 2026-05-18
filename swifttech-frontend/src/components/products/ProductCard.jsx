import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye, Star, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatKES } from '@/lib/currency';

const categoryConfig = {
  electronics: { label: 'Electronics', color: 'bg-blue-100 text-blue-700' },
  home_appliances: { label: 'Appliances', color: 'bg-sky-100 text-sky-700' },
  machinery: { label: 'Machinery', color: 'bg-indigo-100 text-indigo-700' },
  tools: { label: 'Tools', color: 'bg-cyan-100 text-cyan-700' },
  components: { label: 'Components', color: 'bg-blue-50 text-blue-600' },
};

export default function ProductCard({ product, index = 0 }) {
  const cat = categoryConfig[product.category] || { label: 'Product', color: 'bg-secondary text-muted-foreground' };
  const specPreview = product.specs?.slice(0, 2) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/product/${product.id}`} className="group block h-full">
        <div className="bg-white rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/8 h-full flex flex-col">
          {/* Image */}
          <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Package className="w-10 h-10 opacity-30" />
                <span className="text-xs">No Image</span>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="space-y-1.5 mb-3">
                  {specPreview.map((spec, i) => (
                    <div key={i} className="flex justify-between text-[11px] font-mono text-white/90">
                      <span className="opacity-70">{spec.label}</span>
                      <span className="font-semibold">{spec.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center justify-center gap-1.5 bg-white text-primary rounded-lg py-2 text-xs font-semibold">
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </div>
                  <div className="flex items-center justify-center bg-white/20 rounded-lg p-2">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
              <Badge className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border-0 ${cat.color}`}>
                {cat.label}
              </Badge>
              {product.featured && (
                <Badge className="bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border-0">
                  <Star className="w-2.5 h-2.5 mr-1 fill-current" />
                  Featured
                </Badge>
              )}
            </div>

            {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
              <div className="absolute bottom-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Only {product.stock} left
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4 flex flex-col flex-1">
            {product.brand && (
              <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-1">
                {product.brand}
              </p>
            )}
            <h3 className="font-heading text-sm font-semibold leading-snug line-clamp-2 mb-auto text-foreground group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <div>
                {product.original_price && product.original_price > product.price ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] text-muted-foreground line-through">
                      {formatKES(product.original_price)}
                    </span>
                    <span className="bg-red-100 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      -{Math.round((1 - product.price / product.original_price) * 100)}%
                    </span>
                  </div>
                ) : (
                  <p className="font-mono text-[10px] text-muted-foreground">Price</p>
                )}
                <p className="font-heading text-base font-bold text-primary">
                  {formatKES(product.price)}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl gradient-blue flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}