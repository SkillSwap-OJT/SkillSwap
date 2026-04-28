import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    options: {
      type: [String],
      validate: [(arr) => arr.length >= 2 && arr.length <= 6, 'Need 2–6 options'],
      required: true,
    },
    correctIndex: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const examSchema = new mongoose.Schema(
  {
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    passingScore: { type: Number, default: 70, min: 0, max: 100 },
    durationMinutes: { type: Number, default: 15 },
    questions: { type: [questionSchema], default: [] },
  },
  { timestamps: true }
);

examSchema.methods.toCandidateJSON = function () {
  return {
    id: this._id.toString(),
    skill: this.skill,
    title: this.title,
    description: this.description,
    passingScore: this.passingScore,
    durationMinutes: this.durationMinutes,
    questions: this.questions.map((q) => ({
      id: q._id.toString(),
      text: q.text,
      options: q.options,
    })),
  };
};

export const Exam = mongoose.model('Exam', examSchema);
