'use client';

import { useEffect, useState } from 'react';
import TrafficChart from '@/components/admin/analytics/TrafficChart';
import StatTable from '@/components/admin/analytics/StatTable';

const RANGES = [
  { value: '1d', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

const pct = (n) => `${(n * 100).toFixed(1)}%`;
const dur = (s) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);
const pageCol = { key: 'path', label: 'Page' };

function Kpi({ label, value, hint }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState('7d');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/analytics?range=${range}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Could not load analytics');
        return res.json();
      })
      .then((json) => !cancelled && setData(json))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [range]);

  function changeRange(value) {
    if (value === range) return;
    setLoading(true);
    setError('');
    setRange(value);
  }

  const k = data?.kpis;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-fraunces text-2xl font-black text-gray-900">Analytics</h1>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => changeRange(r.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                range === r.value ? 'bg-brand-navy text-white' : 'text-gray-600 hover:bg-slate-50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}

      {!data && loading && <p className="text-sm text-gray-400">Loading…</p>}

      {data && (
        <div className={`space-y-6 transition-opacity ${loading ? 'opacity-60' : ''}`}>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Kpi label="Visitors" value={k.visitors} />
            <Kpi label="Sessions" value={k.sessions} />
            <Kpi label="Page views" value={k.pageviews} />
            <Kpi label="Bounce rate" value={pct(k.bounceRate)} hint="1 page, no action, under 10s" />
            <Kpi label="Avg. session" value={dur(k.avgDurationSec)} />
          </div>

          {k.sessions === 0 && (
            <p className="text-sm text-gray-500 bg-white border border-gray-200 rounded-xl px-5 py-4">
              No visits recorded in this period yet. Visits by you while logged in to the admin panel are not counted.
            </p>
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-black text-gray-900 mb-3">
              {data.range.bucket === 'hour' ? 'Hourly traffic' : 'Daily traffic'}
            </h2>
            <TrafficChart series={data.series} />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-black text-gray-900 mb-3">Conversion funnel</h2>
            <div className="space-y-2">
              {data.funnel.map((f) => (
                <div key={f.step} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span className="sm:w-40 text-xs font-semibold text-gray-600 shrink-0">{f.label}</span>
                  <div className="flex-1 h-6 w-full bg-slate-100 rounded overflow-hidden">
                    <div className="h-full bg-brand-navy" style={{ width: `${Math.max(f.pct * 100, f.sessions ? 1 : 0)}%` }} />
                  </div>
                  <span className="sm:w-24 sm:text-right text-xs tabular-nums text-gray-700">{f.sessions} · {pct(f.pct)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <StatTable
              title="Top pages"
              columns={[pageCol, { key: 'views', label: 'Views', align: 'right' }, { key: 'visitors', label: 'Visitors', align: 'right' }]}
              rows={data.topPages}
              barKey="views"
            />
            <StatTable
              title="Landing pages"
              subtitle="Where visits start. High bounce + zero leads = the page to fix."
              columns={[
                pageCol,
                { key: 'sessions', label: 'Sessions', align: 'right' },
                { key: 'bounceRate', label: 'Bounce', align: 'right', render: (r) => pct(r.bounceRate) },
                { key: 'leads', label: 'Leads', align: 'right' },
              ]}
              rows={data.landingPages}
              barKey="sessions"
            />
            <StatTable
              title="Events"
              columns={[{ key: 'name', label: 'Event' }, { key: 'count', label: 'Count', align: 'right' }, { key: 'visitors', label: 'Visitors', align: 'right' }]}
              rows={data.events}
              barKey="count"
            />
            <StatTable title="Traffic sources" columns={[{ key: 'name', label: 'Source' }, { key: 'sessions', label: 'Sessions', align: 'right' }]} rows={data.sources} barKey="sessions" />
            <StatTable title="Countries" columns={[{ key: 'name', label: 'Country' }, { key: 'sessions', label: 'Sessions', align: 'right' }]} rows={data.countries} barKey="sessions" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatTable title="Devices" columns={[{ key: 'name', label: 'Device' }, { key: 'sessions', label: 'Sessions', align: 'right' }]} rows={data.devices} />
              <StatTable title="Browsers" columns={[{ key: 'name', label: 'Browser' }, { key: 'sessions', label: 'Sessions', align: 'right' }]} rows={data.browsers} />
            </div>
          </div>

          <StatTable
            title="Recent visitors"
            subtitle="Latest 50 sessions"
            columns={[
              { key: 'start', label: 'When', render: (r) => new Date(r.start).toLocaleString() },
              { key: 'country', label: 'Country', render: (r) => r.country || '—' },
              { key: 'device', label: 'Device', render: (r) => `${r.device} · ${r.browser}` },
              { key: 'source', label: 'Source' },
              { key: 'paths', label: 'Pages viewed', render: (r) => r.paths.join('  →  ') },
              { key: 'types', label: 'Events', render: (r) => r.types.filter((t) => t !== 'scroll_depth').join(', ') || '—' },
              { key: 'durationSec', label: 'Time', align: 'right', render: (r) => (r.isBounce ? `${dur(r.durationSec)} (bounce)` : dur(r.durationSec)) },
            ]}
            rows={data.recent}
          />
        </div>
      )}
    </div>
  );
}
