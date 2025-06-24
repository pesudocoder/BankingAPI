// Execute when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    checkAuth();
    
    // Fetch user accounts and populate the dropdown
    fetchUserAccounts();
    
    // Set up service forms
    setupBillPaymentForm();
    setupMobileRechargeForm();
    
    // Set up card management
    setupCardManagement();
    setupDebitCardForm();
    setupCreditCardForm();
    setupCreateCardForm();
    
    // Set up logout functionality
    document.getElementById('logout-button').addEventListener('click', function() {
        localStorage.removeItem('user');
        localStorage.removeItem('accountId');
        window.location.href = 'login.html';
    });
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
                        
                        // Load user cards
                        loadUserCards();
                    });
                });
                
                // Select first account by default if no account is selected
                const accountId = localStorage.getItem('accountId');
                if (!accountId && data.accounts.length > 0) {
                    // Store first account ID
                    localStorage.setItem('accountId', data.accounts[0].id);
                    
                    // Update dropdown button text
                    document.getElementById('accountDropdown').textContent = `Account ****${data.accounts[0].accountNumber.slice(-4)}`;
                    
                    // Load user cards
                    loadUserCards();
                } else if (accountId) {
                    // Find account in the list
                    const selectedAccount = data.accounts.find(account => account.id === accountId);
                    if (selectedAccount) {
                        // Update dropdown button text
                        document.getElementById('accountDropdown').textContent = `Account ****${selectedAccount.accountNumber.slice(-4)}`;
                        
                        // Load user cards
                        loadUserCards();
                    } else if (data.accounts.length > 0) {
                        // If selected account not found, select first account
                        localStorage.setItem('accountId', data.accounts[0].id);
                        
                        // Update dropdown button text
                        document.getElementById('accountDropdown').textContent = `Account ****${data.accounts[0].accountNumber.slice(-4)}`;
                        
                        // Load user cards
                        loadUserCards();
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

// Setup bill payment form
function setupBillPaymentForm() {
    const billPaymentForm = document.getElementById('bill-payment-form');
    if (!billPaymentForm) return;
    
    billPaymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const billType = document.getElementById('bill-type').value;
        const billerId = document.getElementById('biller-id').value;
        const amount = document.getElementById('bill-amount').value;
        
        // Validate inputs
        if (!billType || !billerId || !amount) {
            showError('bill-payment-error', 'Please fill in all fields');
            return;
        }
        
        // Show loading state
        const submitButton = billPaymentForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
        
        // In a real app, this would make an API call to process the bill payment
        // For demo purposes, we'll simulate a successful payment
        
        setTimeout(() => {
            // Restore button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            
            // Show success message
            showSuccess('bill-payment-success', `${billType} bill payment of ${formatCurrency(parseFloat(amount))} processed successfully!`);
            
            // Reset form
            billPaymentForm.reset();
        }, 1500);
    });
}

// Setup mobile recharge form
function setupMobileRechargeForm() {
    const mobileRechargeForm = document.getElementById('mobile-recharge-form');
    if (!mobileRechargeForm) return;
    
    mobileRechargeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const mobileNumber = document.getElementById('mobile-number').value;
        const operator = document.getElementById('mobile-operator').value;
        const amount = document.getElementById('recharge-amount').value;
        
        // Validate inputs
        if (!mobileNumber || !operator || !amount) {
            showError('mobile-recharge-error', 'Please fill in all fields');
            return;
        }
        
        // Validate mobile number
        if (!/^\d{10}$/.test(mobileNumber)) {
            showError('mobile-recharge-error', 'Please enter a valid 10-digit mobile number');
            return;
        }
        
        // Show loading state
        const submitButton = mobileRechargeForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
        
        // In a real app, this would make an API call to process the mobile recharge
        // For demo purposes, we'll simulate a successful recharge
        
        setTimeout(() => {
            // Restore button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            
            // Show success message
            showSuccess('mobile-recharge-success', `Recharge of ${formatCurrency(parseFloat(amount))} for ${mobileNumber} (${operator}) processed successfully!`);
            
            // Reset form
            mobileRechargeForm.reset();
        }, 1500);
    });
}

// Setup debit card form for card creation
function setupDebitCardForm() {
    const debitCardForm = document.getElementById('debit-card-form');
    if (!debitCardForm) return;
    
    debitCardForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const cardholderName = document.getElementById('debit-cardholder-name').value;
        
        // Validate inputs
        if (!cardholderName) {
            showError('debit-card-error', 'Please enter cardholder name');
            return;
        }
        
        // Show loading state
        const submitButton = debitCardForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
        
        const accountId = localStorage.getItem('accountId');
        
        // Send API request to create card
        fetch(`${API_BASE_URL}/accounts/${accountId}/cards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cardType: 'DEBIT',
                cardholderName: cardholderName
            })
        })
        .then(response => response.json())
        .then(data => {
            // Restore button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            
            if (data.success) {
                // Show success message
                showSuccess('debit-card-success', 'Debit card created successfully!');
                
                // Reset form
                debitCardForm.reset();
                
                // Refresh card list
                loadUserCards();
                
                // Close modal after 2 seconds
                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('debitCardModal'));
                    if (modal) {
                        modal.hide();
                    }
                }, 2000);
            } else {
                showError('debit-card-error', data.message || 'Failed to create debit card');
            }
        })
        .catch(error => {
            // Restore button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            
            console.error('Error creating debit card:', error);
            showError('debit-card-error', 'An error occurred. Please try again.');
        });
    });
}

// Setup credit card form for card creation
function setupCreditCardForm() {
    const creditCardForm = document.getElementById('credit-card-form');
    if (!creditCardForm) return;
    
    creditCardForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const cardholderName = document.getElementById('credit-cardholder-name').value;
        
        // Validate inputs
        if (!cardholderName) {
            showError('credit-card-error', 'Please enter cardholder name');
            return;
        }
        
        // Show loading state
        const submitButton = creditCardForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
        
        const accountId = localStorage.getItem('accountId');
        
        // Send API request to create card
        fetch(`${API_BASE_URL}/accounts/${accountId}/cards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cardType: 'CREDIT',
                cardholderName: cardholderName
            })
        })
        .then(response => response.json())
        .then(data => {
            // Restore button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            
            if (data.success) {
                // Show success message
                showSuccess('credit-card-success', 'Credit card created successfully!');
                
                // Reset form
                creditCardForm.reset();
                
                // Refresh card list
                loadUserCards();
                
                // Close modal after 2 seconds
                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('creditCardModal'));
                    if (modal) {
                        modal.hide();
                    }
                }, 2000);
            } else {
                showError('credit-card-error', data.message || 'Failed to create credit card');
            }
        })
        .catch(error => {
            // Restore button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            
            console.error('Error creating credit card:', error);
            showError('credit-card-error', 'An error occurred. Please try again.');
        });
    });
}

// Setup card management
function setupCardManagement() {
    const createCardForm = document.getElementById('create-card-form');
    if (!createCardForm) return;
    
    createCardForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const cardType = document.querySelector('input[name="card-type"]:checked').value;
        
        // Open appropriate modal based on card type
        if (cardType === 'DEBIT') {
            const debitModal = new bootstrap.Modal(document.getElementById('debitCardModal'));
            debitModal.show();
        } else if (cardType === 'CREDIT') {
            const creditModal = new bootstrap.Modal(document.getElementById('creditCardModal'));
            creditModal.show();
        }
    });
    
    // Load user cards
    loadUserCards();
}

// Setup create card form
function setupCreateCardForm() {
    // This function is handled by the card management setup
}

// Load user cards
function loadUserCards() {
    const cardsContainer = document.getElementById('user-cards-container');
    if (!cardsContainer) return;
    
    // Show loading state
    cardsContainer.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading cards...</p>
        </div>
    `;
    
    const accountId = localStorage.getItem('accountId');
    
    fetch(`${API_BASE_URL}/accounts/${accountId}/cards`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayUserCards(data.cards);
            } else {
                cardsContainer.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i> Error loading cards.
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error fetching user cards:', error);
            cardsContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i> Error loading cards.
                </div>
            `;
        });
}

// Display user cards
function displayUserCards(cards) {
    const cardsContainer = document.getElementById('user-cards-container');
    
    if (cards.length === 0) {
        cardsContainer.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-credit-card fa-2x text-muted mb-3"></i>
                <p>You don't have any cards yet</p>
                <p class="small text-muted mb-3">Create a new card to get started</p>
            </div>
        `;
        return;
    }
    
    // Create card elements
    let cardsHTML = '';
    
    cards.forEach(card => {
        const isCredit = card.type === 'CREDIT';
        const cardClass = isCredit ? 'bg-info text-white' : 'bg-primary text-white';
        const cardIcon = isCredit ? 'fab fa-cc-visa' : 'fab fa-cc-mastercard';
        const cardTypeText = isCredit ? 'Credit Card' : 'Debit Card';
        const cardStatus = card.isBlocked ? 'Blocked' : 'Active';
        const statusClass = card.isBlocked ? 'bg-danger' : 'bg-success';
        const actionText = card.isBlocked ? 'Unblock' : 'Block';
        const actionClass = card.isBlocked ? 'btn-outline-success' : 'btn-outline-danger';
        const actionIcon = card.isBlocked ? 'fas fa-lock-open' : 'fas fa-lock';
        
        const expiryMonth = card.expiryDate ? new Date(card.expiryDate).getMonth() + 1 : 12;
        const expiryYear = card.expiryDate ? new Date(card.expiryDate).getFullYear() % 100 : 25;
        const formattedExpiry = `${expiryMonth.toString().padStart(2, '0')}/${expiryYear}`;
        
        cardsHTML += `
            <div class="col-md-6 mb-4">
                <div class="card ${cardClass} h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h5 class="card-title">${cardTypeText}</h5>
                            <i class="${cardIcon} fa-2x"></i>
                        </div>
                        <div class="card-number mb-3">
                            <h6 class="text-muted small mb-1">Card Number</h6>
                            <h5>${card.cardNumber}</h5>
                        </div>
                        <div class="row">
                            <div class="col-7">
                                <h6 class="text-muted small mb-1">Cardholder Name</h6>
                                <p>${card.cardholderName}</p>
                            </div>
                            <div class="col-5">
                                <h6 class="text-muted small mb-1">Expires</h6>
                                <p>${formattedExpiry}</p>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <span class="badge ${statusClass}">${cardStatus}</span>
                            <div>
                                <button class="btn btn-sm btn-outline-light me-1" onclick="viewCardDetails('${card.cardNumber}')">
                                    <i class="fas fa-eye"></i> Details
                                </button>
                                <button class="btn btn-sm ${actionClass}" onclick="toggleCardBlock('${card.cardNumber}', ${!card.isBlocked})">
                                    <i class="${actionIcon}"></i> ${actionText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    cardsContainer.innerHTML = `<div class="row">${cardsHTML}</div>`;
}

// Toggle card block/unblock
function toggleCardBlock(cardNumber, action) {
    // Confirm action
    const actionText = action ? 'block' : 'unblock';
    if (!confirm(`Are you sure you want to ${actionText} this card?`)) {
        return;
    }
    
    // In a real app, this would make an API call to block/unblock the card
    // For demo purposes, we'll simulate a successful action
    
    setTimeout(() => {
        alert(`Card ${action ? 'blocked' : 'unblocked'} successfully!`);
        
        // Refresh card list
        loadUserCards();
    }, 1000);
}

// View card details
function viewCardDetails(cardNumber) {
    // In a real app, this would fetch and display detailed card information
    // For demo purposes, we'll show a simple alert
    
    alert(`Card details for ${cardNumber}\n\nThis would typically display detailed card information, transaction history, and additional management options.`);
}