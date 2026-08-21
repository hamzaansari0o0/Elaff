import mongoose from 'mongoose';

const InquiryItemSchema = new mongoose.Schema(
  {
    productTitle: { type: String, required: true },
    productSlug: { type: String, default: '' },
    quantity: { type: String, required: true },
  },
  { _id: false }
);

const InquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    message: { type: String, default: '' },
    items: { type: [InquiryItemSchema], required: true },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

export default mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
