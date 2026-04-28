import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    category: { type: String, default: 'general', trim: true },
    description: { type: String, default: '' },
    keywords: { type: [String], default: [] },
    studyMaterial: { type: String, default: '' },
    studyMaterialUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Skill = mongoose.model('Skill', skillSchema);
