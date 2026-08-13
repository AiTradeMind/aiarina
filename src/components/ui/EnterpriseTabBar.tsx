import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export interface EnterpriseTabBarProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (id: T) => void;
  className?: string;
  activeVariant?: 'amber-outline' | 'amber-solid';
}

export function EnterpriseTabBar<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  className,
  activeVariant = 'amber-outline'
}: EnterpriseTabBarProps<T>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check scroll positions to show/hide scroll indicators
  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftScroll(scrollLeft > 4);
    setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, tabs]);

  // Handle Mouse Wheel horizontal scrolling
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (e.deltaY !== 0) {
      e.preventDefault();
      el.scrollLeft += e.deltaY * 0.8;
    }
  };

  // Scroll Active Tab into view smoothly
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeTab]);

  // Click handler for scroll arrows
  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.6;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation across tabs
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % tabs.length;
      onTabChange(tabs[nextIndex].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      onTabChange(tabs[prevIndex].id);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onTabChange(tabs[0].id);
    } else if (e.key === 'End') {
      e.preventDefault();
      onTabChange(tabs[tabs.length - 1].id);
    }
  };

  return (
    <div className={cn("relative flex items-center bg-black/40 border-b border-terminal-border/80 px-2 select-none shrink-0 w-full overflow-hidden", className)}>
      {/* Scroll Left Button */}
      {showLeftScroll && (
        <button
          onClick={() => scroll('left')}
          className="z-10 p-1.5 text-terminal-muted hover:text-white bg-black/90 hover:bg-black border border-terminal-border/80 rounded-sm mr-1 transition-all shrink-0 cursor-pointer shadow-md"
          title="Scroll Left"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Main Tab Scroll Container */}
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        role="tablist"
        aria-label="Workspace Navigation Tabs"
        className="flex-1 flex items-center gap-1.5 overflow-x-auto scroll-smooth py-1.5 no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              ref={isActive ? activeTabRef : null}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={cn(
                "px-3 py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-terminal-amber",
                activeVariant === 'amber-solid'
                  ? isActive
                    ? "bg-terminal-amber text-black border border-terminal-amber shadow-sm font-bold"
                    : "bg-black/40 text-terminal-muted border border-terminal-border/60 hover:text-white hover:bg-white/5"
                  : isActive
                    ? "bg-terminal-amber/20 text-terminal-amber font-bold border border-terminal-amber/40 shadow-sm"
                    : "text-terminal-muted border border-transparent hover:text-white hover:bg-white/5"
              )}
            >
              {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={cn(
                  "px-1.5 py-0.2 text-[8px] rounded font-bold font-mono ml-0.5",
                  isActive && activeVariant === 'amber-solid'
                    ? "bg-black/20 text-black"
                    : "bg-terminal-amber/20 text-terminal-amber"
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      {showRightScroll && (
        <button
          onClick={() => scroll('right')}
          className="z-10 p-1.5 text-terminal-muted hover:text-white bg-black/90 hover:bg-black border border-terminal-border/80 rounded-sm ml-1 transition-all shrink-0 cursor-pointer shadow-md"
          title="Scroll Right"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      {/* "More" Overflow Dropdown Button */}
      <div className="relative ml-2 shrink-0" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all border shrink-0 cursor-pointer",
            isDropdownOpen
              ? "bg-terminal-amber/20 text-terminal-amber border-terminal-amber/60"
              : "bg-black/40 text-terminal-muted border-terminal-border/80 hover:text-white hover:bg-white/5"
          )}
          title="All Navigation Tabs"
          aria-label="All Navigation Tabs"
        >
          <span className="hidden sm:inline font-bold">More</span>
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isDropdownOpen && "rotate-180")} />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-64 bg-[#0d121f] border border-terminal-border shadow-2xl rounded p-1.5 z-50 max-h-80 overflow-y-auto space-y-0.5 font-mono text-xs">
            <div className="px-2 py-1 text-[9px] font-bold uppercase text-terminal-muted border-b border-terminal-border/40 mb-1 flex items-center justify-between">
              <span>All Workspace Tabs</span>
              <span className="text-terminal-amber">{tabs.length} Tabs</span>
            </div>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setIsDropdownOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider rounded transition-all text-left cursor-pointer",
                    isActive
                      ? "bg-terminal-amber/20 text-terminal-amber border-l-2 border-terminal-amber font-bold"
                      : "text-terminal-muted hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 text-terminal-amber shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
