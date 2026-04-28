import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getSkill, listSkills, uploadMaterial } from '../controllers/skill.controller.js';
import { requireAuth } from '../middleware/auth.js';

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve('uploads'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `material-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

const router = Router();

router.get('/', listSkills);
router.get('/:id', getSkill);
router.post('/:id/material', requireAuth, upload.single('file'), uploadMaterial);

export default router;
