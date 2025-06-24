// Execute when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    checkAuth();
    
    // Fetch user accounts and populate the dropdown
    fetchUserAccounts();
    
    // Set up logout functionality
    document.getElementById('logout-button').addEventListener('click', function() {
        localStorage.removeItem('user');
        localStorage.removeItem('accountId');
        window.location.href = 'login.html';
    });
    
    // Set up money action forms
    setupAddMoneyForm();
    setupSendMoneyForm();
    setupRequestMoneyForm();
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
                        
                        // Load account details and transactions
                        fetchAccountDetails(account.id);
                        fetchRecentTransactions(account.id);
                        setupTransactionChart(account.id);
                    });
                });
                
                // Select first account by default if no account is selected
                const accountId = localStorage.getItem('accountId');
                if (!accountId && data.accounts.length > 0) {
                    // Store first account ID
                    localStorage.setItem('accountId', data.accounts[0].id);
                    
                    // Update dropdown button text
                    document.getElementById('accountDropdown').textContent = `Account ****${data.accounts[0].accountNumber.slice(-4)}`;
                    
                    // Load account details and transactions for first account
                    fetchAccountDetails(data.accounts[0].id);
                    fetchRecentTransactions(data.accounts[0].id);
                    setupTransactionChart(data.accounts[0].id);
                } else if (accountId) {
                    // Find account in the list
                    const selectedAccount = data.accounts.find(account => account.id === accountId);
                    if (selectedAccount) {
                        // Update dropdown button text
                        document.getElementById('accountDropdown').textContent = `Account ****${selectedAccount.accountNumber.slice(-4)}`;
                        
                        // Load account details and transactions for selected account
                        fetchAccountDetails(accountId);
                        fetchRecentTransactions(accountId);
                        setupTransactionChart(accountId);
                    } else if (data.accounts.length > 0) {
                        // If selected account not found, select first account
                        localStorage.setItem('accountId', data.accounts[0].id);
                        
                        // Update dropdown button text
                        document.getElementById('accountDropdown').textContent = `Account ****${data.accounts[0].accountNumber.slice(-4)}`;
                        
                        // Load account details and transactions for first account
                        fetchAccountDetails(data.accounts[0].id);
                        fetchRecentTransactions(data.accounts[0].id);
                        setupTransactionChart(data.accounts[0].id);
                    }
                }
            } else {
                accountDropdownMenu.innerHTML = '<li><a class="dropdown-item" href="#">Error loading accounts</a></li>';
            }
        })
        .catch(error => {
            console.error('Error fetching accounts:', error);
            accountDropdownMenu.innerHTML = '<li><a class="dropdown-item" href="#">Error loading accounts</a></li>';
        });
}

// Fetch account details
function fetchAccountDetails(accountId) {
    const accountSummary = document.getElementById('account-summary');
    
    // Show loading state
    accountSummary.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading account details...</p>
        </div>
    `;
    
    fetch(`${API_BASE_URL}/accounts/${accountId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const account = data.account;
                
                // Format account details
                let formattedBalance = formatCurrency(account.balance);
                let formattedDailyLimit = formatCurrency(account.dailyLimit);
                let formattedTodaySpent = formatCurrency(account.todaySpent);
                
                // Calculate remaining limit
                let remaining = account.dailyLimit - account.todaySpent;
                if (remaining < 0) remaining = 0;
                let formattedRemaining = formatCurrency(remaining);
                
                // Check if account is a child account
                let accountTypeDisplay = account.isParentAccount ? 'Parent Account' : 'Child Account';
                let accountTypeClass = account.isParentAccount ? 'text-primary' : 'text-info';
                
                // Display account details
                accountSummary.innerHTML = `
                    <div class="d-flex justify-content-between mb-3">
                        <div>
                            <p class="mb-1 text-muted">Account Number</p>
                            <h5>${account.accountNumber}</h5>
                        </div>
                        <div>
                            <span class="badge ${accountTypeClass}">${accountTypeDisplay}</span>
                        </div>
                    </div>
                    <div class="mb-3">
                        <p class="mb-1 text-muted">Current Balance</p>
                        <h3 class="fw-bold">${formattedBalance}</h3>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-1 text-muted">IFSC Code</p>
                            <p>${account.ifscCode}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-1 text-muted">UPI ID</p>
                            <p>${account.upiId}</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-1 text-muted">Daily Limit</p>
                            <p>${formattedDailyLimit}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-1 text-muted">Today's Spent</p>
                            <p>${formattedTodaySpent}</p>
                        </div>
                    </div>
                    <div class="progress mt-2" style="height: 10px;">
                        <div class="progress-bar bg-success" role="progressbar" style="width: ${(account.todaySpent / account.dailyLimit) * 100}%" aria-valuenow="${account.todaySpent}" aria-valuemin="0" aria-valuemax="${account.dailyLimit}"></div>
                    </div>
                    <p class="mt-1 text-muted small">Remaining: ${formattedRemaining}</p>
                `;
            } else {
                accountSummary.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i> Error loading account details.
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error fetching account details:', error);
            accountSummary.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i> Error loading account details.
                </div>
            `;
        });
}

// Fetch recent transactions
function fetchRecentTransactions(accountId) {
    const recentTransactions = document.getElementById('recent-transactions');
    
    // Show loading state
    recentTransactions.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading recent transactions...</p>
        </div>
    `;
    
    fetch(`${API_BASE_URL}/transactions/account/${accountId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Sort transactions by timestamp (newest first)
                const transactions = data.transactions.sort((a, b) => 
                    new Date(b.timestamp) - new Date(a.timestamp)
                );
                
                // Take only the 5 most recent transactions
                const recentTransactions5 = transactions.slice(0, 5);
                
                if (recentTransactions5.length === 0) {
                    recentTransactions.innerHTML = `
                        <div class="text-center py-3">
                            <i class="fas fa-exchange-alt fa-2x text-muted mb-2"></i>
                            <p>No transactions yet</p>
                        </div>
                    `;
                    return;
                }
                
                // Create list of transactions
                let transactionsList = '';
                
                recentTransactions5.forEach(transaction => {
                    const isOutgoing = transaction.fromUsername === localStorage.getItem('username');
                    const iconClass = getTransactionIconClass(transaction.type, transaction.amount, isOutgoing ? accountId : null);
                    const formattedAmount = formatCurrency(transaction.amount);
                    const formattedDate = formatDate(transaction.timestamp);
                    const statusBadgeClass = getStatusBadgeClass(transaction.status);
                    
                    transactionsList += `
                        <div class="list-group-item list-group-item-action">
                            <div class="d-flex w-100 justify-content-between align-items-center">
                                <div class="d-flex align-items-center">
                                    <div class="me-3">
                                        <i class="${iconClass} fa-lg"></i>
                                    </div>
                                    <div>
                                        <h6 class="mb-0">${transaction.type.replace('_', ' ')}</h6>
                                        <small class="text-muted">${formattedDate}</small>
                                    </div>
                                </div>
                                <div class="text-end">
                                    <div class="fw-bold">${formattedAmount}</div>
                                    <span class="badge ${statusBadgeClass}">${transaction.status}</span>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                recentTransactions.innerHTML = `
                    <div class="list-group">
                        ${transactionsList}
                    </div>
                `;
            } else {
                recentTransactions.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i> Error loading transactions.
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error fetching transaction history:', error);
            recentTransactions.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i> Error loading transactions.
                </div>
            `;
        });
}

// Setup transaction chart
function setupTransactionChart(accountId) {
    const chartLoading = document.getElementById('chart-loading');
    const chartCanvas = document.getElementById('transaction-chart');
    
    // Show loading, hide canvas
    chartLoading.style.display = 'block';
    chartCanvas.style.display = 'none';
    
    // Get transactions for this account
    fetch(`${API_BASE_URL}/transactions/account/${accountId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Hide loading, show canvas
                chartLoading.style.display = 'none';
                chartCanvas.style.display = 'block';
                
                // Create chart with transaction data
                createTransactionChart(data.transactions);
            } else {
                chartLoading.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i> Error loading chart data.
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error fetching transaction history:', error);
            chartLoading.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i> Error loading chart data.
                </div>
            `;
        });
}

// Create transaction chart
function createTransactionChart(transactions) {
    // Sort transactions by timestamp
    transactions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Group by day
    const transactionsByDay = {};
    transactions.forEach(transaction => {
        const date = new Date(transaction.timestamp).toLocaleDateString();
        
        if (!transactionsByDay[date]) {
            transactionsByDay[date] = {
                incoming: 0,
                outgoing: 0
            };
        }
        
        const isIncoming = transaction.toAccountId === localStorage.getItem('accountId');
        
        if (isIncoming) {
            transactionsByDay[date].incoming += transaction.amount;
        } else {
            transactionsByDay[date].outgoing += transaction.amount;
        }
    });
    
    // Get last 7 days (or less if not enough data)
    const days = Object.keys(transactionsByDay).slice(-7);
    const incomingData = days.map(day => transactionsByDay[day].incoming);
    const outgoingData = days.map(day => transactionsByDay[day].outgoing);
    
    // Format days for display
    const formattedDays = days.map(day => {
        const date = new Date(day);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    // If there's no data for the past 7 days
    if (days.length === 0) {
        // Show message in chart area
        document.getElementById('chart-loading').style.display = 'block';
        document.getElementById('chart-loading').innerHTML = `
            <div class="text-center py-3">
                <i class="fas fa-chart-bar fa-2x text-muted mb-2"></i>
                <p>No transaction data available yet</p>
            </div>
        `;
        document.getElementById('transaction-chart').style.display = 'none';
        return;
    }
    
    // Create chart
    const ctx = document.getElementById('transaction-chart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (window.transactionChart) {
        window.transactionChart.destroy();
    }
    
    window.transactionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: formattedDays,
            datasets: [{
                label: 'Incoming',
                data: incomingData,
                backgroundColor: 'rgba(40, 167, 69, 0.7)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 1
            }, {
                label: 'Outgoing',
                data: outgoingData,
                backgroundColor: 'rgba(220, 53, 69, 0.7)',
                borderColor: 'rgba(220, 53, 69, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount (₹)'
                    }
                }
            }
        }
    });
}

// Toggle "Add Money" form fields based on selected method
function toggleAddMoneyFields(method) {
    if (method === 'UPI') {
        document.getElementById('upi-add-fields').style.display = 'block';
        document.getElementById('debit-add-fields').style.display = 'none';
    } else if (method === 'DEBIT_CARD') {
        document.getElementById('upi-add-fields').style.display = 'none';
        document.getElementById('debit-add-fields').style.display = 'block';
    }
}

// Toggle "Send Money" form fields based on selected method
function toggleSendMoneyFields(method) {
    if (method === 'UPI') {
        document.getElementById('upi-send-fields').style.display = 'block';
        document.getElementById('card-send-fields').style.display = 'none';
    } else if (method === 'CARD') {
        document.getElementById('upi-send-fields').style.display = 'none';
        document.getElementById('card-send-fields').style.display = 'block';
    }
}

// Setup "Add Money" form
function setupAddMoneyForm() {
    // Toggle fields based on selected method
    document.querySelectorAll('input[name="add-money-method"]').forEach(radio => {
        radio.addEventListener('change', function() {
            toggleAddMoneyFields(this.value);
        });
    });
    
    // Handle form submission
    document.getElementById('add-money-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const amount = document.getElementById('add-money-amount').value;
        const method = document.querySelector('input[name="add-money-method"]:checked').value;
        
        // Validate amount
        if (!amount || parseFloat(amount) <= 0) {
            showError('add-money-error', 'Please enter a valid amount');
            return;
        }
        
        // Get method-specific details
        let sourceInfo = '';
        if (method === 'UPI') {
            const upiId = document.getElementById('upi-id-add').value;
            const upiPin = document.getElementById('upi-pin-add').value;
            
            if (!upiId) {
                showError('add-money-error', 'Please enter your UPI ID');
                return;
            }
            
            if (!upiPin) {
                showError('add-money-error', 'Please enter your UPI PIN');
                return;
            }
            
            sourceInfo = upiId;
        } else if (method === 'DEBIT_CARD') {
            const cardNumber = document.getElementById('card-number-add').value;
            const expiryDate = document.getElementById('expiry-date-add').value;
            const cvv = document.getElementById('cvv-add').value;
            
            if (!cardNumber) {
                showError('add-money-error', 'Please enter your card number');
                return;
            }
            
            if (!expiryDate) {
                showError('add-money-error', 'Please enter card expiry date');
                return;
            }
            
            if (!cvv) {
                showError('add-money-error', 'Please enter card CVV');
                return;
            }
            
            sourceInfo = cardNumber;
        }
        
        // Prepare request data
        const requestData = {
            accountId: localStorage.getItem('accountId'),
            amount: parseFloat(amount),
            source: method,
            sourceInfo: sourceInfo
        };
        
        // Send API request
        fetch(`${API_BASE_URL}/transactions/add-money`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message
                showSuccess('add-money-success', 'Money added successfully!');
                
                // Reset form
                document.getElementById('add-money-form').reset();
                
                // Refresh account details
                fetchAccountDetails(localStorage.getItem('accountId'));
                fetchRecentTransactions(localStorage.getItem('accountId'));
                setupTransactionChart(localStorage.getItem('accountId'));
                
                // Close modal after 2 seconds
                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addMoneyModal'));
                    if (modal) {
                        modal.hide();
                    }
                }, 2000);
            } else {
                showError('add-money-error', data.message || 'Failed to add money');
            }
        })
        .catch(error => {
            console.error('Error adding money:', error);
            showError('add-money-error', 'An error occurred. Please try again.');
        });
    });
}

// Setup "Send Money" form
function setupSendMoneyForm() {
    // Toggle fields based on selected method
    document.querySelectorAll('input[name="send-money-method"]').forEach(radio => {
        radio.addEventListener('change', function() {
            toggleSendMoneyFields(this.value);
        });
    });
    
    // Handle form submission
    document.getElementById('send-money-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const amount = document.getElementById('send-money-amount').value;
        const method = document.querySelector('input[name="send-money-method"]:checked').value;
        const note = document.getElementById('send-money-note').value;
        
        // Validate amount
        if (!amount || parseFloat(amount) <= 0) {
            showError('send-money-error', 'Please enter a valid amount');
            return;
        }
        
        // Prepare common request data
        const requestData = {
            fromAccountId: localStorage.getItem('accountId'),
            amount: parseFloat(amount),
            note: note
        };
        
        // Get method-specific details
        if (method === 'UPI') {
            const toUpiId = document.getElementById('to-upi-id').value;
            const upiPin = document.getElementById('upi-pin-send').value;
            
            if (!toUpiId) {
                showError('send-money-error', 'Please enter recipient UPI ID');
                return;
            }
            
            if (!upiPin) {
                showError('send-money-error', 'Please enter your UPI PIN');
                return;
            }
            
            requestData.transferType = 'UPI';
            requestData.toUpiId = toUpiId;
            requestData.upiPin = upiPin;
        } else if (method === 'CARD') {
            const recipientCardNumber = document.getElementById('recipient-card-number').value;
            const cardType = document.getElementById('card-type').value;
            
            if (!recipientCardNumber) {
                showError('send-money-error', 'Please enter recipient card number');
                return;
            }
            
            requestData.transferType = cardType;
            
            if (cardType === 'CREDIT_CARD') {
                requestData.creditCardNumber = recipientCardNumber;
            } else {
                requestData.debitCardNumber = recipientCardNumber;
            }
            
            // Add dummy CVV and expiry for demo purposes
            requestData.cvv = '123';
            requestData.expiryDate = '12/25';
        }
        
        // Send API request
        fetch(`${API_BASE_URL}/transactions/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message
                showSuccess('send-money-success', 'Money sent successfully!');
                
                // Reset form
                document.getElementById('send-money-form').reset();
                
                // Refresh account details
                fetchAccountDetails(localStorage.getItem('accountId'));
                fetchRecentTransactions(localStorage.getItem('accountId'));
                setupTransactionChart(localStorage.getItem('accountId'));
                
                // Close modal after 2 seconds
                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('sendMoneyModal'));
                    if (modal) {
                        modal.hide();
                    }
                }, 2000);
            } else {
                showError('send-money-error', data.message || 'Failed to send money');
            }
        })
        .catch(error => {
            console.error('Error sending money:', error);
            showError('send-money-error', 'An error occurred. Please try again.');
        });
    });
}

// Setup "Request Money" form
function setupRequestMoneyForm() {
    // Handle form submission
    document.getElementById('request-money-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const amount = document.getElementById('request-money-amount').value;
        const note = document.getElementById('request-money-note').value;
        
        // Validate amount
        if (!amount || parseFloat(amount) <= 0) {
            showError('request-money-error', 'Please enter a valid amount');
            return;
        }
        
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
            if (data.success) {
                // Show success message
                showSuccess('request-money-success', 'Money request sent successfully! Your parent account will be notified.');
                
                // Reset form
                document.getElementById('request-money-form').reset();
                
                // Refresh account details
                fetchAccountDetails(localStorage.getItem('accountId'));
                fetchRecentTransactions(localStorage.getItem('accountId'));
                
                // Close modal after 2 seconds
                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('requestMoneyModal'));
                    if (modal) {
                        modal.hide();
                    }
                }, 2000);
            } else {
                showError('request-money-error', data.message || 'Failed to send money request');
            }
        })
        .catch(error => {
            console.error('Error requesting money:', error);
            showError('request-money-error', 'An error occurred. Please try again.');
        });
    });
}