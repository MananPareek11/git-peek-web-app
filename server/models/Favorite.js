import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuthUser',
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user cannot duplicate the exact same favorited user
favoriteSchema.index({ userId: 1, username: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;
