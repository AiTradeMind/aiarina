import React, { Component } from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle, FileQuestion, Loader2, ShieldAlert } from 'lucide-react';

export const LoadingOverlay = ({ message = "Processing Data..." }: { message?: string }) => (
  <div 
    role="status"
    aria-live="polite"
    aria-label={message}
    className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3"
  >
    <Loader2 className="w-8 h-8 text-terminal-amber animate-spin motion-reduce:animate-none" />
    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-terminal-amber animate-pulse motion-reduce:animate-none">
      {message}
    </span>
  </div>
);

export const EmptyState = ({ 
  title, 
  message, 
  icon: Icon = FileQuestion,
  actionLabel,
  onAction
}: { 
  title: string, 
  message: string, 
  icon?: any,
  actionLabel?: string,
  onAction?: () => void
}) => (
  <div role="region" aria-label={title} className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-12 h-12 bg-white/5 border border-terminal-border flex items-center justify-center rounded-sm mb-4">
      <Icon className="w-6 h-6 text-terminal-muted" aria-hidden="true" />
    </div>
    <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-2">{title}</h3>
    <p className="text-[10px] text-terminal-muted italic max-w-[240px] leading-relaxed mb-3">
      {message}
    </p>
    {onAction && actionLabel && (
      <button
        onClick={onAction}
        className="px-3 py-1.5 bg-terminal-amber/10 border border-terminal-amber/30 text-terminal-amber text-[9px] font-bold uppercase rounded-sm hover:bg-terminal-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-terminal-amber transition-colors"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export const ErrorState = ({ title = "System Error", message, onRetry }: { title?: string, message: string, onRetry?: () => void }) => (
  <div role="alert" aria-live="assertive" className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-12 h-12 bg-terminal-red/10 border border-terminal-red/30 flex items-center justify-center rounded-sm mb-4">
      <AlertCircle className="w-6 h-6 text-terminal-red" aria-hidden="true" />
    </div>
    <h3 className="text-xs font-bold uppercase tracking-widest text-terminal-red mb-2">{title}</h3>
    <p className="text-[10px] text-terminal-muted italic max-w-[240px] leading-relaxed mb-4">
      {message}
    </p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="px-3 py-1.5 bg-terminal-red/10 border border-terminal-red/30 text-terminal-red text-[9px] font-bold uppercase rounded-sm hover:bg-terminal-red/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-terminal-red transition-colors"
        aria-label={`Retry ${title}`}
      >
        Retry Connection
      </button>
    )}
  </div>
);

export const LoadingSkeleton = ({ className }: { className?: string }) => (
  <div 
    role="status" 
    aria-label="Loading content..."
    className={cn("animate-pulse motion-reduce:animate-none bg-white/5 rounded-sm", className)} 
  />
);

export const AuthenticationPlaceholder = ({ title = "Login Required", message = "Please authenticate to access this module." }: { title?: string, message?: string }) => (
  <div role="alert" aria-live="polite" className="flex flex-col items-center justify-center py-12 px-4 text-center h-full w-full">
    <div className="w-12 h-12 bg-terminal-amber/10 border border-terminal-amber/30 flex items-center justify-center rounded-sm mb-4">
      <ShieldAlert className="w-6 h-6 text-terminal-amber" aria-hidden="true" />
    </div>
    <h3 className="text-xs font-bold uppercase tracking-widest text-terminal-amber mb-2">{title}</h3>
    <p className="text-[10px] text-terminal-muted italic max-w-[240px] leading-relaxed mb-4">
      {message}
    </p>
  </div>
);

export const UnauthorizedState = AuthenticationPlaceholder;

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  props: ErrorBoundaryProps;
  state: ErrorBoundaryState = { hasError: false, error: null };
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Only warn for 401s
    if (error?.status === 401 || error?.message?.includes('401') || error?.message?.includes('Authentication')) {
      console.warn('ErrorBoundary caught a 401 Authentication Error', error);
    } else {
      console.error('ErrorBoundary caught an error', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      
      // Authentication Error
      if (error?.status === 401 || error?.message?.includes('401') || error?.message?.includes('Authentication')) {
         return <AuthenticationPlaceholder />;
      }
      // Authorization Error
      if (error?.status === 403 || error?.message?.includes('403')) {
         return <ErrorState title="Access Denied" message="You do not have permission to view this content." />;
      }
      // Not Found
      if (error?.status === 404 || error?.message?.includes('404')) {
         return <EmptyState title="Not Found" message="The requested resource could not be found." />;
      }
      // Network Error
      if (error?.status === 500 && error?.message?.includes('Network')) {
         return <ErrorState title="Network Error" message="Failed to connect to the server." />;
      }
      // Server Error
      if (error?.status >= 500) {
         return <ErrorState title="Server Error" message="An internal server error occurred." />;
      }

      return this.props.fallback || <ErrorState title="Rendering Error" message="A critical component failed to render." />;
    }
    return this.props.children;
  }
}

export const DataBoundary = ({ data, children, title }: { data: any, children: React.ReactNode, title?: string }) => {
  if (data?._isApiError) {
    if (data.isAborted || data.message === 'Request aborted') {
      return <>{children}</>;
    }
    if (data.status === 401) return <AuthenticationPlaceholder title="Login Required" message="Authentication is required to view this content." />;
    if (data.status === 403) return <ErrorState title="Access Denied" message="You do not have permission to view this content." />;
    if (data.status === 404) return <EmptyState title={title || "Not Found"} message="The requested resource could not be found." />;
    return <ErrorState title={title || "Error"} message={data.message || "Failed to load data."} />;
  }
  return <>{children}</>;
};
