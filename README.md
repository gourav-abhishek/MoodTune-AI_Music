# 🎵 MoodTune AI - Emotion-Powered Music

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18.x-green" alt="Node.js">
  <img src="https://img.shields.io/badge/FastAPI-0.104-blue" alt="FastAPI">
  <img src="https://img.shields.io/badge/PyTorch-2.1-red" alt="PyTorch">
  <img src="https://img.shields.io/badge/MongoDB-7.0-green" alt="MongoDB">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
</p>

<img width="921" height="860" alt="image1" src="https://github.com/user-attachments/assets/ba5fbad9-8f5c-4b08-84e7-e0dee32d908b" />
<img width="1920" height="862" alt="image" src="https://github.com/user-attachments/assets/13abe1be-3969-461c-881f-7c2590449995" />


<p align="center">
  <strong>Where emotions meet melodies</strong><br>
  An AI-powered music recommendation system that understands your feelings
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/your-username/your-repo/main/screenshots/demo.gif" alt="MoodTune AI Demo" width="800">
</p>

## ✨ Features

### 🧠 **Smart Emotion Detection**
- **NLP-Powered Analysis**: Uses fine-tuned DistilBERT model to detect 6 emotions from text
- **Real-time Processing**: Get instant mood analysis as you type
- **Multi-label Classification**: Detects multiple emotions simultaneously

### 🎵 **Personalized Music Experience**
- **Mood-Based Recommendations**: Songs curated based on detected emotions
- **Smart Playlists**: Dynamic playlists that adapt to your current mood
- **Music Player**: Built-in player with play, pause, like, and history features

### 🔐 **Secure & User-Friendly**
- **JWT Authentication**: Secure login/signup with token-based authentication
- **Admin Dashboard**: Special interface for uploading and managing music library
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### 🎨 **Modern Interface**
- **Light/Dark Mode**: Toggle between themes based on preference
- **Real-time Visualizations**: Charts showing mood patterns and listening habits
- **Smooth Animations**: Fluid transitions and interactive elements

## 🎯 Detected Emotions

| Emotion | Icon | Description | Sample Music |
|---------|------|-------------|--------------|
| **Fun** | 😄 | Happy, cheerful, excited | Upbeat pop, dance music |
| **Sadness** | 😢 | Melancholic, reflective | Slow ballads, acoustic |
| **Angry** | 😠 | Frustrated, energetic | Rock, metal, intense beats |
| **Love** | ❤️ | Romantic, affectionate | Love songs, romantic melodies |
| **General** | 😐 | Neutral, relaxed | Lo-fi, ambient, chill |
| **Motivation** | 💪 | Energetic, determined | Workout music, epic soundtracks |

## 🏗️ Architecture

```mermaid
graph TD
    A[User Interface] --> B[Frontend - HTML/CSS/JS]
    B --> C[Backend API - Node.js/Express]
    C --> D[Authentication - JWT]
    C --> E[Database - MongoDB]
    C --> F[ML Service - FastAPI]
    F --> G[Emotion Model - DistilBERT]
    G --> H[Music Recommendations]
    H --> I[Audio Player]
    
    style A fill:#f9f,stroke:#333
    style B fill:#ccf,stroke:#333
    style C fill:#cfc,stroke:#333
