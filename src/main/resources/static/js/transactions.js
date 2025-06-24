// Execute when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    checkAuth();
    
    // Fetch user accounts and populate the dropdown
    fetchUserAccounts();
    
    // Set up transaction filters
    document.querySelectorAll('input[name="transaction-filter"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const accountId = localStorage.getItem('accountId');
            loadTransactions(accountId, this.value);
        });
    });
    
    // Set up logout functionality
    document.getElementById('logout-button').addEventListener('click', function() {
        localStorage.removeItem('user');
        localStorage.removeItem('accountId');
        window.location.href = 'login.html';
    });
    
    // Set up transaction detail modal actions
    const approveBtn = document.getElementById('approve-request-btn');
    const rejectBtn = document.getElementById('reject-request-btn');
    
    if (approveBtn) {
        approveBtn.addEventListener('click', function() {
            const transactionId = this.getAttribute('data-transaction-id');
            respondToRequest(transactionId, true);
        });
    }
    
    if (rejectBtn) {
        rejectBtn.addEventListener('click', function() {
            const transactionId = this.getAttribute('data-transaction-id');
            respondToRequest(transactionId, false);
        });
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
                        
                        // Load transactions for this account
                        const filter = document.querySelector('input[name="transaction-filter"]:checked').value;
                        loadTransactions(account.id, filter);
                        
                        // Load monthly summary and charts
                        loadMonthlySummary(account.id);
                        loadTransactionTypeChart(account.id);
                    });
                });
                
                // Select first account by default if no account is selected
                const accountId = localStorage.getItem('accountId');
                if (!accountId && data.accounts.length > 0) {
                    // Store first account ID
                    localStorage.setItem('accountId', data.accounts[0].id);
                    
                    // Update dropdown button text
                    document.getElementById('accountDropdown').textContent = `Account ****${data.accounts[0].accountNumber.slice(-4)}`;
                    
                    // Load data for first account
                    const filter = document.querySelector('input[name="transaction-filter"]:checked').value;
                    loadTransactions(data.accounts[0].id, filter);
                    loadMonthlySummary(data.accounts[0].id);
                    loadTransactionTypeChart(data.accounts[0].id);
                } else if (accountId) {
                    // Find account in the list
                    const selectedAccount = data.accounts.find(account => account.id === accountId);
                    if (selectedAccount) {
                        // Update dropdown button text
                        document.getElementById('accountDropdown').textContent = `Account ****${selectedAccount.accountNumber.slice(-4)}`;
                        
                        // Load data for selected account
                        const filter = document.querySelector('input[name="transaction-filter"]:checked').value;
                        loadTransactions(accountId, filter);
                        loadMonthlySummary(accountId);
                        loadTransactionTypeChart(accountId);
                    } else if (data.accounts.length > 0) {
                        // If selected account not found, select first account
                        localStorage.setItem('accountId', data.accounts[0].id);
                        
                        // Update dropdown button text
                        document.getElementById('accountDropdown').textContent = `Account ****${data.accounts[0].accountNumber.slice(-4)}`;
                        
                        // Load data for first account
                        const filter = document.querySelector('input[name="transaction-filter"]:checked').value;
                        loadTransactions(data.accounts[0].id, filter);
                        loadMonthlySummary(data.accounts[0].id);
                        loadTransactionTypeChart(data.accounts[0].id);
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

// Load transactions with optional filter
function loadTransactions(accountId, filter = 'all') {
    const transactionList = document.getElementById('transaction-list');
    
    // Show loading state
    transactionList.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading transactions...</p>
        </div>
    `;
    
    // Get the filter from the filter buttons if not provided
    if (!filter) {
        filter = document.querySelector('input[name="transaction-filter"]:checked').value;
    }
    
    fetch(`${API_BASE_URL}/transactions/account/${accountId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Sort transactions by timestamp (newest first)
                const transactions = data.transactions.sort((a, b) => 
                    new Date(b.timestamp) - new Date(a.timestamp)
                );
                
                // Display transactions with selected filter
                displayTransactions(transactions, filter);
                
                // Setup pagination
                setupPagination(transactions.length);
            } else {
                transactionList.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i> Error loading transactions.
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error fetching transaction history:', error);
            transactionList.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i> Error loading transactions.
                </div>
            `;
        });
}

// Display transactions with filter
function displayTransactions(transactions, filter = 'all') {
    const transactionList = document.getElementById('transaction-list');
    const accountId = localStorage.getItem('accountId');
    
    // If no transactions found
    if (transactions.length === 0) {
        transactionList.innerHTML = `
            <div class="text-center py-3">
                <i class="fas fa-exchange-alt fa-2x text-muted mb-2"></i>
                <p>No transactions yet</p>
            </div>
        `;
        return;
    }
    
    // Filter transactions based on selected filter
    let filteredTransactions = transactions;
    
    if (filter === 'credit') {
        filteredTransactions = transactions.filter(transaction => 
            transaction.toAccountId === accountId
        );
    } else if (filter === 'debit') {
        filteredTransactions = transactions.filter(transaction => 
            transaction.fromAccountId === accountId
        );
    } else if (filter === 'pending') {
        filteredTransactions = transactions.filter(transaction => 
            transaction.status === 'PENDING'
        );
    }
    
    // If no transactions match the filter
    if (filteredTransactions.length === 0) {
        transactionList.innerHTML = `
            <div class="text-center py-3">
                <i class="fas fa-filter fa-2x text-muted mb-2"></i>
                <p>No ${filter} transactions found</p>
            </div>
        `;
        return;
    }
    
    // Create list of transactions
    let transactionsList = '';
    
    filteredTransactions.forEach(transaction => {
        const isOutgoing = transaction.fromAccountId === accountId;
        const iconClass = getTransactionIconClass(transaction.type, transaction.amount, transaction.fromAccountId);
        const formattedAmount = formatCurrency(transaction.amount);
        const formattedDate = formatDateTime(transaction.timestamp);
        const statusBadgeClass = getStatusBadgeClass(transaction.status);
        
        transactionsList += `
            <div class="list-group-item list-group-item-action" onclick="openTransactionDetail('${transaction.id}')">
                <div class="d-flex w-100 justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <div class="me-3">
                            <i class="${iconClass} fa-lg"></i>
                        </div>
                        <div>
                            <h6 class="mb-0">${transaction.type.replace('_', ' ')}</h6>
                            <p class="mb-0 small">${truncateText(transaction.description || 'No description', 30)}</p>
                            <small class="text-muted">${formattedDate}</small>
                        </div>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold ${isOutgoing ? 'text-danger' : 'text-success'}">${isOutgoing ? '-' : '+'}${formattedAmount}</div>
                        <span class="badge ${statusBadgeClass}">${transaction.status}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    transactionList.innerHTML = `
        <div class="list-group">
            ${transactionsList}
        </div>
    `;
}

// Setup pagination
function setupPagination(totalTransactions) {
    const paginationContainer = document.getElementById('pagination');
    const transactionsPerPage = 10;
    const totalPages = Math.ceil(totalTransactions / transactionsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<nav><ul class="pagination">';
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === 1 ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
    paginationHTML += '</ul></nav>';
    
    paginationContainer.innerHTML = paginationHTML;
    
    // Add click event to pagination links
    document.querySelectorAll('.pagination .page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all page items
            document.querySelectorAll('.pagination .page-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked page item
            this.parentElement.classList.add('active');
            
            // Get page number and load transactions for that page
            const page = parseInt(this.getAttribute('data-page'));
            // NOTE: In a real app, you would implement pagination on the server side
            // and include page parameter in the API request
        });
    });
}

// Load monthly summary
function loadMonthlySummary(accountId) {
    const monthlySummary = document.getElementById('monthly-summary');
    
    // Show loading state
    monthlySummary.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading summary...</p>
        </div>
    `;
    
    // Get current month's start and end dates
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Format for API request
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();
    
    fetch(`${API_BASE_URL}/transactions/account/${accountId}?startDate=${startDateStr}&endDate=${endDateStr}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Calculate monthly summary
                calculateMonthlySummary(data.transactions);
            } else {
                monthlySummary.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i> Error loading monthly summary.
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error fetching monthly summary:', error);
            monthlySummary.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i> Error loading monthly summary.
                </div>
            `;
        });
}

// Calculate and display monthly summary
function calculateMonthlySummary(transactions) {
    const monthlySummary = document.getElementById('monthly-summary');
    const accountId = localStorage.getItem('accountId');
    
    // Initialize summary data
    let totalIncoming = 0;
    let totalOutgoing = 0;
    let transactionCount = transactions.length;
    
    // Calculate totals
    transactions.forEach(transaction => {
        if (transaction.toAccountId === accountId) {
            totalIncoming += transaction.amount;
        }
        if (transaction.fromAccountId === accountId) {
            totalOutgoing += transaction.amount;
        }
    });
    
    // Get current month name
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = monthNames[new Date().getMonth()];
    const currentYear = new Date().getFullYear();
    
    // Display summary
    monthlySummary.innerHTML = `
        <h6 class="text-center mb-3">${currentMonth} ${currentYear} Summary</h6>
        <div class="row text-center mb-3">
            <div class="col-4">
                <div class="text-success h5 mb-0">${formatCurrency(totalIncoming)}</div>
                <small class="text-muted">Incoming</small>
            </div>
            <div class="col-4">
                <div class="text-danger h5 mb-0">${formatCurrency(totalOutgoing)}</div>
                <small class="text-muted">Outgoing</small>
            </div>
            <div class="col-4">
                <div class="h5 mb-0">${transactionCount}</div>
                <small class="text-muted">Transactions</small>
            </div>
        </div>
        <div class="progress mb-2" style="height: 8px;">
            <div class="progress-bar bg-success" role="progressbar" style="width: ${totalIncoming / (totalIncoming + totalOutgoing) * 100}%" aria-valuenow="${totalIncoming}" aria-valuemin="0" aria-valuemax="${totalIncoming + totalOutgoing}"></div>
            <div class="progress-bar bg-danger" role="progressbar" style="width: ${totalOutgoing / (totalIncoming + totalOutgoing) * 100}%" aria-valuenow="${totalOutgoing}" aria-valuemin="0" aria-valuemax="${totalIncoming + totalOutgoing}"></div>
        </div>
        <div class="row text-center small">
            <div class="col-6 text-start">
                <span class="badge bg-success">Income</span>
            </div>
            <div class="col-6 text-end">
                <span class="badge bg-danger">Expense</span>
            </div>
        </div>
    `;
}

// Load transaction type chart
function loadTransactionTypeChart(accountId) {
    const typeChartLoading = document.getElementById('type-chart-loading');
    const typeChart = document.getElementById('transaction-type-chart');
    
    // Show loading, hide canvas
    typeChartLoading.style.display = 'block';
    typeChart.style.display = 'none';
    
    fetch(`${API_BASE_URL}/transactions/account/${accountId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Hide loading, show canvas
                typeChartLoading.style.display = 'none';
                typeChart.style.display = 'block';
                
                // Create chart
                createTransactionTypeChart(data.transactions);
            } else {
                typeChartLoading.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i> Error loading chart data.
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error loading transaction type chart:', error);
            typeChartLoading.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i> Error loading chart data.
                </div>
            `;
        });
}

// Create transaction type chart
function createTransactionTypeChart(transactions) {
    // Group by transaction type
    const typeGroups = {};
    
    transactions.forEach(transaction => {
        const type = transaction.type;
        
        if (!typeGroups[type]) {
            typeGroups[type] = {
                count: 0,
                amount: 0
            };
        }
        
        typeGroups[type].count++;
        typeGroups[type].amount += transaction.amount;
    });
    
    // Prepare data for chart
    const labels = Object.keys(typeGroups).map(formatTransactionType);
    const data = Object.values(typeGroups).map(group => group.amount);
    
    // Colors for chart
    const backgroundColors = [
        'rgba(75, 192, 192, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(201, 203, 207, 0.7)'
    ];
    
    // Destroy previous chart if it exists
    if (window.typeChart) {
        window.typeChart.destroy();
    }
    
    // Create chart
    const ctx = document.getElementById('transaction-type-chart').getContext('2d');
    window.typeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors.slice(0, data.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12
                    }
                }
            }
        }
    });
}

// Format transaction type for display
function formatTransactionType(type) {
    return type.replace('_', ' ').toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Open transaction detail modal
function openTransactionDetail(transactionId) {
    // Show loading state
    document.getElementById('transaction-detail-loading').style.display = 'block';
    document.getElementById('transaction-detail-content').style.display = 'none';
    
    // Get transaction details
    fetch(`${API_BASE_URL}/transactions/${transactionId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Hide loading, show content
                document.getElementById('transaction-detail-loading').style.display = 'none';
                document.getElementById('transaction-detail-content').style.display = 'block';
                
                // Populate modal with transaction details
                populateTransactionModal(data.transaction);
                
                // Show the modal
                const modal = new bootstrap.Modal(document.getElementById('transactionDetailModal'));
                modal.show();
            } else {
                alert('Error loading transaction details. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error fetching transaction details:', error);
            alert('Error loading transaction details. Please try again.');
        });
}

// Populate transaction modal with details
function populateTransactionModal(transaction) {
    // Set transaction type and amount
    document.getElementById('transaction-type-title').textContent = formatTransactionType(transaction.type);
    document.getElementById('transaction-amount').textContent = formatCurrency(transaction.amount);
    
    // Set icon
    const iconElement = document.getElementById('transaction-icon-large').querySelector('i');
    iconElement.className = '';
    iconElement.className = getTransactionIcon(transaction.type) + ' fa-2x';
    
    // Set status badge
    const statusBadge = document.getElementById('transaction-status-badge');
    statusBadge.className = 'badge ' + getStatusBadgeClass(transaction.status);
    statusBadge.textContent = transaction.status;
    
    // Set other details
    document.getElementById('transaction-datetime').textContent = formatDateTime(transaction.timestamp);
    document.getElementById('transaction-reference').textContent = transaction.referenceId;
    document.getElementById('transaction-description').textContent = transaction.description || '-';
    
    // Set from/to users if available
    const fromUserRow = document.getElementById('from-user-row');
    const toUserRow = document.getElementById('to-user-row');
    
    if (transaction.fromUsername) {
        fromUserRow.style.display = '';
        document.getElementById('transaction-from').textContent = transaction.fromUsername;
    } else {
        fromUserRow.style.display = 'none';
    }
    
    if (transaction.toUsername) {
        toUserRow.style.display = '';
        document.getElementById('transaction-to').textContent = transaction.toUsername;
    } else {
        toUserRow.style.display = 'none';
    }
    
    // Show/hide action buttons for pending requests
    const transactionActions = document.getElementById('transaction-actions');
    const approveBtn = document.getElementById('approve-request-btn');
    const rejectBtn = document.getElementById('reject-request-btn');
    
    if (transaction.type === 'REQUEST_MONEY' && transaction.status === 'PENDING' && transaction.fromAccountId === localStorage.getItem('accountId')) {
        transactionActions.classList.remove('d-none');
        
        // Set transaction ID for action buttons
        approveBtn.setAttribute('data-transaction-id', transaction.id);
        rejectBtn.setAttribute('data-transaction-id', transaction.id);
    } else {
        transactionActions.classList.add('d-none');
    }
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
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('transactionDetailModal'));
            modal.hide();
            
            // Show success message
            alert(approved ? 'Money request approved successfully!' : 'Money request rejected successfully!');
            
            // Refresh transactions
            const accountId = localStorage.getItem('accountId');
            const filter = document.querySelector('input[name="transaction-filter"]:checked').value;
            loadTransactions(accountId, filter);
            loadMonthlySummary(accountId);
            loadTransactionTypeChart(accountId);
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error responding to request:', error);
        alert('An error occurred. Please try again.');
    });
}