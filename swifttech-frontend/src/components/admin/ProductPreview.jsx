import TechLabel from '../shared/TechLabel';

export default function ProductPreview({ formData }) {
  const { name, price, brand, images, category, specs } = formData;

  return (
    <div className="border border-border bg-card">
      <div className="p-3 border-b border-border bg-secondary">
        <TechLabel code="PREVIEW" />
        <p className="font-mono text-[10px] text-muted-foreground mt-1">
          How this product will appear in the Inventory Matrix
        </p>
      </div>

      <div className="aspect-square bg-secondary overflow-hidden relative">
        {images?.[0] ? (
          <img src={images[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-mono text-xs text-muted-foreground">AWAITING IMAGE DATA</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <TechLabel code={`${(category || 'PROD').toUpperCase().slice(0, 4)}_01`} />
        </div>
      </div>

      <div className="p-4 space-y-2 border-t border-border">
        {brand && (
          <span className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">{brand}</span>
        )}
        <h3 className="font-heading text-sm font-medium leading-tight">
          {name || 'Product Name'}
        </h3>
        <span className="font-heading text-lg font-semibold block">
          ${(price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {specs?.length > 0 && (
        <div className="border-t border-border p-4 bg-secondary/50">
          <TechLabel code="QUICK_SPEC" className="mb-2 block" />
          {specs.filter(s => s.label && s.value).slice(0, 3).map((spec, i) => (
            <div key={i} className="flex justify-between font-mono text-[11px]">
              <span className="text-muted-foreground">{spec.label}</span>
              <span>{spec.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}