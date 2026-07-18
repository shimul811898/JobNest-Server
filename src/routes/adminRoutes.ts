import { Router } from 'express';
import { verifyToken, verifyAdmin } from '../middleware/auth';
import {
  getAdminStats,
  getAllUsers,
  getAllApplications,
  updateApplicationStatus,
  getAdminAllJobs,
} from '../controllers/adminController';

const router = Router();

// All admin routes require authentication + admin role
router.use(verifyToken as any, verifyAdmin as any);

router.get('/stats', getAdminStats as any);
router.get('/users', getAllUsers as any);
router.get('/applications', getAllApplications as any);
router.patch('/applications/:id/status', updateApplicationStatus as any);
router.get('/jobs', getAdminAllJobs as any);

export default router;
