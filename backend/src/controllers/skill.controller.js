import { Skill } from '../models/Skill.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listSkills = asyncHandler(async (req, res) => {
  const { q, category } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (q) filter.name = { $regex: q, $options: 'i' };
  const skills = await Skill.find(filter).sort({ name: 1 }).limit(200);
  res.json({ skills });
});

export const getSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  if (!skill) return res.status(404).json({ error: 'Skill not found' });
  res.json({ skill });
});

export const uploadMaterial = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const user = await User.findById(req.user.id);
  if (!user || !['teacher', 'both'].includes(user.intent)) {
    return res.status(403).json({ error: 'Only teachers can upload study material' });
  }
  const skill = await Skill.findById(req.params.id);
  if (!skill) return res.status(404).json({ error: 'Skill not found' });

  // Store the relative URL path to the uploaded file
  skill.studyMaterialUrl = `/uploads/${req.file.filename}`;
  await skill.save();

  res.json({ skill, message: 'Study material uploaded successfully' });
});
