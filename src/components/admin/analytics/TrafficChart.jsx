'use client';

import { useState } from 'react';

// series: [{ key, visitors, pageviews }]; key is 'YYYY-MM-DD' or 'YYYY-MM-DDTHH'.
function label(key) {
  return key.length > 10 ? `${key.slice(11)}:00` : key.slice(5);
}

export default function TrafficChart({ series }) {
  const [hover, setHover] = useState(null);
  const W = 800;
  const H = 220;
  const pad = { l: 36, r: 8, t: 12, b: 24 };
  const max = Math.max(1, ...series.map((d) => Math.max(d.pageviews, d.visitors)));
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const step = innerW / Math.max(1, series.length);
  const barW = Math.max(2, step * 0.6);
  const y = (v) => pad.t + innerH - (v / max) * innerH;
  const x = (i) => pad.l + i * step + step / 2;
  const line = series.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d.visitors)}`).join(' ');
  const every = Math.ceil(series.length / 8);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Daily traffic">
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(max * t)} y2={y(max * t)} stroke="#E2E8F0" />
            <text x={pad.l - 6} y={y(max * t) + 3} textAnchor="end" fontSize="10" fill="#94A3B8">
              {Math.round(max * t)}
            </text>
          </g>
        ))}
        {series.map((d, i) => (
          <rect key={d.key} x={x(i) - barW / 2} y={y(d.pageviews)} width={barW} height={pad.t + innerH - y(d.pageviews)} fill="#CBD5E1" rx="2" />
        ))}
        <path d={line} fill="none" stroke="#0F172A" strokeWidth="2" />
        {series.map((d, i) => (
          <g key={`p-${d.key}`}>
            <circle cx={x(i)} cy={y(d.visitors)} r={hover === i ? 4 : 2.5} fill="#0F172A" />
            {i % every === 0 && (
              <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#94A3B8">
                {label(d.key)}
              </text>
            )}
            <rect x={x(i) - step / 2} y={pad.t} width={step} height={innerH} fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
          </g>
        ))}
      </svg>
      {hover !== null && series[hover] && (
        <div className="absolute top-0 right-0 bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-xs">
          <p className="font-bold text-gray-900">{label(series[hover].key)}</p>
          <p className="text-gray-600">Visitors: <b>{series[hover].visitors}</b></p>
          <p className="text-gray-600">Page views: <b>{series[hover].pageviews}</b></p>
        </div>
      )}
      <div className="flex items-center gap-4 mt-2 text-[11px] font-semibold text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-300" /> Page views</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-slate-900" /> Visitors</span>
      </div>
    </div>
  );
}
