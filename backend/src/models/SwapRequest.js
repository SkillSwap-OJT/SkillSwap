import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    offeredSkill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    requestedSkill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    message: { type: String, default: '', maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  },
  { timestamps: true }
);

export const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);
