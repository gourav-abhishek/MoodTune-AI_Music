import express from "express";
import multer from "multer";
import authorize from "../middleware/authorization.js";
import Song from "../models/Songs.js";
import User from "../models/Users.js";
import path from "path";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Audio files
    if (file.fieldname === 'audio') {
      const audioTypes = /mp3|mpeg|wav|ogg/;
      const extname = audioTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = audioTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed (mp3, wav, ogg)'));
      }
    }
    
    // Image files
    if (file.fieldname === 'image') {
      const imageTypes = /jpeg|jpg|png|gif/;
      const extname = imageTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = imageTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
      }
    }
  }
});

// Check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload new song (Admin only)
router.post("/upload", 
  authorize, 
  isAdmin, 
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]), 
  async (req, res) => {
    try {
      const { title, artist, description, labels, duration } = req.body;
      
      if (!req.files || !req.files.audio) {
        return res.status(400).json({ message: "Audio file is required" });
      }

      // Parse labels if it's a string
      let labelArray;
      if (typeof labels === 'string') {
        labelArray = JSON.parse(labels);
      } else {
        labelArray = labels;
      }

      // Validate labels
      const validLabels = ['Fun', 'Sadness', 'Angry', 'Love', 'General', 'Motivation'];
      if (!labelArray.every(label => validLabels.includes(label))) {
        return res.status(400).json({ message: "Invalid emotion label(s)" });
      }

      const audioFile = req.files.audio[0];
      const imageFile = req.files.image ? req.files.image[0] : null;

      const song = new Song({
        title,
        artist,
        description,
        labels: labelArray,
        duration: parseInt(duration) || 0,
        uploadedBy: req.user.id,
        audioFile: {
          data: audioFile.buffer,
          contentType: audioFile.mimetype,
          filename: audioFile.originalname
        },
        imageFile: imageFile ? {
          data: imageFile.buffer,
          contentType: imageFile.mimetype,
          filename: imageFile.originalname
        } : null
      });

      await song.save();
      
      res.status(201).json({
        message: "Song uploaded successfully",
        songId: song._id,
        title: song.title
      });
      
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get songs by emotion/label
router.get("/by-emotion/:emotion", authorize, async (req, res) => {
  try {
    const { emotion } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate emotion
    const validEmotions = ['Fun', 'Sadness', 'Angry', 'Love', 'General', 'Motivation'];
    if (!validEmotions.includes(emotion)) {
      return res.status(400).json({ message: "Invalid emotion" });
    }

    const songs = await Song.find({ labels: emotion })
      .select('-audioFile.data -imageFile.data') // Don't send file data in list
      .populate('uploadedBy', 'name email')
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Song.countDocuments({ labels: emotion });

    res.json({
      songs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSongs: total
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all songs (for admin)
router.get("/all", authorize, isAdmin, async (req, res) => {
  try {
    const songs = await Song.find()
      .select('-audioFile.data -imageFile.data')
      .populate('uploadedBy', 'name email')
      .sort({ uploadDate: -1 });

    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific song with file data
router.get("/:id", authorize, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('uploadedBy', 'name email');

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    res.json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get audio file stream
router.get("/audio/:id", authorize, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).select('audioFile');

    if (!song || !song.audioFile.data) {
      return res.status(404).json({ message: "Audio file not found" });
    }

    // Set appropriate headers
    res.set({
      'Content-Type': song.audioFile.contentType,
      'Content-Length': song.audioFile.data.length,
      'Content-Disposition': `inline; filename="${song.audioFile.filename}"`
    });

    // Send the audio buffer
    res.send(song.audioFile.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get image file
router.get("/image/:id", authorize, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).select('imageFile');

    if (!song || !song.imageFile || !song.imageFile.data) {
      // Return default image if no image exists
      return res.redirect('/default-music-image.png');
    }

    res.set({
      'Content-Type': song.imageFile.contentType,
      'Content-Length': song.imageFile.data.length,
      'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
    });

    res.send(song.imageFile.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update play count
router.post("/:id/play", authorize, async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { $inc: { plays: 1 } },
      { new: true }
    );

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    res.json({ plays: song.plays });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like a song
router.post("/:id/like", authorize, async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    res.json({ likes: song.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete song (Admin only)
router.delete("/:id", authorize, isAdmin, async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    res.json({ message: "Song deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;