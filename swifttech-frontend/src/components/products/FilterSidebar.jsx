import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Search, X, SlidersHorizontal, LayoutGrid, Cpu, Home, Cog, Wrench, CircuitBoard } from 'lucide-react';

const categories = [
  { value: 'all', label: 'All Products', icon: LayoutGrid },
  { value: 'electronics', label: 'Electronics', icon: Cpu },
  { value: 'home_appliances', label: 'Home Appliances', icon: Home },
  { value: 'machinery', label: 'Machinery', icon: Cog },
  { value: 'tools', label: 'Tools', icon: Wrench },
  { value: 'components', label: 'Components', icon: CircuitBoard },
];

const sortOptions = [
  { value: '-created_date', label: 'Newest First' },
  { value: 'price', label: 'Price: Low → High' },
  { value: '-price', label: 'Price: High → Low' },
  { value: 'name', label: 'Name A → Z' },
];

export default function FilterSidebar({
  selectedCategory, onCategoryChange, searchQuery, onSearchChange,
  priceRange, onPriceRangeChange, sortBy, onSortChange, isMobile = false, onClose,
}) {
  return (
    <div className={`${isMobile ? 'p-6' : 'space-y-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 gradient-blue rounded-lg flex items-center justify-center">
            <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-heading text-sm font-semibold">Filters</span>
        </div>
        {isMobile && onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-lg">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2 mt-4">
        <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Search</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 rounded-xl text-sm h-9 bg-secondary border-0 focus-visible:ring-primary/30"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2 mt-4">
        <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Category</p>
        <div className="space-y-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
                className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-all flex items-center gap-3 ${
                  isActive
                    ? 'bg-primary text-white font-medium shadow-sm shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3 mt-4">
        <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Price Range (KES)</p>
        <Slider
          min={0}
          max={5000000}
          step={10000}
          value={priceRange}
          onValueChange={onPriceRangeChange}
          className="py-2"
        />
        <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
          <span className="bg-secondary px-2 py-1 rounded-lg">KES {(priceRange[0] / 1000).toFixed(0)}K</span>
          <span className="bg-secondary px-2 py-1 rounded-lg">KES {(priceRange[1] / 1000).toFixed(0)}K</span>
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-2 mt-4">
        <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Sort By</p>
        <div className="space-y-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-all ${
                sortBy === opt.value
                  ? 'bg-secondary text-primary font-medium border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}