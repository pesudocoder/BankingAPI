// Global variables
const API_BASE_URL = '/api';

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

// Format datetime
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Show success message
function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    successElement.textContent = message;
    successElement.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        successElement.style.display = 'none';
    }, 5000);
}

// Get status badge class
function getStatusBadgeClass(status) {
    switch (status) {
        case 'COMPLETED':
            return 'bg-success';
        case 'PENDING':
            return 'bg-warning';
        case 'FAILED':
            return 'bg-danger';
        case 'REJECTED':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

// Get transaction icon class
function getTransactionIconClass(type, amount, fromAccount) {
    const accountId = localStorage.getItem('accountId');
    const isOutgoing = fromAccount === accountId;
    
    if (type === 'DEPOSIT') {
        return 'fas fa-arrow-circle-down text-success';
    } else if (type === 'WITHDRAWAL') {
        return 'fas fa-arrow-circle-up text-danger';
    } else if (type === 'TRANSFER' || type === 'UPI_TRANSFER' || type === 'CARD_TRANSFER') {
        return isOutgoing ? 'fas fa-arrow-circle-up text-danger' : 'fas fa-arrow-circle-down text-success';
    } else if (type === 'BILL_PAYMENT') {
        return 'fas fa-file-invoice-dollar text-danger';
    } else if (type === 'MOBILE_RECHARGE') {
        return 'fas fa-mobile-alt text-danger';
    } else if (type === 'REQUEST_MONEY') {
        return 'fas fa-hand-holding-usd text-warning';
    } else {
        return 'fas fa-exchange-alt';
    }
}

// Get transaction icon (without context)
function getTransactionIcon(type) {
    switch (type) {
        case 'DEPOSIT':
            return 'fas fa-arrow-circle-down text-success';
        case 'WITHDRAWAL':
            return 'fas fa-arrow-circle-up text-danger';
        case 'TRANSFER':
        case 'UPI_TRANSFER':
        case 'CARD_TRANSFER':
            return 'fas fa-exchange-alt text-primary';
        case 'BILL_PAYMENT':
            return 'fas fa-file-invoice-dollar text-danger';
        case 'MOBILE_RECHARGE':
            return 'fas fa-mobile-alt text-danger';
        case 'REQUEST_MONEY':
            return 'fas fa-hand-holding-usd text-warning';
        default:
            return 'fas fa-exchange-alt';
    }
}

// Check if user is authenticated and redirect if not
function checkAuth() {
    const user = localStorage.getItem('user');
    const accountId = localStorage.getItem('accountId');
    
    if (!user || !accountId) {
        window.location.href = 'login.html';
    }
}

// Truncate text with ellipsis
function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substr(0, maxLength) + '...';
}