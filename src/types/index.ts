import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  avatar?: string;
  phone?: string;
  bio?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ISalary {
  min: number;
  max: number;
  currency: string;
}

export interface IJob extends Document {
  _id: Types.ObjectId;
  title: string;
  company: string;
  companyLogo?: string;
  shortDescription: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  salary: ISalary;
  category: string;
  type: string;
  experience: string;
  skills: string[];
  benefits: string[];
  postedBy: Types.ObjectId;
  isActive: boolean;
  applicationDeadline?: Date;
}

export interface IApplication extends Document {
  _id: Types.ObjectId;
  jobId: Types.ObjectId;
  userId: Types.ObjectId;
  coverLetter: string;
  resumeUrl?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
}

export interface JwtPayload {
  userId: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
