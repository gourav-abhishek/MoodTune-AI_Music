// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const emotionText = document.getElementById('emotionText');
const charCount = document.getElementById('charCount');
const analyzeBtn = document.getElementById('analyzeBtn');
const emotionResults = document.getElementById('emotionResults');
const emotionPills = document.getElementById('emotionPills');
const confidenceScore = document.getElementById('confidenceScore');
const recommendationText = document.getElementById('recommendationText');
const quickEmotionBtns = document.querySelectorAll('.quick-emotion-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const refreshBtn = document.getElementById('refreshBtn');
const musicGrid = document.getElementById('musicGrid');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const recentList = document.getElementById('recentList');
const trendingList = document.getElementById('trendingList');
const moodChart = document.getElementById('moodChart');
const moodInsight = document.getElementById('moodInsight');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');
const welcomeUserName = document.getElementById('welcomeUserName');
const userAvatar = document.getElementById('userAvatar');
const totalPlays = document.getElementById('totalPlays');
const totalLikes = document.getElementById('totalLikes');
const totalMinutes = document.getElementById('totalMinutes');

// Audio Player Elements
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const volumeSlider = document.getElementById('volumeSlider');
const progressFill = document.getElementById('progressFill');
const currentTime = document.getElementById('currentTime');
const totalTime = document.getElementById('totalTime');
const currentSongTitle = document.getElementById('currentSongTitle');
const currentSongArtist = document.getElementById('currentSongArtist');
const currentSongImage = document.getElementById('currentSongImage');

// State Variables
let currentTheme = 'light';
let currentSongs = [];
let filteredSongs = [];
let currentEmotions = [];
let currentSongIndex = -1;
let isPlaying = false;
let recentPlays = JSON.parse(localStorage.getItem('recentPlays')) || [];
let likedSongs = JSON.parse(localStorage.getItem('likedSongs')) || [];
let playHistory = JSON.parse(localStorage.getItem('playHistory')) || [];
let currentPage = 1;
let songsPerPage = 8;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Load theme
    loadTheme();
    
    // Check authentication
    await checkAuth();
    
    // Load user data
    loadUserData();
    
    // Load songs
    await loadSongs();
    
    // Initialize mood chart
    initializeMoodChart();
    
    // Load recent plays
    loadRecentPlays();
    
    // Load trending songs
    loadTrendingSongs();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup audio player
    setupAudioPlayer();
}

// Theme Management
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    const isDark = currentTheme === 'dark';
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        currentTheme = 'dark';
    }
    updateThemeIcon();
}

// Authentication
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    try {
        // Verify token by making a simple request
        const response = await fetch('/emotion/emotionprediction', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: 'test' })
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
}

// Load User Data
function loadUserData() {
    const userEmail = localStorage.getItem('userEmail') || 'User';
    const name = userEmail.split('@')[0];
    
    userName.textContent = name;
    welcomeUserName.textContent = name;
    userAvatar.textContent = name.charAt(0).toUpperCase();
    
    // Calculate stats
    const plays = playHistory.length;
    const minutes = Math.floor(playHistory.reduce((sum, play) => sum + (play.duration || 0), 0) / 60);
    
    totalPlays.textContent = plays;
    totalLikes.textContent = likedSongs.length;
    totalMinutes.textContent = minutes;
}

// Load Songs
async function loadSongs(emotion = null) {
    try {
        const token = localStorage.getItem('token');
        let url = '/songs/by-emotion/General';
        
        if (emotion && emotion !== 'all') {
            url = `/songs/by-emotion/${emotion}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentSongs = data.songs;
            filteredSongs = [...currentSongs];
            displaySongs();
        } else {
            showAlert('Failed to load songs', 'error');
        }
    } catch (error) {
        console.error('Error loading songs:', error);
        showAlert('Failed to load songs', 'error');
        // Display sample data for demo
        displaySampleSongs();
    }
}

// Display Songs
function displaySongs() {
    const startIndex = (currentPage - 1) * songsPerPage;
    const endIndex = startIndex + songsPerPage;
    const songsToShow = filteredSongs.slice(startIndex, endIndex);

    if (currentPage === 1) {
        musicGrid.innerHTML = '';
    }

    if (songsToShow.length === 0) {
        musicGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-music"></i>
                <h3>No songs found</h3>
                <p>Try selecting a different emotion filter</p>
            </div>
        `;
        loadMoreBtn.style.display = 'none';
        return;
    }

    songsToShow.forEach((song, index) => {
        const songElement = createSongElement(song);
        musicGrid.appendChild(songElement);
    });

    // Show/hide load more button
    loadMoreBtn.style.display = endIndex < filteredSongs.length ? 'block' : 'none';
}

// Create Song Element
function createSongElement(song) {
    const div = document.createElement('div');
    div.className = 'music-card';
    div.dataset.id = song._id;
    div.dataset.audio = `/songs/audio/${song._id}`;
    div.dataset.image = `/songs/image/${song._id}`;
    
    // Get first emotion label for display
    const firstEmotion = song.labels[0] || 'General';
    
    div.innerHTML = `
        <div class="music-cover">
            <img src="/songs/image/${song._id}" alt="${song.title}" onerror="this.src='https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'">
            <div class="play-overlay">
                <i class="fas fa-play"></i>
            </div>
        </div>
        <div class="music-info">
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
            <div class="music-labels">
                ${song.labels.slice(0, 2).map(label => `
                    <span class="music-label ${label.toLowerCase()}">${label}</span>
                `).join('')}
                ${song.labels.length > 2 ? `<span class="music-label more">+${song.labels.length - 2}</span>` : ''}
            </div>
            <div class="music-actions">
                <button class="play-btn-small" data-id="${song._id}">
                    <i class="fas fa-play"></i>
                </button>
                <button class="like-btn ${likedSongs.includes(song._id) ? 'liked' : ''}" data-id="${song._id}">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const playBtn = div.querySelector('.play-btn-small');
    const likeBtn = div.querySelector('.like-btn');
    
    playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playSong(song);
    });
    
    likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLike(song._id, likeBtn);
    });
    
    div.addEventListener('click', () => {
        playSong(song);
    });
    
    return div;
}

// Emotion Analysis
async function analyzeEmotion() {
    const text = emotionText.value.trim();
    
    if (!text) {
        showAlert('Please enter some text to analyze', 'warning');
        return;
    }

    
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/emotion/emotionprediction', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });
        
        if (response.ok) {
            const data = await response.json();
            displayEmotionResults(data.emotions);
            await loadSongsByEmotions(data.emotions);
        } else {
            showAlert('Failed to analyze emotion', 'error');
        }
    } catch (error) {
        console.error('Error analyzing emotion:', error);
        showAlert('Failed to analyze emotion', 'error');
        // Demo data
        displayEmotionResults(['Fun', 'Motivation']);
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-magic"></i> Analyze Mood';
    }
}

function displayEmotionResults(emotions) {
    currentEmotions = emotions;
    
    // Calculate confidence (simulated)
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
    confidenceScore.textContent = `${confidence}%`;
    
    // Create emotion pills
    emotionPills.innerHTML = '';
    emotions.forEach(emotion => {
        const pill = document.createElement('div');
        pill.className = `emotion-pill ${emotion.toLowerCase()}`;
        pill.innerHTML = `
            <i class="fas fa-${getEmotionIcon(emotion)}"></i>
            ${emotion}
        `;
        emotionPills.appendChild(pill);
    });
    
    // Update recommendation text
    const recommendation = getRecommendationText(emotions);
    recommendationText.textContent = recommendation;
    
    // Show results
    emotionResults.classList.add('show');
}

function getEmotionIcon(emotion) {
    const icons = {
        'Fun': 'laugh',
        'Sadness': 'sad-tear',
        'Angry': 'angry',
        'Love': 'heart',
        'General': 'user',
        'Motivation': 'dumbbell'
    };
    return icons[emotion] || 'user';
}

function getRecommendationText(emotions) {
    const texts = {
        'Fun': "Let's get the party started with some upbeat tracks!",
        'Sadness': "We've got the perfect songs to help you through this moment.",
        'Angry': "Channel that energy with some powerful beats.",
        'Love': "Fall in love all over again with these romantic melodies.",
        'General': "Here's a mix of songs that match your current vibe.",
        'Motivation': "Get pumped up with these energizing tracks!"
    };
    
    if (emotions.length === 1) {
        return texts[emotions[0]] || "Based on your mood, here are some perfect tracks for you...";
    }
    
    return `We've curated a special playlist blending ${emotions.join(' and ')} vibes just for you!`;
}

async function loadSongsByEmotions(emotions) {
    if (emotions.length === 0) return;
    
    // For demo, just filter existing songs
    filteredSongs = currentSongs.filter(song => 
        song.labels.some(label => emotions.includes(label))
    );
    
    // If no matches, show all songs
    if (filteredSongs.length === 0) {
        filteredSongs = [...currentSongs];
    }
    
    currentPage = 1;
    displaySongs();
}

// Quick Emotion Buttons
function setupQuickEmotions() {
    quickEmotionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const emotion = btn.dataset.emotion;
            const texts = {
                'Fun': "I'm having an amazing day! Everything feels perfect and I'm full of energy!",
                'Sadness': "Feeling a bit down today. Could use some comforting music...",
                'Angry': "I'm really frustrated right now. Need something to help me process these emotions.",
                'Love': "Thinking about that special someone. Feeling all warm and fuzzy inside.",
                'Motivation': "Ready to conquer the world! Need some powerful music to keep me going.",
                'General': "Just going through my day. Looking for some good music to listen to."
            };
            
            emotionText.value = texts[emotion];
            updateCharCount();
            emotionResults.classList.remove('show');
        });
    });
}

// Filter Songs
function setupFilters() {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter songs
            const filter = btn.dataset.filter;
            if (filter === 'all') {
                filteredSongs = [...currentSongs];
            } else {
                filteredSongs = currentSongs.filter(song => 
                    song.labels.includes(filter)
                );
            }
            
            currentPage = 1;
            displaySongs();
        });
    });
}

// Audio Player Functions
function setupAudioPlayer() {
    // Volume
    volumeSlider.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value / 100;
    });
    
    // Progress
    audioPlayer.addEventListener('timeupdate', updateProgress);
    
    // Play/Pause
    playBtn.addEventListener('click', togglePlay);
    
    // Previous/Next
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    
    // Song ended
    audioPlayer.addEventListener('ended', playNext);
}

function playSong(song) {
    if (!song) return;
    
    // Find song index
    const index = filteredSongs.findIndex(s => s._id === song._id);
    if (index === -1) return;
    
    currentSongIndex = index;
    
    // Update UI
    currentSongTitle.textContent = song.title;
    currentSongArtist.textContent = song.artist;
    currentSongImage.src = `/songs/image/${song._id}`;
    currentSongImage.onerror = function() {
        this.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80';
    };
    
    // Play audio
    audioPlayer.src = `/songs/audio/${song._id}`;
    audioPlayer.play().then(() => {
        isPlaying = true;
        updatePlayButton();
        updatePlayingCard(song._id);
        
        // Add to recent plays
        addToRecentPlays(song);
        
        // Update play count
        updatePlayCount(song._id);
        
        // Save to history
        addToHistory(song);
    }).catch(error => {
        console.error('Error playing audio:', error);
        showAlert('Error playing audio file', 'error');
    });
}

function togglePlay() {
    if (!audioPlayer.src) return;
    
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play();
    }
    isPlaying = !isPlaying;
    updatePlayButton();
}

function updatePlayButton() {
    const icon = playBtn.querySelector('i');
    if (isPlaying) {
        icon.className = 'fas fa-pause';
        playBtn.classList.add('playing');
    } else {
        icon.className = 'fas fa-play';
        playBtn.classList.remove('playing');
    }
}

function updateProgress() {
    if (!audioPlayer.duration) return;
    
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressFill.style.width = `${progress}%`;
    
    // Update time display
    currentTime.textContent = formatTime(audioPlayer.currentTime);
    totalTime.textContent = formatTime(audioPlayer.duration);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function playPrevious() {
    if (filteredSongs.length === 0) return;
    
    currentSongIndex = (currentSongIndex - 1 + filteredSongs.length) % filteredSongs.length;
    playSong(filteredSongs[currentSongIndex]);
}

function playNext() {
    if (filteredSongs.length === 0) return;
    
    currentSongIndex = (currentSongIndex + 1) % filteredSongs.length;
    playSong(filteredSongs[currentSongIndex]);
}

function updatePlayingCard(songId) {
    // Remove playing class from all cards
    document.querySelectorAll('.music-card').forEach(card => {
        card.classList.remove('playing');
    });
    
    // Add playing class to current song
    const currentCard = document.querySelector(`.music-card[data-id="${songId}"]`);
    if (currentCard) {
        currentCard.classList.add('playing');
        currentCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Recent Plays
function addToRecentPlays(song) {
    // Remove if already exists
    recentPlays = recentPlays.filter(item => item._id !== song._id);
    
    // Add to beginning
    recentPlays.unshift({
        _id: song._id,
        title: song.title,
        artist: song.artist,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 10
    recentPlays = recentPlays.slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem('recentPlays', JSON.stringify(recentPlays));
    
    // Update UI
    loadRecentPlays();
}

function loadRecentPlays() {
    if (recentPlays.length === 0) {
        recentList.innerHTML = `
            <div class="empty-recent">
                <i class="fas fa-music"></i>
                <p>No recent plays</p>
            </div>
        `;
        return;
    }
    
    recentList.innerHTML = '';
    recentPlays.forEach(play => {
        const item = document.createElement('div');
        item.className = 'recent-item';
        item.innerHTML = `
            <div class="recent-cover">
                <img src="/songs/image/${play._id}" alt="${play.title}">
            </div>
            <div class="recent-info">
                <h5>${play.title}</h5>
                <p>${play.artist}</p>
            </div>
        `;
        item.addEventListener('click', () => {
            // Find and play the song
            const song = currentSongs.find(s => s._id === play._id);
            if (song) playSong(song);
        });
        recentList.appendChild(item);
    });
}

// Trending Songs
function loadTrendingSongs() {
    // For demo, use first 5 songs
    const trending = currentSongs.slice(0, 5);
    
    trendingList.innerHTML = '';
    trending.forEach(song => {
        const item = document.createElement('div');
        item.className = 'trending-item';
        item.innerHTML = `
            <div class="trending-cover">
                <img src="/songs/image/${song._id}" alt="${song.title}">
            </div>
            <div class="trending-info">
                <h5>${song.title}</h5>
                <p>${song.artist}</p>
            </div>
        `;
        item.addEventListener('click', () => {
            playSong(song);
        });
        trendingList.appendChild(item);
    });
}

// Like Songs
function toggleLike(songId, button) {
    const index = likedSongs.indexOf(songId);
    
    if (index === -1) {
        // Like
        likedSongs.push(songId);
        button.classList.add('liked');
        button.innerHTML = '<i class="fas fa-heart"></i>';
        
        // Update like count on server
        updateLikeCount(songId, 1);
    } else {
        // Unlike
        likedSongs.splice(index, 1);
        button.classList.remove('liked');
        button.innerHTML = '<i class="far fa-heart"></i>';
        
        // Update like count on server
        updateLikeCount(songId, -1);
    }
    
    // Save to localStorage
    localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
    
    // Update UI
    totalLikes.textContent = likedSongs.length;
}

async function updateLikeCount(songId, delta) {
    try {
        const token = localStorage.getItem('token');
        await fetch(`/songs/${songId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Error updating like count:', error);
    }
}

async function updatePlayCount(songId) {
    try {
        const token = localStorage.getItem('token');
        await fetch(`/songs/${songId}/play`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Update local count
        totalPlays.textContent = parseInt(totalPlays.textContent) + 1;
    } catch (error) {
        console.error('Error updating play count:', error);
    }
}

function addToHistory(song) {
    playHistory.push({
        songId: song._id,
        title: song.title,
        timestamp: new Date().toISOString(),
        duration: song.duration || 0
    });
    
    // Keep only last 100 plays
    playHistory = playHistory.slice(-100);
    
    // Save to localStorage
    localStorage.setItem('playHistory', JSON.stringify(playHistory));
}

// Mood Chart
function initializeMoodChart() {
    // For demo, create sample mood data
    const moods = ['Fun', 'Sadness', 'Angry', 'Love', 'General', 'Motivation'];
    const data = moods.map(() => Math.floor(Math.random() * 100));
    
    const ctx = moodChart.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: moods,
            datasets: [{
                label: 'Mood Frequency',
                data: data,
                backgroundColor: [
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(236, 72, 153, 0.7)',
                    'rgba(107, 114, 128, 0.7)',
                    'rgba(16, 185, 129, 0.7)'
                ],
                borderColor: [
                    'rgb(245, 158, 11)',
                    'rgb(59, 130, 246)',
                    'rgb(239, 68, 68)',
                    'rgb(236, 72, 153)',
                    'rgb(107, 114, 128)',
                    'rgb(16, 185, 129)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'var(--text-secondary)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'var(--text-secondary)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Set mood insight
    const topMood = moods[data.indexOf(Math.max(...data))];
    moodInsight.textContent = `Your most frequent mood this week: ${topMood}`;
}

// Character Count
function updateCharCount() {
    const count = emotionText.value.length;
    charCount.textContent = count;
    
    if (count > 500) {
        charCount.style.color = 'var(--error)';
    } else if (count > 400) {
        charCount.style.color = 'var(--warning)';
    } else {
        charCount.style.color = 'var(--text-secondary)';
    }
}

// Alert System
function showAlert(message, type = 'info') {
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="close-alert">&times;</button>
    `;
    
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
    
    // Close button
    alert.querySelector('.close-alert').addEventListener('click', () => {
        alert.remove();
    });
}

// Demo Data (for testing)
function displaySampleSongs() {
    const sampleSongs = [
        {
            _id: '1',
            title: 'Sunshine Vibes',
            artist: 'Chill Beats Collective',
            labels: ['Fun', 'Motivation'],
            duration: 180
        },
        {
            _id: '2',
            title: 'Midnight Thoughts',
            artist: 'Luna Rivers',
            labels: ['Sadness', 'Love'],
            duration: 240
        },
        {
            _id: '3',
            title: 'Energy Boost',
            artist: 'Pulse Masters',
            labels: ['Motivation', 'Fun'],
            duration: 200
        },
        {
            _id: '4',
            title: 'Heartfelt Melodies',
            artist: 'Soul Strings',
            labels: ['Love', 'General'],
            duration: 220
        },
        {
            _id: '5',
            title: 'Stormy Weather',
            artist: 'Thunder Sounds',
            labels: ['Angry', 'Motivation'],
            duration: 190
        },
        {
            _id: '6',
            title: 'Peaceful Moments',
            artist: 'Zen Garden',
            labels: ['General', 'Fun'],
            duration: 210
        },
        {
            _id: '7',
            title: 'Dream Chaser',
            artist: 'Vision Quest',
            labels: ['Motivation'],
            duration: 195
        },
        {
            _id: '8',
            title: 'Sweet Memories',
            artist: 'Nostalgia Band',
            labels: ['Love', 'Sadness'],
            duration: 230
        }
    ];
    
    currentSongs = sampleSongs;
    filteredSongs = [...sampleSongs];
    displaySongs();
}

// Event Listeners Setup
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Character count
    emotionText.addEventListener('input', updateCharCount);
    
    // Analyze emotion
    analyzeBtn.addEventListener('click', analyzeEmotion);
    
    // Quick emotions
    setupQuickEmotions();
    
    // Filters
    setupFilters();
    
    // Refresh
    refreshBtn.addEventListener('click', () => {
        loadSongs();
        showAlert('Recommendations refreshed!', 'success');
    });
    
    // Load more
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        displaySongs();
    });
    
    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        window.location.href = '/login';
    });
    
    // Enter key in emotion text
    emotionText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            analyzeEmotion();
        }
    });
}

// Audio player events
audioPlayer.addEventListener('play', () => {
    isPlaying = true;
    updatePlayButton();
});

audioPlayer.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayButton();
});

audioPlayer.addEventListener('error', (e) => {
    console.error('Audio error:', e);
    showAlert('Error playing audio file', 'error');
});