// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const signupForm = document.getElementById('signupForm');
const togglePassword = document.getElementById('togglePassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const successModal = document.getElementById('successModal');
const loadingOverlay = document.getElementById('loadingOverlay');
const successMessage = document.getElementById('successMessage');

// Theme Management
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

// Password Visibility Toggle
function togglePasswordVisibility(input, toggleBtn) {
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    const icon = toggleBtn.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
}

// Show/Hide Loading
function showLoading() {
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
}

// Show Success Modal
function showSuccessModal(isAdmin = false) {
    const message = isAdmin 
        ? 'Your account has been created with Admin privileges! You can now access special features.'
        : 'Your MoodTune AI account has been created successfully. You can now login to start your musical journey.';
    
    successMessage.textContent = message;
    successModal.classList.add('active');
}

// Form Validation
function validateForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    const terms = document.getElementById('terms').checked;
    
    // Clear previous errors
    clearErrors();
    
    let isValid = true;
    
    if (!name) {
        showError('name', 'Please enter your full name');
        isValid = false;
    }
    
    if (!email) {
        showError('email', 'Please enter your email address');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!password) {
        showError('password', 'Please enter a password');
        isValid = false;
    } else if (password.length < 6) {
        showError('password', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    if (!confirmPassword) {
        showError('confirmPassword', 'Please confirm your password');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match');
        isValid = false;
    }
    
    if (!terms) {
        showAlert('Please agree to the Terms of Service and Privacy Policy', 'error');
        isValid = false;
    }
    
    return isValid;
}

// Error Handling
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group') || field.closest('.input-field').parentElement;
    
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    error.style.cssText = `
        color: var(--error);
        font-size: 0.85rem;
        margin-top: 0.5rem;
        display: flex;
        align-items: center;
        gap: 5px;
    `;
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-exclamation-circle';
    error.prepend(icon);
    
    formGroup.appendChild(error);
    
    // Add error styling to input
    const underline = field.nextElementSibling;
    if (underline && underline.classList.contains('underline')) {
        underline.style.background = 'var(--error)';
        underline.style.transform = 'scaleY(1.5)';
    }
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(error => error.remove());
    
    // Reset underline styles
    document.querySelectorAll('.underline').forEach(underline => {
        underline.style.background = '';
        underline.style.transform = '';
    });
}

// Show Alert
function showAlert(message, type = 'info') {
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
    
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
            style.remove();
        }
    }, 5000);
    
    alert.querySelector('.close-alert').addEventListener('click', () => {
        alert.remove();
        style.remove();
    });
}

// Email Validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Handle Signup Form Submission
async function handleSignup(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value.trim();
    const adminKey = document.getElementById('adminKey').value.trim();
    
    showLoading();
    
    try {
        const response = await fetch('/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                name, 
                email, 
                password,
                adminKey: adminKey || null
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            hideLoading();
            showSuccessModal(data.isAdmin);
            
            // Reset form
            signupForm.reset();
            
            // Redirect to login after 5 seconds if user doesn't click the button
            setTimeout(() => {
                if (successModal.classList.contains('active')) {
                    window.location.href = '/login';
                }
            }, 5000);
            
        } else {
            hideLoading();
            showAlert(data.message || 'Signup failed. Please try again.', 'error');
        }
        
    } catch (error) {
        console.error('Signup error:', error);
        hideLoading();
        showAlert('Network error. Please check your connection and try again.', 'error');
    }
}

// Close success modal
function closeSuccessModal() {
    successModal.classList.remove('active');
    window.location.href = '/login';
}

// Event Listeners
themeToggle.addEventListener('click', toggleTheme);
togglePassword.addEventListener('click', () => togglePasswordVisibility(passwordInput, togglePassword));
toggleConfirmPassword.addEventListener('click', () => togglePasswordVisibility(confirmPasswordInput, toggleConfirmPassword));
signupForm.addEventListener('submit', handleSignup);

// Success modal close events
successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
        closeSuccessModal();
    }
});

document.querySelector('.btn-login-redirect').addEventListener('click', (e) => {
    e.preventDefault();
    closeSuccessModal();
});

// Initialize
loadTheme();

// Animate form on load
window.addEventListener('load', () => {
    const formElements = document.querySelectorAll('.form-group, .terms, .btn-signup, .login-link');
    formElements.forEach((el, index) => {
        el.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s both`;
    });
});

// Add focus effects
document.querySelectorAll('.input-field input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.querySelector('.underline').style.transform = 'scaleY(1.5)';
    });
    
    input.addEventListener('blur', function() {
        const error = this.closest('.form-group')?.querySelector('.error-message');
        if (!error) {
            this.parentElement.querySelector('.underline').style.transform = 'scaleY(1)';
        }
    });
});

// Check if user is already logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/';
    }
}

// Run check on load
checkAuth();