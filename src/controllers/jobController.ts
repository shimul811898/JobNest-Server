import { Request, Response } from 'express';
import Job from '../models/Job';
import { AuthRequest } from '../types';

export const getAllJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      type,
      experience,
      minSalary,
      maxSalary,
      sort = 'newest',
      page = '1',
      limit = '12',
      postedByMe,
    } = req.query;

    const query: any = {};

    // If postedByMe is true, return only user's jobs (even inactive ones)
    if (postedByMe === 'true' && req.headers.authorization) {
      // Need token verification details
      // Note: verifyToken middleware would populate req.user, but if the endpoint is called from public components, we check if req.user exists
      if (req.user?.userId) {
        query.postedBy = req.user.userId;
      } else {
        res.status(401).json({ message: 'Authentication required for user jobs' });
        return;
      }
    } else {
      query.isActive = true;
    }

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filters
    if (category) query.category = category;
    if (type) query.type = type;
    if (experience) query.experience = experience;
    
    if (minSalary) {
      query['salary.min'] = { $gte: Number(minSalary) };
    }
    if (maxSalary) {
      query['salary.max'] = { $lte: Number(maxSalary) };
    }

    // Sort
    let sortOption: any = { createdAt: -1 };
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'salary_high':
        sortOption = { 'salary.max': -1 };
        break;
      case 'salary_low':
        sortOption = { 'salary.min': 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('postedBy', 'name email avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Job.countDocuments(query),
    ]);

    res.json({
      jobs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email avatar');
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching job' });
  }
};

export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await Job.create({
      ...req.body,
      postedBy: req.user?.userId,
    });
    res.status(201).json(job);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create job' });
  }
};

export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    if (job.postedBy.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to update this job' });
      return;
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedJob);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update job' });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    if (job.postedBy.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to delete this job' });
      return;
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting job' });
  }
};

export const getRelatedJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    const relatedJobs = await Job.find({
      category: job.category,
      _id: { $ne: job._id },
      isActive: true,
    })
      .limit(4)
      .populate('postedBy', 'name email avatar');

    res.json(relatedJobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching related jobs' });
  }
};
