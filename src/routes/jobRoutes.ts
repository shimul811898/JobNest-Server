import { Router } from 'express';
import { getAllJobs, getJobById, createJob, updateJob, deleteJob, getRelatedJobs } from '../controllers/jobController';
import { verifyToken, verifyTokenOptional } from '../middleware/auth';

const router = Router();

router.get('/', verifyTokenOptional as any, getAllJobs as any);
router.get('/:id', getJobById as any);
router.get('/:id/related', getRelatedJobs as any);
router.post('/', verifyToken as any, createJob as any);
router.put('/:id', verifyToken as any, updateJob as any);
router.delete('/:id', verifyToken as any, deleteJob as any);

export default router;
