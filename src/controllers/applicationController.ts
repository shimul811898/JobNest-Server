import { Response } from 'express';
import Application from '../models/Application';
import Job from '../models/Job';
import { AuthRequest } from '../types';

export const applyToJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobId, coverLetter, resumeUrl } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    const existingApplication = await Application.findOne({
      jobId,
      userId: req.user?.userId,
    });
    if (existingApplication) {
      res.status(400).json({ message: 'You have already applied to this job' });
      return;
    }

    const application = await Application.create({
      jobId,
      userId: req.user?.userId,
      coverLetter: coverLetter || '',
      resumeUrl: resumeUrl || '',
    });

    res.status(201).json(application);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to submit application' });
  }
};

export const getMyApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const applications = await Application.find({ userId: req.user?.userId })
      .populate({
        path: 'jobId',
        select: 'title company location salary type companyLogo',
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching applications' });
  }
};
