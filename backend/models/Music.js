import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    artist: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    audioFile: {
      data: Buffer,
      contentType: String,
      filename: String
    },
    imageFile: {
      data: Buffer,
      contentType: String,
      filename: String
    },
    labels: {
      type: [String],
      enum: ['Fun', 'Sadness', 'Angry', 'Love', 'General', 'Motivation'],
      required: true
    },
    duration: {
      type: Number, // Duration in seconds
      default: 0
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    plays: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Index for faster queries by labels
songSchema.index({ labels: 1 });
songSchema.index({ uploadDate: -1 });

const Song = mongoose.model("Song", songSchema);
export default Song;