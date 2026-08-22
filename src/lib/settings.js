import { connectDB } from './mongodb';
import CompanySettings from '@/models/CompanySettings';

export async function getCompanySettings() {
  await connectDB();
  let settings = await CompanySettings.findOne().lean();
  if (!settings) settings = await CompanySettings.create({});
  return JSON.parse(JSON.stringify(settings));
}
