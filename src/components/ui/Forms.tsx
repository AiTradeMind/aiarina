import React from 'react';
import { cn } from '../../lib/utils';

interface FormFieldProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, description, children, className, error }) => (
  <div className={cn("flex flex-col gap-1.5 py-4 border-b border-terminal-border/30 last:border-0", className)}>
    <div className="flex flex-col">
      <span className="text-[11px] font-bold uppercase tracking-tight text-white">{label}</span>
      {description && <span className="text-[10px] text-terminal-muted italic">{description}</span>}
    </div>
    <div className="mt-1">
      {children}
    </div>
    {error && <span className="text-[9px] text-terminal-red font-bold uppercase">{error}</span>}
  </div>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input 
      ref={ref}
      {...props}
      className={cn(
        "bg-black/40 border border-terminal-border rounded-sm py-1.5 px-3 text-[11px] font-mono text-white focus:outline-none focus:border-terminal-amber focus-visible:ring-1 focus-visible:ring-terminal-amber w-full transition-colors disabled:opacity-50 placeholder:text-terminal-muted",
        className
      )}
      aria-invalid={props['aria-invalid']}
    />
  )
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { label: string, value: string | number }[];
}

export const Select: React.FC<SelectProps> = ({ options, className, ...props }) => (
  <select 
    {...props}
    className={cn(
      "bg-black/40 border border-terminal-border rounded-sm py-1.5 px-3 text-[11px] font-mono text-white focus:outline-none focus:border-terminal-amber focus-visible:ring-1 focus-visible:ring-terminal-amber w-full appearance-none cursor-pointer disabled:opacity-50",
      className
    )}
    aria-invalid={props['aria-invalid']}
  >
    {options.map(opt => (
      <option key={opt.value} value={opt.value} className="bg-terminal-panel">{opt.label}</option>
    ))}
  </select>
);

interface SwitchProps {
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ active, onToggle, disabled }) => (
  <button 
    type="button"
    role="switch"
    aria-checked={active}
    onClick={onToggle}
    disabled={disabled}
    className={cn(
      "w-8 h-4 rounded-full relative transition-colors  focus:outline-none focus-visible:ring-2 focus-visible:ring-terminal-amber disabled:opacity-30",
      active ? "bg-terminal-amber" : "bg-white/10 border border-terminal-border"
    )}
  >
    <div className={cn(
      "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all  shadow-sm",
      active ? "left-4.5" : "left-0.5"
    )} />
  </button>
);
