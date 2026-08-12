import React from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: LucideIcon | React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'outline', 
  size = 'sm', 
  icon: Icon, 
  loading, 
  className,
  ...props 
}) => {
  const variants = {
    primary: "bg-terminal-blue text-black hover:bg-terminal-blue/90 border-transparent",
    secondary: "bg-white/5 text-white hover:bg-white/10 border-terminal-border",
    outline: "bg-transparent text-white border-terminal-border hover:bg-white/5",
    ghost: "bg-transparent text-terminal-muted hover:text-white border-transparent hover:bg-white/5",
    danger: "bg-terminal-red/10 text-terminal-red border-terminal-red/30 hover:bg-terminal-red/20",
    amber: "bg-terminal-amber text-black hover:bg-terminal-amber/90 border-transparent"
  };

  const sizes = {
    xs: "px-1.5 py-0.5 text-[8px] font-bold uppercase",
    sm: "px-2 py-1 text-[9px] font-bold uppercase",
    md: "px-3 py-1.5 text-[10px] font-bold uppercase",
    lg: "px-4 py-2 text-[11px] font-bold uppercase"
  };

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    if (typeof Icon === 'function' || typeof Icon === 'object') {
      const IconComp = Icon as any;
      return <IconComp className={cn("shrink-0", size === 'xs' ? "w-2.5 h-2.5" : "w-3.5 h-3.5")} />;
    }
    return null;
  };

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center gap-2 border rounded-sm transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-terminal-amber disabled:opacity-50 disabled:cursor-not-allowed tracking-widest",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      aria-disabled={loading || props.disabled}
      aria-busy={loading}
      {...props}
    >
      {renderIcon()}
      {children}
      {loading && <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin ml-1" />}
    </button>
  );
};

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: 'outline' | 'ghost' | 'amber';
  size?: 'xs' | 'sm' | 'md';
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  icon: Icon, 
  variant = 'outline', 
  size = 'sm', 
  className, 
  ...props 
}) => {
  const variants = {
    outline: "bg-transparent border-terminal-border text-terminal-muted hover:text-white hover:bg-white/5",
    ghost: "bg-transparent border-transparent text-terminal-muted hover:text-white hover:bg-white/5",
    amber: "bg-terminal-amber/10 border-terminal-amber/30 text-terminal-amber hover:bg-terminal-amber/20"
  };

  const sizes = {
    xs: "p-0.5",
    sm: "p-1",
    md: "p-1.5"
  };

  return (
    <button 
      className={cn("inline-flex items-center justify-center rounded-sm border transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-terminal-amber", variants[variant], sizes[size], className)}
      aria-label={props['aria-label'] || 'Icon button'}
      {...props}
    >
      <Icon className={cn(size === 'xs' ? "w-2.5 h-2.5" : "w-3.5 h-3.5")} />
    </button>
  );
};
