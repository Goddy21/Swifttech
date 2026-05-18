import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import TechLabel from '../shared/TechLabel';

export default function SpecEditor({ specs = [], onSpecsChange }) {
  const addSpec = () => {
    onSpecsChange([...specs, { label: '', value: '' }]);
  };

  const updateSpec = (index, field, value) => {
    const updated = specs.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    onSpecsChange(updated);
  };

  const removeSpec = (index) => {
    onSpecsChange(specs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <TechLabel code="TECH_SPECS" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-none font-mono text-[10px] h-7"
          onClick={addSpec}
        >
          <Plus className="w-3 h-3 mr-1" />
          ADD SPEC
        </Button>
      </div>

      {specs.length === 0 ? (
        <p className="font-mono text-[11px] text-muted-foreground py-4 text-center border border-dashed border-border">
          No specifications added yet
        </p>
      ) : (
        <div className="space-y-2">
          {specs.map((spec, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                placeholder="Label (e.g. Voltage)"
                value={spec.label}
                onChange={(e) => updateSpec(i, 'label', e.target.value)}
                className="rounded-none font-mono text-xs h-9 flex-1"
              />
              <Input
                placeholder="Value (e.g. 220V)"
                value={spec.value}
                onChange={(e) => updateSpec(i, 'value', e.target.value)}
                className="rounded-none font-mono text-xs h-9 flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-none h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeSpec(i)}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}