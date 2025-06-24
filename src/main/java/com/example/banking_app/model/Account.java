package com.example.banking_app.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Account {
    private String id;
    private String accountNumber;
    private String ifscCode;
    private String userId;
    private double balance;
    private String upiId;
    private List<Card> cards;
    private List<Transaction> transactions;
    private double dailyLimit;
    private double todaySpent;
    private LocalDateTime lastResetDate;
    private boolean isParentAccount;
    private List<String> linkedChildAccounts;
    private String parentAccountId;
    
    public Account() {
        this.id = UUID.randomUUID().toString();
        this.accountNumber = generateAccountNumber();
        this.balance = 0.0;
        this.transactions = new ArrayList<>();
        this.cards = new ArrayList<>();
        this.dailyLimit = Double.MAX_VALUE; // Unlimited by default
        this.todaySpent = 0.0;
        this.lastResetDate = LocalDateTime.now();
        this.isParentAccount = true;
        this.linkedChildAccounts = new ArrayList<>();
        this.parentAccountId = null;
    }
    
    private String generateAccountNumber() {
        // Generate a 12-digit account number
        return String.format("%012d", (long)(Math.random() * 1000000000000L));
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getIfscCode() {
        return ifscCode;
    }

    public void setIfscCode(String ifscCode) {
        this.ifscCode = ifscCode;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }

    public String getUpiId() {
        return upiId;
    }

    public void setUpiId(String upiId) {
        this.upiId = upiId;
    }

    public List<Card> getCards() {
        return cards;
    }

    public void setCards(List<Card> cards) {
        this.cards = cards;
    }
    
    public void addCard(Card card) {
        this.cards.add(card);
    }

    public List<Transaction> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<Transaction> transactions) {
        this.transactions = transactions;
    }
    
    public void addTransaction(Transaction transaction) {
        this.transactions.add(transaction);
    }

    public double getDailyLimit() {
        return dailyLimit;
    }

    public void setDailyLimit(double dailyLimit) {
        this.dailyLimit = dailyLimit;
    }

    public double getTodaySpent() {
        return todaySpent;
    }

    public void setTodaySpent(double todaySpent) {
        this.todaySpent = todaySpent;
    }
    
    public void addToTodaySpent(double amount) {
        this.todaySpent += amount;
    }

    public LocalDateTime getLastResetDate() {
        return lastResetDate;
    }

    public void setLastResetDate(LocalDateTime lastResetDate) {
        this.lastResetDate = lastResetDate;
    }

    public boolean isParentAccount() {
        return isParentAccount;
    }

    public void setParentAccount(boolean isParentAccount) {
        this.isParentAccount = isParentAccount;
    }

    public List<String> getLinkedChildAccounts() {
        if (linkedChildAccounts == null) {
            linkedChildAccounts = new ArrayList<>();
        }
        return linkedChildAccounts;
    }

    public void setLinkedChildAccounts(List<String> linkedChildAccounts) {
        this.linkedChildAccounts = linkedChildAccounts;
    }
    
    public void addLinkedChildAccount(String childAccountId) {
        if (this.linkedChildAccounts == null) {
            this.linkedChildAccounts = new ArrayList<>();
        }
        if (!this.linkedChildAccounts.contains(childAccountId)) {
            this.linkedChildAccounts.add(childAccountId);
        }
    }
    
    public String getParentAccountId() {
        return parentAccountId;
    }
    
    public void setParentAccountId(String parentAccountId) {
        this.parentAccountId = parentAccountId;
    }
}