import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SwiftTech } from '@/api/SwiftTechClient';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import ProductCard from '@/components/products/ProductCard';
import FilterSidebar from '@/components/products/FilterSidebar';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryStrip from '@/components/home/CategoryStrip';

export default function Home() {
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [sortBy, setSortBy] = useState('-created_date');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => SwiftTech.entities.Product.filter({ status: 'active' }, '-created_date'),
    initialData: [],
  });

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (searchQuery && !p.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !p.brand?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      return true;
    });
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price': return (a.price || 0) - (b.price || 0);
        case '-price': return (b.price || 0) - (a.price || 0);
        case 'name': return (a.name || '').localeCompare(b.name || '');
        default: return 0;
      }
    });
    return result;
  }, [products, category, searchQuery, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      {/* Hero */}
      <HeroBanner productCount={products.length} />

      {/* Category Strip */}
      <CategoryStrip selected={category} onSelect={setCategory} products={products} />

      {/* Products Section */}
      <div id="products" className="max-w-[1800px] mx-auto pb-16">
        <div className="flex gap-0">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0 px-6 pb-8 sticky top-[70px] h-[calc(100vh-70px)] overflow-y-auto">
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
              <FilterSidebar
                selectedCategory={category}
                onCategoryChange={setCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 px-4 lg:px-6 pb-8">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-2xl border border-border px-4 py-3 shadow-sm">
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">
                  {category === 'all' ? 'All Products' : category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h2>
                <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'} found
                </p>
              </div>
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden rounded-xl">
                    <SlidersHorizontal className="w-3.5 h-3.5 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0 bg-white">
                  <div className="p-6">
                    <FilterSidebar
                      selectedCategory={category}
                      onCategoryChange={(cat) => { setCategory(cat); setMobileFiltersOpen(false); }}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      priceRange={priceRange}
                      onPriceRangeChange={setPriceRange}
                      sortBy={sortBy}
                      onSortChange={setSortBy}
                      isMobile
                      onClose={() => setMobileFiltersOpen(false)}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-border">
                    <Skeleton className="aspect-[4/3] w-full rounded-none" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-3 w-16 rounded-full" />
                      <Skeleton className="h-4 w-40 rounded-full" />
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-24 bg-white rounded-2xl border border-border"
              >
                <div className="w-16 h-16 gradient-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <SlidersHorizontal className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground text-sm mb-6">Try adjusting your filters or search query.</p>
                <Button
                  onClick={() => { setCategory('all'); setSearchQuery(''); setPriceRange([0, 5000000]); }}
                  className="gradient-blue text-white rounded-xl"
                >
                  Reset All Filters
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {filteredProducts.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}