import { motion } from 'framer-motion';

const categories = [
  { value: 'all', label: 'All Products', emoji: '🏪', color: 'from-blue-500 to-indigo-500', count: null },
  { value: 'electronics', label: 'Electronics', emoji: '💻', color: 'from-blue-400 to-blue-600', count: null },
  { value: 'home_appliances', label: 'Home Appliances', emoji: '🏠', color: 'from-sky-400 to-blue-500', count: null },
  { value: 'machinery', label: 'Machinery', emoji: '⚙️', color: 'from-indigo-500 to-blue-600', count: null },
  { value: 'tools', label: 'Tools', emoji: '🔧', color: 'from-blue-600 to-indigo-600', count: null },
  { value: 'components', label: 'Components', emoji: '🔌', color: 'from-cyan-500 to-blue-500', count: null },
];

export default function CategoryStrip({ selected, onSelect, products = [] }) {
  const getCategoryCount = (cat) => {
    if (cat === 'all') return products.length;
    return products.filter(p => p.category === cat).length;
  };

  return (
    <div className="py-8 px-4 lg:px-8 max-w-[1800px] mx-auto">
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat, i) => {
          const count = getCategoryCount(cat.value);
          const isActive = selected === cat.value;
          return (
            <motion.button
              key={cat.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onSelect(cat.value)}
              className={`shrink-0 flex items-center gap-2.5 px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/25 scale-105'
                  : 'bg-white text-foreground border-border hover:border-primary/40 hover:bg-secondary hover:shadow-sm'
              }`}
            >
              <span className="text-base">{cat.emoji}</span>
              <span>{cat.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
                isActive ? 'bg-white/20 text-white' : 'bg-secondary text-muted-foreground'
              }`}>
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}