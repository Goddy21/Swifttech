export default function TechLabel({ code, className = '' }) {
  return (
    <span className={`font-mono text-[10px] text-primary/60 tracking-widest uppercase bg-primary/8 px-1.5 py-0.5 rounded ${className}`}>
      [{code}]
    </span>
  );
}