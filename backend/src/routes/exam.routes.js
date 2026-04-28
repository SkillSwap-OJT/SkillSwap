import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getExamForSkill,
  myExamHistory,
  submitExam,
} from '../controllers/exam.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/history', myExamHistory);
router.get('/skill/:skillId', getExamForSkill);
router.post('/skill/:skillId/submit', submitExam);

export default router;
