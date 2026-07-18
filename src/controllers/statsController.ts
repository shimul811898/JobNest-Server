import { Request, Response } from 'express';
import Job from '../models/Job';
import User from '../models/User';

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalJobs, totalUsers, companies, categoryCounts] = await Promise.all([
      Job.countDocuments({ isActive: true }),
      User.countDocuments(),
      Job.distinct('company'),
      Job.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    const categoryMap: Record<string, number> = {};
    categoryCounts.forEach((item: { _id: string; count: number }) => {
      categoryMap[item._id] = item.count;
    });

    res.json({
      totalJobs,
      totalCompanies: companies.length,
      totalUsers,
      categoryCounts: categoryMap,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};
