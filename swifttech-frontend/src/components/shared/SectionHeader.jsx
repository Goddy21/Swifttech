import TechLabel from './TechLabel';

export default function SectionHeader({ code, title, subtitle }) {
  return (
    <div className="space-y-2">
      {code && <TechLabel code={code} />}
      <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
      {subtitle && <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">{subtitle}</p>}
    </div>
  );
}