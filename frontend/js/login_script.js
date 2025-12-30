// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const loginForm = document.getElementById('loginForm');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const forgotPasswordBtn = document.getElementById('forgotPassword');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const closeModalBtn = document.querySelector('.close-modal');
const sendResetBtn = document.querySelector('.btn-send');
const resetEmailInput = document.getElementById('resetEmail');
const signupLink = document.getElementById('signupLink');
const spinner = document.getElementById('spinner');

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
}

function updateThemeIcon() {
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    updateThemeIcon();
}

// Toggle Password Visibility
function togglePasswordVisibility() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    const icon = togglePassword.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
}

// Show/Hide Modal
function showModal() {
    forgotPasswordModal.classList.add('active');
    resetEmailInput.focus();
}

function hideModal() {
    forgotPasswordModal.classList.remove('active');
    resetEmailInput.value = '';
}

// Handle Login Form Submission
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // Simple validation
    if (!email || !password) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading spinner
    spinner.classList.add('active');
    
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save JWT token
            localStorage.setItem('token', data.jwt_token);
            localStorage.setItem('userEmail', email);
            
            showAlert('Login successful! Redirecting...', 'success');
            
            // Redirect to home page after 1.5 seconds
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
            
        } else {
            showAlert(data.message || 'Login failed', 'error');
            spinner.classList.remove('active');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Network error. Please try again.', 'error');
        spinner.classList.remove('active');
    }
}

// Handle Forgot Password
async function handleForgotPassword() {
    const email = resetEmailInput.value.trim();
    
    if (!email || !isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }
    
    // In a real app, you would make an API call here
    // For now, simulate API call
    sendResetBtn.textContent = 'Sending...';
    sendResetBtn.disabled = true;
    
    setTimeout(() => {
        showAlert(`Reset link sent to ${email}`, 'success');
        sendResetBtn.textContent = 'Send Reset Link';
        sendResetBtn.disabled = false;
        hideModal();
    }, 1500);
}

// Show Alert
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="close-alert">&times;</button>
    `;
    
    // Add alert styles
    const style = document.createElement('style');
    style.textContent = `
        .alert {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 350px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
        }
        
        .alert-success {
            background: var(--success);
            color: white;
            border-left: 4px solid #059669;
        }
        
        .alert-error {
            background: var(--error);
            color: white;
            border-left: 4px solid #dc2626;
        }
        
        .alert i {
            font-size: 1.2rem;
        }
        
        .close-alert {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            margin-left: auto;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }
        
        .close-alert:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
            style.remove();
        }
    }, 5000);
    
    // Close button event
    alert.querySelector('.close-alert').addEventListener('click', () => {
        alert.remove();
        style.remove();
    });
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Check if user is already logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        // Optional: Verify token is still valid
        window.location.href = '/';
    }
}

// Event Listeners
themeToggle.addEventListener('click', toggleTheme);
togglePassword.addEventListener('click', togglePasswordVisibility);
loginForm.addEventListener('submit', handleLogin);
forgotPasswordBtn.addEventListener('click', showModal);
closeModalBtn.addEventListener('click', hideModal);
sendResetBtn.addEventListener('click', handleForgotPassword);

// Close modal when clicking outside
forgotPasswordModal.addEventListener('click', (e) => {
    if (e.target === forgotPasswordModal) {
        hideModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && forgotPasswordModal.classList.contains('active')) {
        hideModal();
    }
});

// Prevent form submission on Enter key in modal
resetEmailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleForgotPassword();
    }
});

// Initialize
loadTheme();
checkAuth();

// Add some visual feedback for inputs
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.querySelector('.underline').style.transform = 'scaleY(1.5)';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.querySelector('.underline').style.transform = 'scaleY(1)';
    });
});

// Animate form elements on load
window.addEventListener('load', () => {
    const formElements = document.querySelectorAll('.input-group, .remember-me, .btn-login, .divider, .social-login, .form-footer');
    formElements.forEach((el, index) => {
        el.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s both`;
    });
});