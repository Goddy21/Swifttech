import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, Headphones, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Shield, label: 'Genuine Products', desc: '100% Authentic' },
  { icon: Truck, label: 'Fast Delivery', desc: 'Nairobi & Beyond' },
  { icon: Headphones, label: '24/7 Support', desc: 'Expert Assistance' },
  { icon: Star, label: 'Top Rated', desc: '4.9★ Average' },
];

const floatingCards = [
  { label: 'Electronics', count: '200+', color: 'from-blue-500 to-blue-600', top: '15%', right: '8%' },
  { label: 'Machinery', count: '80+', color: 'from-indigo-500 to-blue-500', top: '55%', right: '3%' },
  { label: 'Appliances', count: '150+', color: 'from-sky-500 to-blue-500', top: '35%', right: '18%' },
];

export default function HeroBanner({ productCount = 0 }) {
  return (
    <section className="relative overflow-hidden gradient-hero min-h-[580px] md:min-h-[640px] flex items-center">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' }}
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="max-w-[1800px] mx-auto px-4 lg:px-8 py-16 md:py-20 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
              <span className="font-mono text-xs text-blue-200 tracking-widest">KENYA'S PREMIER TECH STORE</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.05] mb-6"
            >
              Swift
              <br />
              <span className="text-blue-300">Technologies</span>
              <br />
              <span className="text-white/60 text-2xl md:text-3xl font-medium">Precision. Power. Performance.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-blue-100/80 text-base md:text-lg leading-relaxed max-w-lg mb-8"
            >
              Nairobi's most trusted source for electronics, industrial machinery, home appliances,
              and precision tools. Serving businesses and individuals across Kenya since 2010.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/#products">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-blue-50 font-heading font-semibold rounded-xl px-8 h-12 shadow-lg hover:shadow-xl transition-all"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/admin">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-heading font-medium rounded-xl px-8 h-12 backdrop-blur-sm"
                >
                  Add Products
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-white/15"
            >
              {[
                { value: productCount || '500+', label: 'Products' },
                { value: '15+', label: 'Years Active' },
                { value: '10K+', label: 'Happy Clients' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="font-heading text-2xl font-bold text-white">{stat.value}</p>
                  <p className="font-mono text-xs text-blue-200/70 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right - Floating Cards */}
          <div className="hidden lg:block relative h-[420px]">
            {floatingCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.15, duration: 0.5 }}
                style={{ top: card.top, right: card.right, position: 'absolute' }}
                className="animate-float"
              >
                <div className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 shadow-2xl min-w-[140px] text-white`}>
                  <p className="font-heading text-3xl font-bold">{card.count}</p>
                  <p className="font-body text-sm opacity-80 mt-1">{card.label}</p>
                  <div className="mt-3 h-1 rounded-full bg-white/30">
                    <div className="h-full rounded-full bg-white w-3/4" />
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Central decorative element */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="w-48 h-48 rounded-full border border-white/10 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-white/15 flex items-center justify-center">
                  <div className="w-20 h-20 gradient-blue rounded-full flex items-center justify-center shadow-2xl blue-glow">
                    <span className="font-heading text-white text-2xl font-bold">ST</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features strip */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/8 border-t border-white/10 backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-white/10">
            {features.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-3 px-4 md:px-6 py-3"
              >
                <Icon className="w-4 h-4 text-blue-300 shrink-0" />
                <div>
                  <p className="text-white text-xs font-medium">{label}</p>
                  <p className="text-blue-200/60 text-[10px] font-mono">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}