import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js"
import authRoutes from "./routes/authentication.js"
import emotionRoutes from "./routes/emotion.js"
import path from "path";
import { fileURLToPath } from "url";
import songRoutes from "./routes/songs.js";


dotenv.config()

const app = express()

// __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Middleware to parse JSON
app.use(express.json())

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "../frontend")));

// Connect Database 
connectDB()

// Routes 
app.use("/auth/", authRoutes)
app.use("/emotion/", emotionRoutes)
app.use("/songs/", songRoutes);

// Frontend Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/signup.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening PORT ${PORT}`)
});


console.log("Mongo URL:", process.env.MONGO_URL);
