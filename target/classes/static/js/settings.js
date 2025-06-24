// Execute when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    checkAuth();
    
    // Fetch user accounts and populate the dropdown
    fetchUserAccounts();
    
    // Set up settings functionality
    setupChangePasswordForm();
    setupDailyLimitForm();
    setupNotificationSettingsForm();
    
    // Set up parent-child account features
    setupParentChildAccountFeatures();
    
    // Set up logout functionality
    document.getElementById('logout-button').addEventListener('click', function() {
        localStorage.removeItem('user');
        localStorage.removeItem('accountId');
        window.location.href = 'login.html';
    });
    
    // Load initial daily limit for the selected account
    const accountId = localStorage.getItem('accountId');
    if (accountId) {
        loadAccountLimit(accountId);
    }
});

// Fetch user accounts and populate dropdown
function fetchUserAccounts() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    const accountDropdownMenu = document.getElementById('account-dropdown-menu');
    
    fetch(`${API_BASE_URL}/accounts/user/${user.id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Clear loading placeholder
                accountDropdownMenu.innerHTML = '';
                
                // If no accounts found
                if (data.accounts.length === 0) {
                    accountDropdownMenu.innerHTML = '<li><a class="dropdown-item" href="#">No accounts found</a></li>';
                    return;
                }
                
                // Add accounts to dropdown
                data.accounts.forEach(account => {
                    const accountItem = document.createElement('li');
                    accountItem.innerHTML = `<a class="dropdown-item" href="#" data-account-id="${account.id}">
                        Account ending with ${account.accountNumber.slice(-4)}
                    </a>`;
                    accountDropdownMenu.appendChild(accountItem);
                    
                    // Add click event
                    accountItem.querySelector('a').addEventListener('click', function() {
                        // Update dropdown button text
                        document.getElementById('accountDropdown').textContent = `Account ****${account.accountNumber.slice(-4)}`;
                        
                        // Store selected account ID
                        localStorage.setItem('accountId', account.id);
                        
                        // Load account limit
                        loadAccountLimit(account.id);
                        
                        // Refresh linked accounts
                        displayLinkedAccounts();
                        
                        // Fetch pending money requests
                        fetchPendingMoneyRequests();
                    });
                });
                
                // Select first account by default if no account is selected
                const accountId = localStorage.getItem('accountId');
                if (!accountId && data.accounts.length > 0) {
                    // Store first account ID
                    localStorage.setItem('accountId', data.accounts[0].id);
                    
                    // Update dropdown button text
                    document.getElementById('accountDropdown').textContent = `Account ****${data.accounts[0].accountNumber.slice(-4)}`;
                    
                    // Load account limit
                    loadAccountLimit(data.accounts[0].id);
                    
                    // Display linked accounts
                    displayLinkedAccounts();
                    
                    // Fetch pending money requests
                    fetchPendingMoneyRequests();
                } else if (accountId) {
                    // Find account in the list
                    const selectedAccount = data.accounts.find(account => account.id === accountId);
                    if (selectedAccount) {
                        // Update dropdown button text
                        document.getElementById('accountDropdown').textContent = `Account ****${selectedAccount.accountNumber.slice(-4)}`;
                        
                        // Load account limit
                        loadAccountLimit(accountId);
                        
                        // Display linked accounts
                        displayLinkedAccounts();
                        
                        // Fetch pending money requests
                        fetchPendingMoneyRequests();
                    } else if (data.accounts.length > 0) {
                        // If selected account not found, select first account
                        localStorage.setItem('accountId', data.accounts[0].id);
                        
                        // Update dropdown button text
                        document.getElementById('accountDropdown').textContent = `Account ****${data.accounts[0].accountNumber.slice(-4)}`;
                        
                        // Load account limit
                        loadAccountLimit(data.accounts[0].id);
                        
                        // Display linked accounts
                        displayLinkedAccounts();
                        
                        // Fetch pending money requests
                        fetchPendingMoneyRequests();
                    }
                }
                
                // Populate account selector for settings
                populateAccountSelector(data.accounts);
            } else {
                accountDropdownMenu.innerHTML = '<li><a class="dropdown-item" href="#">Error loading accounts</a></li>';
            }
        })
        .catch(error => {
            console.error('Error fetching accounts:', error);
            accountDropdownMenu.innerHTML = '<li><a class="dropdown-item" href="#">Error loading accounts</a></li>';
        });
}

// Populate account selector for settings
function populateAccountSelector(accounts) {
    // This function would be used to populate account selectors in various settings forms
    // For example, a dropdown to select which account to apply settings to
}

// Load account daily limit
function loadAccountLimit(accountId) {
    fetch(`${API_BASE_URL}/accounts/${accountId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const account = data.account;
                
                // Display daily limit information
                document.getElementById('daily-limit-display').textContent = formatCurrency(account.dailyLimit);
                document.getElementById('today-spent-display').textContent = formatCurrency(account.todaySpent);
                
                // Calculate remaining limit
                const remaining = Math.max(0, account.dailyLimit - account.todaySpent);
                document.getElementById('remaining-limit-display').textContent = formatCurrency(remaining);
                
                // Pre-fill daily limit form with current value
                document.getElementById('daily-limit').value = account.dailyLimit;
            }
        })
        .catch(error => {
            console.error('Error loading account limit:', error);
        });
}

// Setup change password form
function setupChangePasswordForm() {
    const changePasswordForm = document.getElementById('change-password-form');
    
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Basic validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                showError('password-error', 'Please fill in all password fields');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showError('password-error', 'New passwords do not match');
                return;
            }
            
            const user = JSON.parse(localStorage.getItem('user'));
            
            const passwordData = {
                username: user.username,
                oldPassword: currentPassword,
                newPassword: newPassword
            };
            
            // Send password update request
            fetch(`${API_BASE_URL}/users/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(passwordData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccess('password-success', 'Password updated successfully');
                    changePasswordForm.reset();
                } else {
                    showError('password-error', data.message || 'Failed to update password');
                }
            })
            .catch(error => {
                console.error('Error updating password:', error);
                showError('password-error', 'An error occurred. Please try again.');
            });
        });
    }
}

// Setup daily limit form
function setupDailyLimitForm() {
    const dailyLimitForm = document.getElementById('daily-limit-form');
    
    if (dailyLimitForm) {
        dailyLimitForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const dailyLimit = document.getElementById('daily-limit').value;
            
            // Validate input
            if (dailyLimit === null || dailyLimit === '') {
                showError('limit-error', 'Please enter a valid limit amount');
                return;
            }
            
            const accountId = localStorage.getItem('accountId');
            
            // Send update request
            fetch(`${API_BASE_URL}/accounts/${accountId}/daily-limit`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ dailyLimit: parseFloat(dailyLimit) })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccess('limit-success', 'Daily limit updated successfully');
                    
                    // Update display values
                    document.getElementById('daily-limit-display').textContent = formatCurrency(parseFloat(dailyLimit));
                    
                    // Recalculate remaining limit
                    const todaySpent = parseFloat(data.account.todaySpent);
                    const remaining = Math.max(0, parseFloat(dailyLimit) - todaySpent);
                    document.getElementById('remaining-limit-display').textContent = formatCurrency(remaining);
                } else {
                    showError('limit-error', data.message || 'Failed to update daily limit');
                }
            })
            .catch(error => {
                console.error('Error updating daily limit:', error);
                showError('limit-error', 'An error occurred. Please try again.');
            });
        });
    }
}

// Setup notification settings form
function setupNotificationSettingsForm() {
    const notificationForm = document.getElementById('notification-settings-form');
    
    if (notificationForm) {
        notificationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real app, these settings would be saved to the user's profile
            // For this demo, we'll just show a success message
            
            showSuccess('notification-success', 'Notification preferences saved successfully');
        });
    }
}

// Setup parent-child account features
function setupParentChildAccountFeatures() {
    // Fetch user accounts to populate dropdowns
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        fetchAndPopulateAccounts(user.id);
        fetchPendingMoneyRequests();
    }
    
    // Setup link account form
    setupLinkAccountForm();
    
    // Setup request money form
    setupRequestMoneyForm();
}

// Fetch and populate accounts for parent-child linking
function fetchAndPopulateAccounts(userId) {
    fetch(`${API_BASE_URL}/accounts/user/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                populateParentChildAccountDropdowns(data.accounts);
                
                // Load linked accounts
                displayLinkedAccounts(data.accounts);
            }
        })
        .catch(error => {
            console.error('Error fetching accounts for parent-child linking:', error);
        });
}

// Populate parent-child account dropdowns
function populateParentChildAccountDropdowns(accounts) {
    // In a real app, this would populate dropdowns to select parent/child accounts
    // For this demo, we'll use direct account number entry in the forms
}

// Display linked accounts in the view linked tab
function displayLinkedAccounts(accounts) {
    const parentAccountsContainer = document.getElementById('parent-accounts-container');
    const childAccountsContainer = document.getElementById('child-accounts-container');
    
    // Clear existing content
    parentAccountsContainer.innerHTML = '';
    childAccountsContainer.innerHTML = '';
    
    // Show loading indicators
    parentAccountsContainer.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    childAccountsContainer.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    // Get the current account ID
    const currentAccountId = localStorage.getItem('accountId');
    if (!currentAccountId) {
        parentAccountsContainer.innerHTML = '<div class="alert alert-warning">Please select an account first</div>';
        childAccountsContainer.innerHTML = '<div class="alert alert-warning">Please select an account first</div>';
        return;
    }

    // Use the dedicated API endpoint to get parent account info
    fetch(`${API_BASE_URL}/accounts/${currentAccountId}/parent`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.parentAccount) {
                const parentAccount = data.parentAccount;
                const parentItem = document.createElement('div');
                parentItem.className = 'list-group-item';
                parentItem.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">Account Number: ${parentAccount.accountNumber}</h6>
                            <small>Balance: ₹${parentAccount.balance.toFixed(2)}</small>
                        </div>
                        <span class="badge bg-primary">Parent</span>
                    </div>
                `;
                parentAccountsContainer.appendChild(parentItem);
            } else {
                parentAccountsContainer.innerHTML = '<div class="alert alert-info">This account does not have a parent account.</div>';
            }
        })
        .catch(error => {
            console.error('Error fetching parent account:', error);
            parentAccountsContainer.innerHTML = '<div class="alert alert-danger">Error loading parent account data</div>';
        });
    
    // Use the dedicated API endpoint to get child accounts
    fetch(`${API_BASE_URL}/accounts/${currentAccountId}/children`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.childAccounts && data.childAccounts.length > 0) {
                const foundParentAccount = true;
                
                // Display each child account
                data.childAccounts.forEach(childAccount => {
                    const childItem = document.createElement('div');
                    childItem.className = 'list-group-item';
                    childItem.innerHTML = `
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">Account Number: ${childAccount.accountNumber}</h6>
                                <small>Balance: ₹${childAccount.balance ? childAccount.balance.toFixed(2) : '0.00'}</small>
                            </div>
                            <span class="badge bg-info">Child</span>
                        </div>
                    `;
                    childAccountsContainer.appendChild(childItem);
                });
            } else {
                childAccountsContainer.innerHTML = '<div class="alert alert-info">This account does not have any linked child accounts.</div>';
            }
        })
        .catch(error => {
            console.error('Error fetching child accounts:', error);
            childAccountsContainer.innerHTML = '<div class="alert alert-danger">Error loading child accounts</div>';
        });
}

// Setup account linking form
function setupLinkAccountForm() {
    const linkAccountForm = document.getElementById('link-account-form');
    
    linkAccountForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const parentAccountNumber = document.getElementById('parent-account-number').value;
        const childAccountNumber = document.getElementById('child-account-number').value;
        
        // Validate inputs
        if (!parentAccountNumber || !childAccountNumber) {
            showError('link-alert', 'Please enter both parent and child account numbers');
            return;
        }
        
        if (parentAccountNumber === childAccountNumber) {
            showError('link-alert', 'Parent and child accounts cannot be the same');
            return;
        }
        
        if (parentAccountNumber.length !== 12 || !/^\d+$/.test(parentAccountNumber)) {
            showError('link-alert', 'Parent account number must be 12 digits');
            return;
        }
        
        if (childAccountNumber.length !== 12 || !/^\d+$/.test(childAccountNumber)) {
            showError('link-alert', 'Child account number must be 12 digits');
            return;
        }
        
        // Show loading state
        const submitButton = linkAccountForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Linking...';
        
        // Send request to link accounts
        fetch(`${API_BASE_URL}/accounts/link`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                parentAccountNumber: parentAccountNumber,
                childAccountNumber: childAccountNumber
            })
        })
        .then(response => response.json())
        .then(data => {
            // Restore button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            
            if (data.success) {
                // Show success message with more details
                showSuccess('link-success', `Accounts linked successfully! The account ending with ${parentAccountNumber.slice(-4)} (parent) is now linked to the account ending with ${childAccountNumber.slice(-4)} (child).`);
                
                // Reset form
                linkAccountForm.reset();
                
                // Refresh account data
                const user = JSON.parse(localStorage.getItem('user'));
                if (user) {
                    fetchAndPopulateAccounts(user.id);
                }
            } else {
                showError('link-alert', data.message || 'Failed to link accounts. Make sure both account numbers exist in the system.');
            }
        })
        .catch(error => {
            // Restore button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            
            console.error('Error linking accounts:', error);
            showError('link-alert', 'An error occurred while processing your request. Please try again.');
        });
    });
}

// Setup request money form
function setupRequestMoneyForm() {
    const requestMoneyForm = document.getElementById('request-money-form');
    if (!requestMoneyForm) return;
    
    requestMoneyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const amount = document.getElementById('request-money-amount').value;
        const note = document.getElementById('request-money-note').value;
        
        // Validate amount
        if (!amount || parseFloat(amount) <= 0) {
            showError('request-money-error', 'Please enter a valid amount');
            return;
        }
        
        // Show loading state
        const submitButton = requestMoneyForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Sending Request...';
        
        // Prepare request data
        const requestData = {
            childAccountId: localStorage.getItem('accountId'),
            amount: parseFloat(amount),
            note: note
        };
        
        // Send API request
        fetch(`${API_BASE_URL}/transactions/request-money`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            // Restore button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            
            if (data.success) {
                // Show success message
                showSuccess('request-money-success', 'Money request sent successfully! Your parent account will be notified.');
                
                // Reset form
                requestMoneyForm.reset();
                
                // Refresh pending requests
                fetchPendingMoneyRequests();
            } else {
                showError('request-money-error', data.message || 'Failed to send money request. Make sure your account is linked to a parent account.');
            }
        })
        .catch(error => {
            // Restore button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            
            console.error('Error requesting money:', error);
            showError('request-money-error', 'An error occurred while processing your request. Please try again.');
        });
    });
}

// Fetch pending money requests
function fetchPendingMoneyRequests() {
    const moneyRequestsContainer = document.getElementById('money-requests-container');
    if (!moneyRequestsContainer) return;
    
    // Show loading state
    moneyRequestsContainer.innerHTML = `
        <div class="text-center py-3">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading money requests...</p>
        </div>
    `;
    
    const accountId = localStorage.getItem('accountId');
    
    // Fetch account details to check if it's a parent or child account
    fetch(`${API_BASE_URL}/accounts/${accountId}`)
        .then(response => response.json())
        .then(accountData => {
            if (accountData.success) {
                const account = accountData.account;
                const isParentAccount = account.isParentAccount;
                
                // Fetch transactions
                fetch(`${API_BASE_URL}/transactions/account/${accountId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Filter pending money requests
                            const pendingRequests = data.transactions.filter(transaction => 
                                transaction.type === 'REQUEST_MONEY' && transaction.status === 'PENDING'
                            );
                            
                            // Display pending requests
                            displayPendingRequests(pendingRequests, isParentAccount);
                        } else {
                            moneyRequestsContainer.innerHTML = `
                                <div class="alert alert-danger">
                                    <i class="fas fa-exclamation-circle me-2"></i> Error loading money requests.
                                </div>
                            `;
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching money requests:', error);
                        moneyRequestsContainer.innerHTML = `
                            <div class="alert alert-danger">
                                <i class="fas fa-exclamation-circle me-2"></i> Error loading money requests.
                            </div>
                        `;
                    });
            }
        })
        .catch(error => {
            console.error('Error fetching account details:', error);
            moneyRequestsContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i> Error loading account details.
                </div>
            `;
        });
}

// Display pending money requests
function displayPendingRequests(requests, isParent) {
    const moneyRequestsContainer = document.getElementById('money-requests-container');
    
    if (requests.length === 0) {
        moneyRequestsContainer.innerHTML = `
            <div class="text-center py-3">
                <i class="fas fa-check-circle fa-2x text-muted mb-2"></i>
                <p>No pending money requests</p>
            </div>
        `;
        return;
    }
    
    // Create list of requests
    let requestsList = '';
    
    requests.forEach(request => {
        const formattedAmount = formatCurrency(request.amount);
        const formattedDate = formatDateTime(request.timestamp);
        
        requestsList += `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="mb-1">${formattedAmount}</h6>
                        <p class="mb-1 small">${request.description || 'No description'}</p>
                        <small class="text-muted">${formattedDate}</small>
                    </div>
                    ${isParent ? `
                        <div>
                            <button class="btn btn-sm btn-success me-1" onclick="respondToRequest('${request.id}', true)">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="respondToRequest('${request.id}', false)">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        </div>
                    ` : `
                        <span class="badge bg-warning">Pending</span>
                    `}
                </div>
            </div>
        `;
    });
    
    moneyRequestsContainer.innerHTML = `
        <div class="list-group">
            ${requestsList}
        </div>
    `;
}

// Respond to money request (approve or reject)
function respondToRequest(transactionId, approved) {
    fetch(`${API_BASE_URL}/transactions/request/${transactionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approved })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            alert(approved ? 'Money request approved successfully!' : 'Money request rejected successfully!');
            
            // Refresh pending requests
            fetchPendingMoneyRequests();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error responding to request:', error);
        alert('An error occurred. Please try again.');
    });
}