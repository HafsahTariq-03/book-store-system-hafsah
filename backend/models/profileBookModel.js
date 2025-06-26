import mongoose from 'mongoose';

const profileBookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    publishYear: {
      type: Number,
      required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ProfileBook = mongoose.model('ProfileBook', profileBookSchema); 