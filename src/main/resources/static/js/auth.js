document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuthStatus();

    // Setup login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Setup signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);

        // Password validation
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        const passwordMismatch = document.getElementById('passwordMismatch');

        confirmPassword.addEventListener('input', function() {
            if (password.value !== confirmPassword.value) {
                confirmPassword.setCustomValidity('Passwords do not match');
                passwordMismatch.style.display = 'block';
            } else {
                confirmPassword.setCustomValidity('');
                passwordMismatch.style.display = 'none';
            }
        });
    }

    // Setup logout button
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'logoutButton') {
            handleLogout();
        }
    });
});

// Check if user is logged in
function checkAuthStatus() {
    fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Not authenticated');
    })
    .then(user => {
        // User is logged in
        updateUserSection(user);
        updateCartCount();
    })
    .catch(error => {
        // User is not logged in
        updateUserSection(null);

        // Store intended destination and redirect to login
    //     if (window.location.pathname === '/checkout') {
    //         sessionStorage.setItem('redirectAfterLogin', '/checkout');
    //         window.location.href = '/login';
    //     }
    // });
// }

// // Handle successful login
// function handleLoginSuccess() {
//     const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
//     if (redirectUrl) {
//         sessionStorage.removeItem('redirectAfterLogin');
//         window.location.href = redirectUrl;
//     } else {
//         window.location.href = '/';
//     }
// }

// Update the user section in the header
function updateUserSection(user) {
    const userSection = document.getElementById('userSection');
    if (!userSection) return;

    if (user) {
        userSection.innerHTML = `
            <span class="me-2">Hello, ${user.username}</span>
            <button id="logoutButton" class="btn btn-outline-secondary btn-sm">
                <i class="bi bi-box-arrow-right"></i>
            </button>
        `;
    } else {
        userSection.innerHTML = `
            <a href="/login" class="btn btn-outline-primary">
                <i class="bi bi-person me-1"></i>Login
            </a>
        `;
    }
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginButton = document.getElementById('loginButton');
    const loginError = document.getElementById('loginError');

    loginButton.disabled = true;
    loginButton.innerHTML = 'Logging in...';
    loginError.style.display = 'none';

    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        return response.json().then(data => {
            throw new Error(data.message || 'Invalid credentials');
        });
    })
    .then(user => {
        // Redirect to home page after successful login
        handleLoginSuccess();
    })
    .catch(error => {
        loginError.textContent = error.message;
        loginError.style.display = 'block';
        loginButton.disabled = false;
        loginButton.innerHTML = 'Login';
    });
}

// Handle signup form submission
function handleSignup(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const signupButton = document.getElementById('signupButton');
    const signupError = document.getElementById('signupError');

    // Validate password
    if (password !== confirmPassword) {
        signupError.textContent = 'Passwords do not match';
        signupError.style.display = 'block';
        return;
    }

    if (password.length < 6) {
        signupError.textContent = 'Password must be at least 6 characters long';
        signupError.style.display = 'block';
        return;
    }

    signupButton.disabled = true;
    signupButton.innerHTML = 'Creating account...';
    signupError.style.display = 'none';

    fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password }),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        return response.json().then(data => {
            throw new Error(data.message || 'Could not create account');
        });
    })
    .then(data => {
        // Redirect to login page after successful signup
        window.location.href = '/login?registered=true';
    })
    .catch(error => {
        signupError.textContent = error.message;
        signupError.style.display = 'block';
        signupButton.disabled = false;
        signupButton.innerHTML = 'Sign Up';
    });
}

// Handle logout
function handleLogout() {
    fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
    })
    .then(() => {
        // Redirect to login page after logout
        window.location.href = '/login';
    })
    .catch(error => {
        console.error('Logout error:', error);
    });
}

// Update cart count in header
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (!cartCount) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((total, item) => total + item.quantity, 0);

    cartCount.textContent = count;
    cartCount.style.display = count > 0 ? 'inline-block' : 'none';
}