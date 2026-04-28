import mongoose from 'mongoose';

const examResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    passed: { type: Boolean, required: true },
    answers: { type: [Number], default: [] },
    takenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

examResultSchema.index({ user: 1, skill: 1, takenAt: -1 });

export const ExamResult = mongoose.model('ExamResult', examResultSchema);
