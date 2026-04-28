import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const skillEntrySchema = new mongoose.Schema(
  {
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    bio: { type: String, default: '', maxlength: 500 },
    avatarUrl: { type: String, default: '' },
    college: { type: String, default: '', trim: true },
    intent: { type: String, enum: ['learner', 'teacher', 'both'], default: 'both' },
    skillsOffered: { type: [skillEntrySchema], default: [] },
    skillsWanted: { type: [skillEntrySchema], default: [] },
    onboarded: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    moderationStrikes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 10);
};

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    bio: this.bio,
    avatarUrl: this.avatarUrl,
    college: this.college,
    intent: this.intent,
    skillsOffered: this.skillsOffered,
    skillsWanted: this.skillsWanted,
    onboarded: this.onboarded,
    averageRating: this.averageRating,
    ratingsCount: this.ratingsCount,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);
