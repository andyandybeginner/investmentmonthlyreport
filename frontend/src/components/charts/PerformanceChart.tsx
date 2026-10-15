import React from 'react';
import { TimeSeriesPoint, PerformanceEvent } from '../../types';

interface PerformanceChartProps {
  data: TimeSeriesPoint[];
  events?: PerformanceEvent[];
  width?: number;
  height?: number;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  events = [],
  width = 520,
  height = 185,
}) => {
  const margin = { top: 20, right: 14, bottom: 20, left: 36 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const yMin = 0.9;
  const yMax = 2.05;
  const n = data.length;

  const getX = (i: number) => {
    return n > 1 ? margin.left + (plotW * i) / (n - 1) : margin.left;
  };

  const getY = (val: number) => {
    const v = Math.max(yMin, Math.min(yMax, val));
    return margin.top + (plotH * (yMax - v)) / (yMax - yMin);
  };

  const pointsToSpline = (pts: [number, number][], tension = 0.15) => {
    if (!pts.length) return '';
    if (pts.length === 1) return `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
    const path = [`M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i + 2 < pts.length ? pts[i + 2] : p2;
      const cp1X = p1[0] + (p2[0] - p0[0]) * tension;
      const cp1Y = p1[1] + (p2[1] - p0[1]) * tension;
      const cp2X = p2[0] - (p3[0] - p1[0]) * tension;
      const cp2Y = p2[1] - (p3[1] - p1[1]) * tension;
      path.push(
        `C ${cp1X.toFixed(2)} ${cp1Y.toFixed(2)}, ${cp2X.toFixed(2)} ${cp2Y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
      );
    }
    return path.join(' ');
  };

  const curPts: [number, number][] = data.map((d, i) => [getX(i), getY(d.current)]);
  const pastPts: [number, number][] = data.map((d, i) => [getX(i), getY(d.past)]);
  const spPts: [number, number][] = data.map((d, i) => [getX(i), getY(d.sp500)]);
  const msciPts: [number, number][] = data.map((d, i) => [getX(i), getY(d.msci)]);

  const curD = pointsToSpline(curPts);
  const pastD = pointsToSpline(pastPts);
  const spD = pointsToSpline(spPts);
  const msciD = pointsToSpline(msciPts);

  const yTicks = [
    { val: 2.0, label: '200%' },
    { val: 1.8, label: '180%' },
    { val: 1.6, label: '160%' },
    { val: 1.4, label: '140%' },
    { val: 1.2, label: '120%' },
    { val: 1.0, label: '100%' },
    { val: 0.9, label: '90%' },
  ];

  // Pick ~8 evenly spaced indices
  const xIndices = Array.from({ length: n }, (_, i) => i).filter((i) => i % 5 === 0);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full block select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Horizontal Y Gridlines & Labels */}
      {yTicks.map(({ val, label }) => {
        const y = getY(val);
        const isBaseline = val === 1.0;
        return (
          <g key={val}>
            <line
              x1={margin.left}
              y1={y}
              x2={width - margin.right}
              y2={y}
              stroke={isBaseline ? '#cbd5e1' : '#e2e8f0'}
              strokeWidth={isBaseline ? 1.2 : 0.8}
              strokeDasharray={isBaseline ? undefined : '3,3'}
            />
            <text
              x={margin.left - 6}
              y={y + 3}
              fontSize="8.5px"
              fill="#64748b"
              textAnchor="end"
              fontWeight="500"
              fontFamily="system-ui, sans-serif"
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* X Ticks & Date Labels */}
      {xIndices.map((idx) => {
        const x = getX(idx);
        const dStr = data[idx]?.date || '';
        return (
          <g key={idx}>
            <line
              x1={x}
              y1={margin.top + plotH}
              x2={x}
              y2={margin.top + plotH + 3}
              stroke="#94a3b8"
              strokeWidth={0.8}
            />
            <text
              x={x}
              y={margin.top + plotH + 13}
              fontSize="8.5px"
              fill="#64748b"
              textAnchor={idx === 0 ? 'start' : 'middle'}
              fontWeight="500"
              fontFamily="system-ui, sans-serif"
            >
              {dStr}
            </text>
          </g>
        );
      })}

      {/* 4 Performance Vector Curves */}
      {/* 1. MSCI World (Gray dashed) */}
      <path
        d={msciD}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={1.8}
        strokeDasharray="3,3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 2. S&P 500 (Black dashed) */}
      <path
        d={spD}
        fill="none"
        stroke="#0f172a"
        strokeWidth={1.8}
        strokeDasharray="3,3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 3. Past Model (Blue dashed - VISIBLE & DISTINCT) */}
      <path
        d={pastD}
        fill="none"
        stroke="#1d4ed8"
        strokeWidth={2.4}
        strokeDasharray="4,3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 4. Current Reconstituted Portfolio (Red solid) */}
      <path
        d={curD}
        fill="none"
        stroke="#dc2626"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Event Markers & Projection Lines */}
      {events.map((ev, i) => {
        const matchIdx = data.findIndex((d) => d.date.startsWith(ev.date.slice(0, 7)));
        if (matchIdx === -1) return null;
        const x = getX(matchIdx);
        const yCur = getY(data[matchIdx].current);
        const isRestruct = ev.type === 'restructure' || ev.status.toLowerCase().includes('restruct');
        const color = isRestruct ? '#eab308' : '#10b981';

        return (
          <g key={i}>
            <line
              x1={x}
              y1={margin.top}
              x2={x}
              y2={margin.top + plotH}
              stroke={color}
              strokeWidth={1.2}
              strokeDasharray="2,2"
              opacity={0.8}
            />
            <circle
              cx={x}
              cy={yCur}
              r={5}
              fill={color}
              stroke="#ffffff"
              strokeWidth={1.8}
            />
            <rect
              x={x - 24}
              y={margin.top + 2 + (i % 2) * 14}
              width={48}
              height={12}
              rx={3}
              fill={color}
              opacity={0.9}
            />
            <text
              x={x}
              y={margin.top + 10.5 + (i % 2) * 14}
              fontSize="7px"
              fontWeight="bold"
              fill="#ffffff"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
            >
              {isRestruct ? 'Restructure' : 'Rebalance'}
            </text>
          </g>
        );
      })}

      {/* Final Value Badges on End of Curves */}
      {n > 0 && (
        <g>
          {/* Current (+81.2%) */}
          <circle
            cx={curPts[n - 1][0]}
            cy={curPts[n - 1][1]}
            r={3.5}
            fill="#dc2626"
            stroke="#ffffff"
            strokeWidth={1.2}
          />
          {/* Past (+89.1%) */}
          <circle
            cx={pastPts[n - 1][0]}
            cy={pastPts[n - 1][1]}
            r={3.5}
            fill="#1d4ed8"
            stroke="#ffffff"
            strokeWidth={1.2}
          />
        </g>
      )}
    </svg>
  );
};
