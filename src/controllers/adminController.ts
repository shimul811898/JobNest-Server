import { Response } from 'express';
import User from '../models/User';
import Job from '../models/Job';
import Application from '../models/Application';
import { AuthRequest } from '../types';

// GET /api/admin/stats — Admin dashboard summary
export const getAdminStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      activeJobs,
      companies,
      categoryCounts,
      typeCounts,
      recentApplications,
    ] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      Job.countDocuments({ isActive: true }),
      Job.distinct('company'),
      Job.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Job.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      Application.find()
        .populate({ path: 'userId', select: 'name email avatar' })
        .populate({ path: 'jobId', select: 'title company' })
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const categoryMap: Record<string, number> = {};
    categoryCounts.forEach((item: { _id: string; count: number }) => {
      categoryMap[item._id] = item.count;
    });

    const typeMap: Record<string, number> = {};
    typeCounts.forEach((item: { _id: string; count: number }) => {
      typeMap[item._id] = item.count;
    });

    res.json({
      totalUsers,
      totalJobs,
      totalApplications,
      activeJobs,
      inactiveJobs: totalJobs - activeJobs,
      totalCompanies: companies.length,
      categoryCounts: categoryMap,
      typeCounts: typeMap,
      recentApplications,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching admin stats' });
  }
};

// GET /api/admin/users — List all users
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    res.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// GET /api/admin/applications — List all applications
export const getAllApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate({ path: 'userId', select: 'name email avatar role' })
        .populate({ path: 'jobId', select: 'title company companyLogo location salary type' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(query),
    ]);

    res.json({
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching applications' });
  }
};

// PATCH /api/admin/applications/:id/status — Update application status
export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate({ path: 'userId', select: 'name email avatar' })
      .populate({ path: 'jobId', select: 'title company' });

    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating application status' });
  }
};

// GET /api/admin/jobs — List ALL jobs (active + inactive)
export const getAdminAllJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('postedBy', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(query),
    ]);

    res.json({
      jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching all jobs' });
  }
};
