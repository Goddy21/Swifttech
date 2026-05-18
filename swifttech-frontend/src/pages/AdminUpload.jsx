import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { SwiftTech } from '@/api/SwiftTechClient';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Save, RotateCcw, Trash2, Pencil, Upload, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageUploader from '@/components/admin/ImageUploader';
import SpecEditor from '@/components/admin/SpecEditor';
import { formatKES } from '@/lib/currency';

const emptyForm = {
  name: '', description: '', price: 0, original_price: 0, category: 'electronics', subcategory: '',
  images: [], specs: [], sku: '', stock: 0, brand: '', weight: '', dimensions: '',
  featured: false, status: 'active',
};

export default function AdminUpload() {
  const [formData, setFormData] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => SwiftTech.entities.Product.list('-created_date', 100),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => SwiftTech.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setFormData({ ...emptyForm });
      toast({ title: '✓ Product Added', description: 'Successfully added to inventory.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => SwiftTech.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setFormData({ ...emptyForm });
      setEditingId(null);
      toast({ title: '✓ Product Updated' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => SwiftTech.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) updateMutation.mutate({ id: editingId, data: formData });
    else createMutation.mutate(formData);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '', description: product.description || '', price: product.price || 0,
      category: product.category || 'electronics', subcategory: product.subcategory || '',
      images: product.images || [], specs: product.specs || [], sku: product.sku || '',
      original_price: product.original_price || 0, stock: product.stock || 0, brand: product.brand || '', weight: product.weight || '',
      dimensions: product.dimensions || '', featured: product.featured || false, status: product.status || 'active',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const inputClass = "rounded-xl h-11 border-border focus-visible:ring-primary/30 bg-white";

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-4 lg:p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 gradient-blue rounded-2xl flex items-center justify-center shadow-lg">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold">Product Upload</h1>
              <p className="text-muted-foreground text-sm">Add and manage Swift Technologies inventory</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Images */}
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <ImageUploader images={formData.images} onImagesChange={(imgs) => updateField('images', imgs)} />
              </div>

              {/* Basic Info */}
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
                <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider">Product Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Product Name *</Label>
                    <Input required value={formData.name} onChange={(e) => updateField('name', e.target.value)} className={inputClass} placeholder='e.g. Samsung 55" Smart TV' />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Brand</Label>
                    <Input value={formData.brand} onChange={(e) => updateField('brand', e.target.value)} className={inputClass} placeholder="e.g. Samsung, LG, Bosch" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Description</Label>
                  <Textarea value={formData.description} onChange={(e) => updateField('description', e.target.value)} className="rounded-xl border-border focus-visible:ring-primary/30 bg-white min-h-[100px]" placeholder="Detailed product description..." />
                </div>
              </div>

              {/* Classification */}
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
                <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider">Classification</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Category *</Label>
                    <Select value={formData.category} onValueChange={(v) => updateField('category', v)}>
                      <SelectTrigger className="rounded-xl h-11 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="home_appliances">Home Appliances</SelectItem>
                        <SelectItem value="machinery">Machinery</SelectItem>
                        <SelectItem value="tools">Tools</SelectItem>
                        <SelectItem value="components">Components</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Subcategory</Label>
                    <Input value={formData.subcategory} onChange={(e) => updateField('subcategory', e.target.value)} className={inputClass} placeholder="e.g. Televisions" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">SKU</Label>
                    <Input value={formData.sku} onChange={(e) => updateField('sku', e.target.value)} className={`${inputClass} font-mono`} placeholder="e.g. ST-ELEC-001" />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
                <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pricing & Stock (KES)</h3>
                <div className="grid sm:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Original Price (KES)</Label>
                    <Input type="number" step="1" min="0" value={formData.original_price} onChange={(e) => updateField('original_price', parseFloat(e.target.value) || 0)} className={`${inputClass} font-mono`} placeholder="Before discount" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Sale Price (KES) *</Label>
                    <Input type="number" step="1" min="0" required value={formData.price} onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)} className={`${inputClass} font-mono`} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Stock</Label>
                    <Input type="number" min="0" value={formData.stock} onChange={(e) => updateField('stock', parseInt(e.target.value) || 0)} className={`${inputClass} font-mono`} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Weight</Label>
                    <Input value={formData.weight} onChange={(e) => updateField('weight', e.target.value)} className={inputClass} placeholder="e.g. 2.5 kg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Dimensions</Label>
                    <Input value={formData.dimensions} onChange={(e) => updateField('dimensions', e.target.value)} className={inputClass} placeholder="e.g. 30×20×15 cm" />
                  </div>
                </div>
                {formData.price > 0 && (
                  <div className="bg-secondary rounded-xl px-4 py-3">
                    <p className="font-mono text-xs text-muted-foreground">Display Price: <span className="text-primary font-semibold">{formatKES(formData.price)}</span></p>
                  </div>
                )}
              </div>

              {/* Specs */}
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <SpecEditor specs={formData.specs} onSpecsChange={(s) => updateField('specs', s)} />
              </div>

              {/* Status */}
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Publishing</h3>
                <div className="flex items-center gap-6">
                  <Select value={formData.status} onValueChange={(v) => updateField('status', v)}>
                    <SelectTrigger className="rounded-xl h-10 w-36 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-3">
                    <Switch checked={formData.featured} onCheckedChange={(v) => updateField('featured', v)} />
                    <Label className="text-sm font-medium">Featured Product</Label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 gradient-blue text-white rounded-xl font-heading font-bold h-12 shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Saving...' : editingId ? 'Update Product' : 'Add to Inventory'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" className="rounded-xl h-12" onClick={() => { setFormData({ ...emptyForm }); setEditingId(null); }}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </motion.div>

          {/* Product List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-[86px] lg:self-start space-y-4"
          >
            {/* Preview */}
            {formData.name && (
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="gradient-blue-soft p-4 border-b border-border">
                  <p className="font-heading text-xs font-semibold text-primary uppercase tracking-wider">Live Preview</p>
                </div>
                <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
                  {formData.images?.[0] ? (
                    <img src={formData.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {formData.brand && <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{formData.brand}</p>}
                  <h3 className="font-heading text-sm font-semibold mt-1 line-clamp-2">{formData.name || 'Product Name'}</h3>
                  <p className="font-heading text-base font-bold text-primary mt-2">{formatKES(formData.price || 0)}</p>
                </div>
              </div>
            )}

            {/* Existing Products */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="gradient-blue p-4">
                <h3 className="font-heading text-sm font-bold text-white">Inventory ({products.length})</h3>
              </div>
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-secondary shrink-0 overflow-hidden">
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{p.name}</p>
                      <p className="font-mono text-[10px] text-primary">{formatKES(p.price)}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-blue-50 hover:text-primary" onClick={() => handleEdit(p)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-red-50 hover:text-destructive" onClick={() => deleteMutation.mutate(p.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">No products yet</div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}