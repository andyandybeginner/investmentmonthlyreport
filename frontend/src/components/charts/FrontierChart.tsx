import React from 'react';
import { Language } from '../../types';

interface FrontierChartProps {
  lang?: Language;
  width?: number;
  height?: number;
}

export const FrontierChart: React.FC<FrontierChartProps> = ({
  lang = 'zh',
  width = 740,
  height = 480,
}) => {
  const isEn = lang === 'en';
  const margin = { top: 32, right: 35, bottom: 42, left: 52 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const xMin = 5.0;
  const xMax = 21.0;
  const yMin = -5.0;
  const yMax = 18.0;

  const getX = (val: number) => {
    return margin.left + (plotW * (val - xMin)) / (xMax - xMin);
  };

  const getY = (val: number) => {
    return margin.top + (plotH * (yMax - val)) / (yMax - yMin);
  };

  const d2025 = [
    { x: 10.5, y: -2.5, label: '100% Bonds', zh: '100% 债券' },
    { x: 12.1, y: 2.5, label: '25/75', zh: '25/75' },
    { x: 13.9, y: 6.8, label: '50/50', zh: '50/50' },
    { x: 15.2, y: 8.9, label: '60/40', zh: '60/40' },
    { x: 16.0, y: 10.4, label: '70/30', zh: '70/30' },
    { x: 17.3, y: 12.1, label: '80/20', zh: '80/20' },
    { x: 19.3, y: 15.8, label: '100% Stocks', zh: '100% 股票' },
  ];

  const d2020 = [
    { x: 8.5, y: 6.8, label: '100% Bonds', zh: '100% 债券' },
    { x: 7.8, y: 8.4, label: '25/75', zh: '25/75' },
    { x: 8.8, y: 9.8, label: '50/50', zh: '50/50' },
    { x: 10.0, y: 10.2, label: '60/40', zh: '60/40' },
    { x: 11.8, y: 10.7, label: '70/30', zh: '70/30' },
    { x: 13.2, y: 11.2, label: '80/20', zh: '80/20' },
    { x: 15.6, y: 12.3, label: '100% Stocks', zh: '100% 股票' },
  ];

  const makePath = (pts: { x: number; y: number }[]) => {
    const coords = pts.map((p) => [getX(p.x), getY(p.y)]);
    let d = `M ${coords[0][0].toFixed(2)} ${coords[0][1].toFixed(2)}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = i > 0 ? coords[i - 1] : coords[i];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = i + 2 < coords.length ? coords[i + 2] : p2;
      const tension = 0.12;
      const cp1X = p1[0] + (p2[0] - p0[0]) * tension;
      const cp1Y = p1[1] + (p2[1] - p0[1]) * tension;
      const cp2X = p2[0] - (p3[0] - p1[0]) * tension;
      const cp2Y = p2[1] - (p3[1] - p1[1]) * tension;
      d += ` C ${cp1X.toFixed(2)} ${cp1Y.toFixed(2)}, ${cp2X.toFixed(2)} ${cp2Y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
    }
    return d;
  };

  const path2025 = makePath(d2025);
  const path2020 = makePath(d2020);

  const yVals = [-4, 0, 4, 8, 12, 16];
  const xVals = [6, 8, 10, 12, 14, 16, 18, 20];

  const xAxisLabel = isEn ? 'Annualized Volatility / Risk (%)' : '年化波动率 / 风险 (%)';
  const yAxisLabel = isEn ? 'Annualized Return (%)' : '年化回报率 (%)';

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full block select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Horizontal Grid */}
      {yVals.map((yVal) => {
        const y = getY(yVal);
        const isZero = yVal === 0;
        return (
          <g key={yVal}>
            <line
              x1={margin.left}
              y1={y}
              x2={width - margin.right}
              y2={y}
              stroke={isZero ? '#94a3b8' : '#e2e8f0'}
              strokeWidth={isZero ? 1.4 : 0.9}
              strokeDasharray={isZero ? undefined : '3,3'}
            />
            <text
              x={margin.left - 8}
              y={y + 4}
              fontSize="10.5px"
              fill={isZero ? '#334155' : '#64748b'}
              textAnchor="end"
              fontWeight={isZero ? '700' : '500'}
              fontFamily="system-ui, sans-serif"
            >
              {yVal}%
            </text>
          </g>
        );
      })}

      {/* Vertical Grid */}
      {xVals.map((xVal) => {
        const x = getX(xVal);
        return (
          <g key={xVal}>
            <line
              x1={x}
              y1={margin.top}
              x2={x}
              y2={margin.top + plotH}
              stroke="#e2e8f0"
              strokeWidth={0.9}
              strokeDasharray="3,3"
            />
            <text
              x={x}
              y={margin.top + plotH + 16}
              fontSize="10.5px"
              fill="#64748b"
              textAnchor="middle"
              fontWeight="500"
              fontFamily="system-ui, sans-serif"
            >
              {xVal}%
            </text>
          </g>
        );
      })}

      {/* Axis Labels */}
      <text
        x={margin.left + plotW / 2}
        y={height - 6}
        fontSize="11.5px"
        fill="#334155"
        textAnchor="middle"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
      >
        {xAxisLabel}
      </text>
      <text
        x={margin.left + 8}
        y={margin.top - 12}
        fontSize="11.5px"
        fill="#334155"
        textAnchor="start"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
      >
        {yAxisLabel}
      </text>

      {/* Explanatory Contrast Badges on Top Left of Chart */}
      <g>
        {/* 1986-2020 Annotation Box */}
        <rect
          x={margin.left + 10}
          y={margin.top + 6}
          width={isEn ? 320 : 275}
          height={24}
          rx={6}
          fill="#eff6ff"
          stroke="#bfdbfe"
          strokeWidth={1}
        />
        <text
          x={margin.left + 20}
          y={margin.top + 22}
          fontSize="9.5px"
          fontWeight="bold"
          fill="#1e3a8a"
          fontFamily="system-ui, sans-serif"
        >
          {isEn
            ? '● 1986-2020: Convex curve (bonds reduced risk, min at 25/75)'
            : '● 1986-2020 凸前沿：加入债券有效减震（最低波动在25/75）'}
        </text>

        {/* 2021-2025 Annotation Box */}
        <rect
          x={margin.left + 10}
          y={margin.top + 34}
          width={isEn ? 320 : 275}
          height={24}
          rx={6}
          fill="#fef2f2"
          stroke="#fecaca"
          strokeWidth={1}
        />
        <text
          x={margin.left + 20}
          y={margin.top + 50}
          fontSize="9.5px"
          fontWeight="bold"
          fill="#991b1b"
          fontFamily="system-ui, sans-serif"
        >
          {isEn
            ? '● 2021-2025: Linear drag (bonds cut returns, not risk; pure bond negative)'
            : '● 2021-2025 平直前沿：配置债券降收益未降风险（纯债回报为负）'}
        </text>
      </g>

      {/* 1986-2020 Curve (Blue solid) */}
      <path
        d={path2020}
        fill="none"
        stroke="#1e3a8a"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 2021-2025 Curve (Red solid) */}
      <path
        d={path2025}
        fill="none"
        stroke="#dc2626"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 1986-2020 Points */}
      {d2020.map((p, idx) => {
        const px = getX(p.x);
        const py = getY(p.y);
        const lbl = isEn ? p.label : p.zh;
        let tx = px + 8;
        let ty = py - 7;
        let anchor: 'start' | 'end' | 'middle' = 'start';
        if (idx === 0) {
          tx = px - 9;
          ty = py - 3;
          anchor = 'end';
        } else if (idx === 1) {
          tx = px - 8;
          ty = py - 6;
          anchor = 'end';
        } else if (idx === 2) {
          tx = px - 4;
          ty = py - 9;
          anchor = 'end';
        } else if (idx === 3) {
          tx = px;
          ty = py - 9;
          anchor = 'middle';
        } else if (idx === d2020.length - 1) {
          tx = px + 8;
          ty = py - 8;
          anchor = 'start';
        }
        return (
          <g key={`2020-${idx}`}>
            <circle cx={px} cy={py} r={5} fill="#1e3a8a" stroke="#ffffff" strokeWidth={1.8} />
            <text
              x={tx}
              y={ty}
              fontSize="10px"
              fontWeight="bold"
              fill="#1e3a8a"
              textAnchor={anchor}
              fontFamily="system-ui, sans-serif"
            >
              {lbl}
            </text>
          </g>
        );
      })}

      {/* 2021-2025 Points */}
      {d2025.map((p, idx) => {
        const px = getX(p.x);
        const py = getY(p.y);
        const lbl = isEn ? p.label : p.zh;
        let tx = px + 9;
        let ty = py + 4;
        let anchor: 'start' | 'end' | 'middle' = 'start';
        if (idx === 0) {
          tx = px - 9;
          ty = py + 4;
          anchor = 'end';
        } else if (idx === d2025.length - 1) {
          tx = px + 9;
          ty = py + 4;
        } else if (idx === 3) {
          // 60/40
          tx = px + 9;
          ty = py + 4;
        }
        return (
          <g key={`2025-${idx}`}>
            <circle cx={px} cy={py} r={5} fill="#dc2626" stroke="#ffffff" strokeWidth={1.8} />
            <text
              x={tx}
              y={ty}
              fontSize="10px"
              fontWeight="bold"
              fill="#dc2626"
              textAnchor={anchor}
              fontFamily="system-ui, sans-serif"
            >
              {lbl}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
