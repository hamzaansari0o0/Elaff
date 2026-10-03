import mongoose from 'mongoose';

const NINETY_DAYS = 90 * 24 * 60 * 60;

const AnalyticsEventSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    path: { type: String, required: true },
    visitorId: { type: String, required: true },
    sessionId: { type: String, required: true },
    referrer: { type: String, default: '' },
    source: { type: String, default: 'direct' },
    country: { type: String, default: '' },
    device: { type: String, default: 'desktop' },
    browser: { type: String, default: 'Other' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    // TTL: Mongo deletes documents 90 days after createdAt.
    createdAt: { type: Date, default: Date.now, index: { expireAfterSeconds: NINETY_DAYS } },
  },
  { versionKey: false }
);

AnalyticsEventSchema.index({ sessionId: 1, createdAt: 1 });

export default mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
