import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuthUser',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['profile', 'repository'],
      required: true,
    },
    targetId: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: '',
    },
    stars: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user cannot duplicate the exact same targetId bookmark
bookmarkSchema.index({ userId: 1, targetId: 1 }, { unique: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

export default Bookmark;
