import mongoose, { Schema } from 'mongoose';
import { IJob } from '../types';

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: [true, 'Title is required'] },
    company: { type: String, required: [true, 'Company is required'] },
    companyLogo: { type: String },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: [200, 'Short description cannot exceed 200 characters'],
    },
    description: { type: String, required: [true, 'Description is required'] },
    requirements: [{ type: String }],
    responsibilities: [{ type: String }],
    location: { type: String, required: [true, 'Location is required'] },
    salary: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
    },
    category: {
      type: String,
      required: true,
      enum: ['Technology', 'Finance', 'Marketing', 'Healthcare', 'Education', 'Design', 'Sales', 'Engineering', 'Legal', 'Other'],
    },
    type: {
      type: String,
      required: true,
      enum: ['Remote', 'Onsite', 'Hybrid'],
    },
    experience: {
      type: String,
      required: true,
      enum: ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Director'],
    },
    skills: [{ type: String }],
    benefits: [{ type: String }],
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: { type: Boolean, default: true },
    applicationDeadline: { type: Date },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', company: 'text', description: 'text' });

export default mongoose.model<IJob>('Job', jobSchema);
