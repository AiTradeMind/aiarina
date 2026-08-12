import React, { useEffect, useRef } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  Time,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  AreaSeries,
  createSeriesMarkers,
} from 'lightweight-charts';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ChartCandle {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface ChartLinePoint {
  time: string | number;
  value: number;
}

export interface ChartMarker {
  time: string | number;
  position: 'aboveBar' | 'belowBar' | 'inBar';
  color: string;
  shape: 'circle' | 'square' | 'arrowUp' | 'arrowDown';
  text: string;
  id?: string;
}

export interface TradingViewChartProps {
  candles?: ChartCandle[];
  lineData?: ChartLinePoint[];
  markers?: ChartMarker[];
  symbol?: string;
  timeframe?: string;
  isLoading?: boolean;
  errorStatus?: string | null;
  height?: number | string;
  chartType?: 'CANDLESTICK' | 'LINE' | 'AREA';
  className?: string;
  onMarkerClick?: (markerId: string) => void;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  candles = [],
  lineData = [],
  markers = [],
  symbol = 'INSTRUMENT',
  timeframe = '1D',
  isLoading = false,
  errorStatus = null,
  height = '100%',
  chartType = 'CANDLESTICK',
  className,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<any> | null>(null);

  // Normalize timestamp for TradingView Lightweight Charts
  const parseTime = (rawTime: string | number): Time => {
    if (typeof rawTime === 'number') {
      return (rawTime > 1e10 ? Math.floor(rawTime / 1000) : rawTime) as Time;
    }
    const d = new Date(rawTime);
    if (!isNaN(d.getTime())) {
      return Math.floor(d.getTime() / 1000) as Time;
    }
    return rawTime as Time;
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
      volumeSeriesRef.current = null;
    }

    const container = chartContainerRef.current;
    const clientWidth = container.clientWidth || 600;
    const clientHeight = container.clientHeight || 400;

    const chart = createChart(container, {
      width: clientWidth,
      height: clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: '#07090e' },
        textColor: '#9da6b8',
        fontSize: 11,
        fontFamily: 'monospace',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#f59e0b',
          width: 1,
          style: 2,
          labelBackgroundColor: '#1f293d',
        },
        horzLine: {
          color: '#f59e0b',
          width: 1,
          style: 2,
          labelBackgroundColor: '#1f293d',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textColor: '#9da6b8',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    if (chartType === 'CANDLESTICK') {
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      });
      seriesRef.current = candlestickSeries;

      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: 'rgba(245, 158, 11, 0.3)',
        priceFormat: { type: 'volume' },
        priceScaleId: '',
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
      volumeSeriesRef.current = volumeSeries;
    } else if (chartType === 'LINE') {
      const lineSeries = chart.addSeries(LineSeries, {
        color: '#f59e0b',
        lineWidth: 2,
      });
      seriesRef.current = lineSeries;
    } else if (chartType === 'AREA') {
      const areaSeries = chart.addSeries(AreaSeries, {
        topColor: 'rgba(245, 158, 11, 0.4)',
        bottomColor: 'rgba(245, 158, 11, 0.0)',
        lineColor: '#f59e0b',
        lineWidth: 2,
      });
      seriesRef.current = areaSeries;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0] && chartRef.current) {
        const { width, height: h } = entries[0].contentRect;
        chartRef.current.applyOptions({
          width: Math.max(width, 100),
          height: Math.max(h, 100),
        });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
        volumeSeriesRef.current = null;
      }
    };
  }, [chartType]);

  useEffect(() => {
    if (!seriesRef.current) return;

    if (chartType === 'CANDLESTICK' && candles.length > 0) {
      const timeMap = new Map<number | string, any>();
      candles.forEach((c) => {
        const parsedTime = parseTime(c.time);
        timeMap.set(parsedTime as any, {
          time: parsedTime,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        });
      });

      const formattedCandles = Array.from(timeMap.values()).sort(
        (a, b) => (a.time as number) - (b.time as number)
      );

      seriesRef.current.setData(formattedCandles);

      if (volumeSeriesRef.current) {
        const volumeData = candles.map((c) => ({
          time: parseTime(c.time),
          value: c.volume || 0,
          color: c.close >= c.open ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
        }));
        volumeSeriesRef.current.setData(volumeData);
      }

      if (markers.length > 0) {
        const availableTimes = formattedCandles.map((c) => c.time);
        const formattedMarkers = markers.map((m) => {
          let t = parseTime(m.time);
          if (availableTimes.length > 0 && !availableTimes.includes(t)) {
            const mDateStr = typeof m.time === 'string' ? m.time.split('T')[0] : null;
            const match = availableTimes.find((timeVal) => String(timeVal) === mDateStr);
            if (match) {
              t = match;
            } else if (availableTimes.length > 0) {
              t = availableTimes[availableTimes.length - 1];
            }
          }
          return {
            time: t,
            position: m.position,
            color: m.color,
            shape: m.shape,
            text: m.text,
          };
        });

        if (typeof createSeriesMarkers === 'function') {
          createSeriesMarkers(seriesRef.current, formattedMarkers);
        } else if (typeof seriesRef.current.setMarkers === 'function') {
          seriesRef.current.setMarkers(formattedMarkers);
        }
      } else {
        if (typeof createSeriesMarkers === 'function') {
          createSeriesMarkers(seriesRef.current, []);
        } else if (typeof seriesRef.current.setMarkers === 'function') {
          seriesRef.current.setMarkers([]);
        }
      }

      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    } else if ((chartType === 'LINE' || chartType === 'AREA') && lineData.length > 0) {
      const formattedLine = lineData.map((d) => ({
        time: parseTime(d.time),
        value: d.value,
      }));
      seriesRef.current.setData(formattedLine);

      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [candles, lineData, markers, chartType]);

  const hasData =
    (chartType === 'CANDLESTICK' && candles.length > 0) ||
    ((chartType === 'LINE' || chartType === 'AREA') && lineData.length > 0);

  return (
    <div
      className={cn(
        'relative w-full h-full min-h-[300px] bg-[#07090e] border border-terminal-border/50 rounded overflow-hidden flex flex-col',
        className
      )}
      style={{ height }}
    >
      <div ref={chartContainerRef} className="w-full h-full flex-1" />

      {isLoading && (
        <div className="absolute inset-0 bg-[#07090e]/80 backdrop-blur-xs flex flex-col items-center justify-center z-20 space-y-2">
          <RefreshCw className="w-6 h-6 text-terminal-amber animate-spin" />
          <span className="text-xs font-mono font-bold text-terminal-amber tracking-wider uppercase">
            LOADING MARKET DATA ({symbol})
          </span>
        </div>
      )}

      {!isLoading && (!hasData || errorStatus) && (
        <div className="absolute inset-0 bg-[#07090e]/90 flex flex-col items-center justify-center p-6 text-center z-10 space-y-3">
          <AlertCircle className="w-9 h-9 text-terminal-amber animate-pulse" />
          <div className="space-y-1">
            <h4 className="text-xs font-black tracking-widest text-terminal-amber uppercase font-mono">
              {errorStatus || 'MARKET DATA NOT CONFIGURED'}
            </h4>
            <p className="text-[11px] text-white font-mono max-w-md font-semibold">
              No live or historical market-data feed available for {symbol}.
            </p>
            <p className="text-[10px] text-terminal-muted font-mono max-w-sm pt-1">
              TradingView rendering active. Zero synthetic prices generated. Connect an authorized provider feed (Angel One, TrueData, GlobalDatafeeds) to populate live candles.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

