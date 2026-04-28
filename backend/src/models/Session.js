import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ],
    skillFromA: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    skillFromB: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    teacherUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    learnerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    teacherSkill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    learnerSkill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    swapRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'SwapRequest' },
    status: {
      type: String,
      enum: ['active', 'completed', 'flagged', 'cancelled'],
      default: 'active',
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    moderationStrikes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

sessionSchema.index({ participants: 1, status: 1 });

export const Session = mongoose.model('Session', sessionSchema);
