package com.example.banking_app.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.banking_app.dto.MoneyTransferDTO;
import com.example.banking_app.dto.TransactionDTO;
import com.example.banking_app.model.Account;
import com.example.banking_app.model.Card;
import com.example.banking_app.model.Transaction;
import com.example.banking_app.model.Transaction.TransactionStatus;
import com.example.banking_app.model.Transaction.TransactionType;
import com.example.banking_app.repository.AccountRepository;
import com.example.banking_app.repository.TransactionRepository;

@Service
public class TransactionService {
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private AccountRepository accountRepository;
    
    @Autowired
    private AccountService accountService;
    
    /**
     * Transfer money from one account to another
     * 
     * @param transferDTO The transfer details
     * @return The created transaction
     * @throws RuntimeException if validation fails
     */
    public TransactionDTO transferMoney(MoneyTransferDTO transferDTO) {
        // Validate and get source account
        Account fromAccount = accountRepository.findById(transferDTO.getFromAccountId())
                .orElseThrow(() -> new RuntimeException("Source account not found"));
        
        // Check daily limit
        accountService.checkAndResetDailySpent(fromAccount);
        double newTodaySpent = fromAccount.getTodaySpent() + transferDTO.getAmount();
        if (newTodaySpent > fromAccount.getDailyLimit()) {
            throw new RuntimeException("Daily spending limit exceeded");
        }
        
        // Check sufficient balance
        if (fromAccount.getBalance() < transferDTO.getAmount()) {
            throw new RuntimeException("Insufficient balance");
        }
        
        Account toAccount = null;
        TransactionType transactionType = null;
        
        // Process based on transfer type
        switch (transferDTO.getTransferType()) {
            case UPI:
                transactionType = TransactionType.UPI_TRANSFER;
                // Validate UPI
                if (transferDTO.getToUpiId() == null || transferDTO.getToUpiId().isEmpty()) {
                    throw new RuntimeException("UPI ID is required");
                }
                
                toAccount = accountRepository.findByUpiId(transferDTO.getToUpiId())
                        .orElseThrow(() -> new RuntimeException("Recipient UPI ID not found"));
                
                // UPI PIN validation would normally be done here
                break;
                
            case CREDIT_CARD:
                transactionType = TransactionType.CARD_TRANSFER;
                // Validate Credit Card
                if (transferDTO.getCreditCardNumber() == null || transferDTO.getCreditCardNumber().isEmpty()) {
                    throw new RuntimeException("Credit Card number is required");
                }
                
                if (transferDTO.getCvv() == null || transferDTO.getCvv().isEmpty()) {
                    throw new RuntimeException("CVV is required");
                }
                
                // Find card and its associated account
                Optional<Card> cardOpt = accountService.getCardByNumber(transferDTO.getCreditCardNumber());
                if (!cardOpt.isPresent()) {
                    throw new RuntimeException("Credit Card not found");
                }
                
                Card card = cardOpt.get();
                if (card.isBlocked()) {
                    throw new RuntimeException("Credit Card is blocked");
                }
                
                if (!card.getCvv().equals(transferDTO.getCvv())) {
                    throw new RuntimeException("Invalid CVV");
                }
                
                toAccount = accountRepository.findById(card.getAccountId())
                        .orElseThrow(() -> new RuntimeException("Recipient account not found"));
                break;
                
            case DEBIT_CARD:
                transactionType = TransactionType.CARD_TRANSFER;
                // Validate Debit Card
                if (transferDTO.getDebitCardNumber() == null || transferDTO.getDebitCardNumber().isEmpty()) {
                    throw new RuntimeException("Debit Card number is required");
                }
                
                if (transferDTO.getCvv() == null || transferDTO.getCvv().isEmpty()) {
                    throw new RuntimeException("CVV is required");
                }
                
                // Find card and its associated account
                Optional<Card> debitCardOpt = accountService.getCardByNumber(transferDTO.getDebitCardNumber());
                if (!debitCardOpt.isPresent()) {
                    throw new RuntimeException("Debit Card not found");
                }
                
                Card debitCard = debitCardOpt.get();
                if (debitCard.isBlocked()) {
                    throw new RuntimeException("Debit Card is blocked");
                }
                
                if (!debitCard.getCvv().equals(transferDTO.getCvv())) {
                    throw new RuntimeException("Invalid CVV");
                }
                
                toAccount = accountRepository.findById(debitCard.getAccountId())
                        .orElseThrow(() -> new RuntimeException("Recipient account not found"));
                break;
                
            default:
                throw new RuntimeException("Invalid transfer type");
        }
        
        // Create transaction
        Transaction transaction = new Transaction();
        transaction.setFromAccountId(fromAccount.getId());
        transaction.setToAccountId(toAccount.getId());
        transaction.setAmount(transferDTO.getAmount());
        transaction.setDescription(transferDTO.getNote() != null ? transferDTO.getNote() : "Money Transfer");
        transaction.setType(transactionType);
        
        // Update balances
        fromAccount.setBalance(fromAccount.getBalance() - transferDTO.getAmount());
        fromAccount.addToTodaySpent(transferDTO.getAmount());
        toAccount.setBalance(toAccount.getBalance() + transferDTO.getAmount());
        
        // Save all changes
        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);
        
        transaction.setStatus(TransactionStatus.COMPLETED);
        Transaction savedTransaction = transactionRepository.save(transaction);
        
        // Add transaction to accounts
        fromAccount.addTransaction(savedTransaction);
        toAccount.addTransaction(savedTransaction);
        
        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);
        
        return convertToDTO(savedTransaction);
    }
    
    /**
     * Add money to an account (deposit)
     * 
     * @param accountId The account ID
     * @param amount The amount to add
     * @param source The source of funds (UPI or DEBIT_CARD)
     * @param sourceInfo Additional source information
     * @return The created transaction
     * @throws RuntimeException if account not found
     */
    public TransactionDTO addMoney(String accountId, double amount, String source, String sourceInfo) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        Transaction transaction = new Transaction();
        transaction.setToAccountId(accountId);
        transaction.setAmount(amount);
        transaction.setDescription("Add money via " + source);
        transaction.setType(TransactionType.DEPOSIT);
        
        // Update balance
        account.setBalance(account.getBalance() + amount);
        accountRepository.save(account);
        
        transaction.setStatus(TransactionStatus.COMPLETED);
        Transaction savedTransaction = transactionRepository.save(transaction);
        
        // Add transaction to account
        account.addTransaction(savedTransaction);
        accountRepository.save(account);
        
        return convertToDTO(savedTransaction);
    }
    
    /**
     * Request money from a parent account
     * 
     * @param childAccountId The child account ID
     * @param amount The amount to request
     * @param note Optional note
     * @return The created transaction (in PENDING status)
     * @throws RuntimeException if validation fails
     */
    public TransactionDTO requestMoney(String childAccountId, double amount, String note) {
        Account childAccount = accountRepository.findById(childAccountId)
                .orElseThrow(() -> new RuntimeException("Child account not found"));
        
        // Check if this is a linked child account
        String parentAccountId = childAccount.getParentAccountId();
        Account parentAccount;
        
        if (parentAccountId != null) {
            // If it has a parent account set, use that
            parentAccount = accountRepository.findById(parentAccountId)
                    .orElseThrow(() -> new RuntimeException("Parent account not found"));
        } else {
            // Legacy fallback - find parent account by user ID
            if (childAccount.getUserId() == null) {
                throw new RuntimeException("Account doesn't have a user and is not linked to a parent account");
            }
            
            // Find all accounts for the user
            List<Account> userAccounts = accountRepository.findByUserId(childAccount.getUserId());
            
            // Find a parent account
            parentAccount = userAccounts.stream()
                    .filter(Account::isParentAccount)
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No parent account found for this user"));
        }
        
        Transaction transaction = new Transaction();
        transaction.setFromAccountId(parentAccount.getId());
        transaction.setToAccountId(childAccountId);
        transaction.setAmount(amount);
        transaction.setDescription(note != null ? note : "Money request");
        transaction.setType(TransactionType.REQUEST_MONEY);
        transaction.setStatus(TransactionStatus.PENDING);
        
        Transaction savedTransaction = transactionRepository.save(transaction);
        
        // Add transaction to both accounts
        parentAccount.addTransaction(savedTransaction);
        childAccount.addTransaction(savedTransaction);
        
        accountRepository.save(parentAccount);
        accountRepository.save(childAccount);
        
        return convertToDTO(savedTransaction);
    }
    
    /**
     * Approve or reject a money request
     * 
     * @param transactionId The transaction ID
     * @param approved Whether to approve (true) or reject (false)
     * @return The updated transaction
     * @throws RuntimeException if validation fails
     */
    public TransactionDTO respondToMoneyRequest(String transactionId, boolean approved) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        if (transaction.getType() != TransactionType.REQUEST_MONEY) {
            throw new RuntimeException("This is not a money request transaction");
        }
        
        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new RuntimeException("This request has already been processed");
        }
        
        Account fromAccount = accountRepository.findById(transaction.getFromAccountId())
                .orElseThrow(() -> new RuntimeException("Source account not found"));
        
        Account toAccount = accountRepository.findById(transaction.getToAccountId())
                .orElseThrow(() -> new RuntimeException("Destination account not found"));
        
        if (approved) {
            // Check daily limit
            accountService.checkAndResetDailySpent(fromAccount);
            double newTodaySpent = fromAccount.getTodaySpent() + transaction.getAmount();
            if (newTodaySpent > fromAccount.getDailyLimit()) {
                throw new RuntimeException("Daily spending limit exceeded");
            }
            
            // Check sufficient balance
            if (fromAccount.getBalance() < transaction.getAmount()) {
                throw new RuntimeException("Insufficient balance");
            }
            
            // Update balances
            fromAccount.setBalance(fromAccount.getBalance() - transaction.getAmount());
            fromAccount.addToTodaySpent(transaction.getAmount());
            toAccount.setBalance(toAccount.getBalance() + transaction.getAmount());
            
            transaction.setStatus(TransactionStatus.COMPLETED);
        } else {
            transaction.setStatus(TransactionStatus.REJECTED);
        }
        
        // Save all changes
        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);
        Transaction savedTransaction = transactionRepository.save(transaction);
        
        return convertToDTO(savedTransaction);
    }
    
    /**
     * Get all transactions for an account
     * 
     * @param accountId The account ID
     * @return List of transaction DTOs
     */
    public List<TransactionDTO> getAccountTransactions(String accountId) {
        return transactionRepository.findByAccountId(accountId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get transactions for an account within a date range
     * 
     * @param accountId The account ID
     * @param startDate The start date
     * @param endDate The end date
     * @return List of transaction DTOs
     */
    public List<TransactionDTO> getAccountTransactionsByDateRange(String accountId, LocalDateTime startDate, LocalDateTime endDate) {
        return transactionRepository.findByAccountIdAndDateRange(accountId, startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get transaction by ID
     * 
     * @param transactionId The transaction ID
     * @return Optional of TransactionDTO if found, empty otherwise
     */
    public Optional<TransactionDTO> getTransactionById(String transactionId) {
        return transactionRepository.findById(transactionId)
                .map(this::convertToDTO);
    }
    
    /**
     * Convert Transaction entity to TransactionDTO
     * 
     * @param transaction The Transaction entity
     * @return The TransactionDTO
     */
    private TransactionDTO convertToDTO(Transaction transaction) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());
        dto.setFromUsername(transaction.getFromUsername());
        dto.setToUsername(transaction.getToUsername());
        dto.setAmount(transaction.getAmount());
        dto.setTimestamp(transaction.getTimestamp());
        dto.setType(transaction.getType());
        dto.setDescription(transaction.getDescription());
        dto.setStatus(transaction.getStatus());
        dto.setReferenceId(transaction.getReferenceId());
        return dto;
    }
}
