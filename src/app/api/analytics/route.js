import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import AnalyticsEvent from '@/models/AnalyticsEvent';
import { rangeBounds, buildReport } from '@/lib/analyticsMetrics.mjs';

const MAX_EVENTS = 200_000;

// Admin-only: aggregated traffic report for the Analytics tab.
export async function GET(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const range = request.nextUrl.searchParams.get('range');
  const bounds = rangeBounds(range);

  await connectDB();
  const events = await AnalyticsEvent.find({ createdAt: { $gte: new Date(bounds.from), $lte: new Date(bounds.to) } })
    .select('type path visitorId sessionId createdAt source country device browser meta -_id')
    .sort({ createdAt: -1 })
    .limit(MAX_EVENTS)
    .lean();

  return NextResponse.json(buildReport(events, bounds));
}
