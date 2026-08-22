import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import CompanySettings from '@/models/CompanySettings';

async function getOrCreateSettings() {
  let settings = await CompanySettings.findOne();
  if (!settings) settings = await CompanySettings.create({});
  return settings;
}

// Public: the storefront's supplier card reads this on every product page.
export async function GET() {
  await connectDB();
  const settings = await getOrCreateSettings();
  return NextResponse.json(settings);
}

// Admin-only: edited from /admin/settings.
export async function PUT(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const body = await request.json();
  const settings = await getOrCreateSettings();

  Object.assign(settings, {
    companyName: body.companyName ?? settings.companyName,
    verified: body.verified ?? settings.verified,
    verifiedLabel: body.verifiedLabel ?? settings.verifiedLabel,
    country: body.country ?? settings.country,
    yearEstablished: body.yearEstablished ?? settings.yearEstablished,
    businessTypes: body.businessTypes ?? settings.businessTypes,
    mainProducts: body.mainProducts ?? settings.mainProducts,
    exportMarkets: body.exportMarkets ?? settings.exportMarkets,
    responseTime: body.responseTime ?? settings.responseTime,
    onTimeDelivery: body.onTimeDelivery ?? settings.onTimeDelivery,
    phone: body.phone ?? settings.phone,
    whatsapp: body.whatsapp ?? settings.whatsapp,
    email: body.email ?? settings.email,
    certifications: body.certifications ?? settings.certifications,
    shippingInfo: body.shippingInfo ?? settings.shippingInfo,
    paymentInfo: body.paymentInfo ?? settings.paymentInfo,
  });

  await settings.save();
  return NextResponse.json(settings);
}
