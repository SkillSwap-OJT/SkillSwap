import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true }
);

ratingSchema.index({ session: 1, fromUser: 1 }, { unique: true });

export const Rating = mongoose.model('Rating', ratingSchema);
