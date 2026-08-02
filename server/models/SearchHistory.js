import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    searchedAt: {
      type: Date,
      default: Date.now,
    },
    searchedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

export default SearchHistory;
