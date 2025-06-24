// Execute when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Basic validation
            if (!username || !password) {
                showError('login-error', 'Please enter both username and password');
                return;
            }
            
            const loginData = {
                username: username,
                password: password
            };
            
            // Send login request
            fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Store user info and redirect to dashboard
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('username', data.user.username);
                    
                    // If user has accounts, store the first account ID
                    if (data.user.accountIds && data.user.accountIds.length > 0) {
                        localStorage.setItem('accountId', data.user.accountIds[0]);
                    }
                    
                    window.location.href = 'dashboard.html';
                } else {
                    showError('login-error', data.message || 'Login failed. Please check your credentials.');
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                showError('login-error', 'An error occurred during login. Please try again.');
            });
        });
    }
    
    // Toggle password visibility
    const togglePasswordButton = document.getElementById('toggle-password');
    if (togglePasswordButton) {
        togglePasswordButton.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    // Demo login button
    const demoLoginButton = document.getElementById('demo-login');
    if (demoLoginButton) {
        demoLoginButton.addEventListener('click', function() {
            // Create a demo user
            const demoUser = {
                id: 'user1',
                username: 'demo_user',
                email: 'demo@example.com',
                fullName: 'Demo User',
                mobile: '9876543210',
                address: '123 Demo Street, Demo City',
                accountIds: ['acc1']
            };
            
            // Store demo user info
            localStorage.setItem('user', JSON.stringify(demoUser));
            localStorage.setItem('username', demoUser.username);
            localStorage.setItem('accountId', 'acc1');
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        });
    }
    
    // Registration form handling
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const email = document.getElementById('email').value;
            const fullName = document.getElementById('fullName').value;
            const mobile = document.getElementById('mobile').value;
            const address = document.getElementById('address').value;
            
            // Basic validation
            if (!username || !password || !email || !fullName || !mobile) {
                showError('register-error', 'Please fill in all required fields');
                return;
            }
            
            if (password !== confirmPassword) {
                showError('register-error', 'Passwords do not match');
                return;
            }
            
            const registerData = {
                username: username,
                password: password,
                email: email,
                fullName: fullName,
                mobile: mobile,
                address: address
            };
            
            // Send registration request
            fetch(`${API_BASE_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message
                    showSuccess('register-success', 'Registration successful! You can now login.');
                    
                    // Reset form
                    registerForm.reset();
                    
                    // Redirect to login page after 2 seconds
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    showError('register-error', data.message || 'Registration failed. Please try again.');
                }
            })
            .catch(error => {
                console.error('Registration error:', error);
                showError('register-error', 'An error occurred during registration. Please try again.');
            });
        });
    }
});