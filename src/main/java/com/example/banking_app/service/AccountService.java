package com.example.banking_app.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.banking_app.model.Account;
import com.example.banking_app.model.Card;
import com.example.banking_app.repository.AccountRepository;
import com.example.banking_app.repository.CardRepository;

@Service
public class AccountService {
    
    @Autowired
    private AccountRepository accountRepository;
    
    @Autowired
    private CardRepository cardRepository;
    
    /**
     * Create a new account for a user
     * 
     * @param userId The user ID
     * @return The created account
     */
    public Account createAccount(String userId) {
        Account account = new Account();
        account.setUserId(userId);
        account.setIfscCode("BANK0001");
        account.setUpiId(userId + "@bank");
        
        return accountRepository.save(account);
    }
    
    /**
     * Create test accounts for demonstration
     * 
     * @return List of created accounts
     */
    public List<Account> createTestAccounts() {
        List<Account> testAccounts = new ArrayList<>();
        
        // Create first test account
        Account account1 = new Account();
        account1.setId("acc1");
        account1.setAccountNumber("111122223333");
        account1.setIfscCode("BANK0001");
        account1.setUserId("user1");
        account1.setBalance(50000.0);
        account1.setUpiId("user1@bank");
        account1.setDailyLimit(10000.0);
        accountRepository.save(account1);
        testAccounts.add(account1);
        
        // Create second test account
        Account account2 = new Account();
        account2.setId("acc2");
        account2.setAccountNumber("444455556666");
        account2.setIfscCode("BANK0001");
        account2.setUserId("user2");
        account2.setBalance(75000.0);
        account2.setUpiId("user2@bank");
        account2.setDailyLimit(20000.0);
        accountRepository.save(account2);
        testAccounts.add(account2);
        
        return testAccounts;
    }
    
    /**
     * Get account by ID
     * 
     * @param accountId The account ID
     * @return Optional of Account if found, empty otherwise
     */
    public Optional<Account> getAccountById(String accountId) {
        return accountRepository.findById(accountId);
    }
    
    /**
     * Get account by account number
     * 
     * @param accountNumber The account number
     * @return Optional of Account if found, empty otherwise
     */
    public Optional<Account> getAccountByNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber);
    }
    
    /**
     * Get all accounts for a user
     * 
     * @param userId The user ID
     * @return List of accounts
     */
    public List<Account> getAccountsByUserId(String userId) {
        return accountRepository.findByUserId(userId);
    }
    
    /**
     * Update account balance
     * 
     * @param accountId The account ID
     * @param newBalance The new balance
     * @return The updated account
     * @throws RuntimeException if account not found
     */
    public Account updateBalance(String accountId, double newBalance) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        account.setBalance(newBalance);
        return accountRepository.save(account);
    }
    
    /**
     * Update account daily limit
     * 
     * @param accountId The account ID
     * @param dailyLimit The new daily limit
     * @return The updated account
     * @throws RuntimeException if account not found
     */
    public Account updateDailyLimit(String accountId, double dailyLimit) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        account.setDailyLimit(dailyLimit);
        return accountRepository.save(account);
    }
    
    /**
     * Create a card for an account
     * 
     * @param accountId The account ID
     * @param type The card type (CREDIT or DEBIT)
     * @param cardholderName The cardholder name
     * @return The created card
     * @throws RuntimeException if account not found
     */
    public Card createCard(String accountId, Card.CardType type, String cardholderName) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        Card card = new Card();
        card.setAccountId(accountId);
        card.setType(type);
        card.setCardholderName(cardholderName);
        
        if (type == Card.CardType.CREDIT) {
            // Set default credit limit based on account balance
            card.setLimit(account.getBalance() * 0.5); // 50% of account balance
        }
        
        Card savedCard = cardRepository.save(card);
        account.addCard(savedCard);
        accountRepository.save(account);
        
        return savedCard;
    }
    
    /**
     * Get a card by card number
     * 
     * @param cardNumber The card number
     * @return Optional of Card if found, empty otherwise
     */
    public Optional<Card> getCardByNumber(String cardNumber) {
        return cardRepository.findByCardNumber(cardNumber);
    }
    
    /**
     * Get all cards for an account
     * 
     * @param accountId The account ID
     * @return List of cards
     */
    public List<Card> getCardsByAccountId(String accountId) {
        return cardRepository.findByAccountId(accountId);
    }
    
    /**
     * Block/unblock a card
     * 
     * @param cardId The card ID
     * @param blocked Whether to block (true) or unblock (false)
     * @return The updated card
     * @throws RuntimeException if card not found
     */
    public Card toggleCardBlock(String cardId, boolean blocked) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        
        card.setBlocked(blocked);
        return cardRepository.save(card);
    }
    
    /**
     * Link a parent account to a child account
     * 
     * @param parentAccountNumber The parent account number
     * @param childAccountNumber The child account number
     * @throws RuntimeException if validation fails
     */
    public void linkAccounts(String parentAccountNumber, String childAccountNumber) {
        if (parentAccountNumber.equals(childAccountNumber)) {
            throw new RuntimeException("Parent and child accounts cannot be the same");
        }
        
        Account parentAccount = accountRepository.findByAccountNumber(parentAccountNumber)
                .orElseThrow(() -> new RuntimeException("Parent account not found"));
        
        Account childAccount = accountRepository.findByAccountNumber(childAccountNumber)
                .orElseThrow(() -> new RuntimeException("Child account not found"));
        
        // Set parent-child relationship
        parentAccount.setParentAccount(true);
        parentAccount.addLinkedChildAccount(childAccount.getId());
        
        childAccount.setParentAccount(false);
        childAccount.setParentAccountId(parentAccount.getId());
        
        // Save both accounts
        accountRepository.save(parentAccount);
        accountRepository.save(childAccount);
    }
    
    /**
     * Get all child accounts for a parent account
     * 
     * @param parentAccountId The parent account ID
     * @return List of child accounts
     * @throws RuntimeException if parent account not found
     */
    public List<Account> getChildAccounts(String parentAccountId) {
        Account parentAccount = accountRepository.findById(parentAccountId)
                .orElseThrow(() -> new RuntimeException("Parent account not found"));
        
        List<Account> childAccounts = new ArrayList<>();
        
        if (parentAccount.getLinkedChildAccounts() != null) {
            for (String childId : parentAccount.getLinkedChildAccounts()) {
                accountRepository.findById(childId).ifPresent(childAccounts::add);
            }
        }
        
        return childAccounts;
    }
    
    /**
     * Get the parent account for a child account
     * 
     * @param childAccountId The child account ID
     * @return Optional of parent account if found, empty otherwise
     * @throws RuntimeException if child account not found
     */
    public Optional<Account> getParentAccount(String childAccountId) {
        Account childAccount = accountRepository.findById(childAccountId)
                .orElseThrow(() -> new RuntimeException("Child account not found"));
        
        if (childAccount.getParentAccountId() == null) {
            return Optional.empty();
        }
        
        return accountRepository.findById(childAccount.getParentAccountId());
    }
    
    /**
     * Check and reset daily spent amount if needed
     * 
     * @param account The account to check
     */
    public void checkAndResetDailySpent(Account account) {
        LocalDate today = LocalDate.now();
        LocalDate lastResetDate = account.getLastResetDate().toLocalDate();
        
        if (!today.equals(lastResetDate)) {
            account.setTodaySpent(0.0);
            account.setLastResetDate(LocalDateTime.now());
            accountRepository.save(account);
        }
    }
}