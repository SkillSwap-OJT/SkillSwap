import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 2000 },
    flagged: { type: Boolean, default: false },
    moderation: {
      onTopic: { type: Boolean, default: true },
      score: { type: Number, default: 1 },
      reason: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

messageSchema.index({ session: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);
