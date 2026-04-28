import mongoose from 'mongoose';

const moderationLogSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    text: { type: String, required: true },
    onTopic: { type: Boolean, required: true },
    score: { type: Number, required: true },
    reason: { type: String, default: '' },
  },
  { timestamps: true }
);

export const ModerationLog = mongoose.model('ModerationLog', moderationLogSchema);
