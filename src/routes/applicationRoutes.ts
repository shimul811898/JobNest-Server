import { Router } from 'express';
import { applyToJob, getMyApplications } from '../controllers/applicationController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.post('/', verifyToken as any, applyToJob as any);
router.get('/my', verifyToken as any, getMyApplications as any);

export default router;
