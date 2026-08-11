import mongoose from 'mongoose'

const progressEventSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    type: {
      type: String,
      enum: ['section_view', 'quiz_correct', 'exploration', 'mesa_round'],
      required: true,
    },
    section: { type: String, required: true },
    points: { type: Number, required: true, min: 0 },
    earnedAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const userSchema = new mongoose.Schema(
  {
    displayName: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    profileImage: { type: String, default: '', select: false },
    points: { type: Number, default: 0, min: 0, index: true },
    progress: { type: [progressEventSchema], default: [] },
  },
  { timestamps: true },
)

userSchema.index({ points: -1, createdAt: 1 })

export default mongoose.model('User', userSchema)
