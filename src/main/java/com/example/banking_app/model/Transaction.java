package com.example.banking_app.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class Transaction {
    public enum TransactionType {
        TRANSFER,
        DEPOSIT,
        WITHDRAWAL,
        BILL_PAYMENT,
        MOBILE_RECHARGE,
        UPI_TRANSFER,
        CARD_TRANSFER,
        REQUEST_MONEY
    }
    
    public enum TransactionStatus {
        PENDING,
        COMPLETED,
        FAILED,
        REJECTED
    }
    
    private String id;
    private String fromAccountId;
    private String toAccountId;
    private String fromUsername;
    private String toUsername;
    private double amount;
    private LocalDateTime timestamp;
    private TransactionType type;
    private String description;
    private TransactionStatus status;
    private String referenceId;
    
    public Transaction() {
        this.id = UUID.randomUUID().toString();
        this.timestamp = LocalDateTime.now();
        this.status = TransactionStatus.COMPLETED;
        this.referenceId = "TXN" + System.currentTimeMillis();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFromAccountId() {
        return fromAccountId;
    }

    public void setFromAccountId(String fromAccountId) {
        this.fromAccountId = fromAccountId;
    }

    public String getToAccountId() {
        return toAccountId;
    }

    public void setToAccountId(String toAccountId) {
        this.toAccountId = toAccountId;
    }

    public String getFromUsername() {
        return fromUsername;
    }

    public void setFromUsername(String fromUsername) {
        this.fromUsername = fromUsername;
    }

    public String getToUsername() {
        return toUsername;
    }

    public void setToUsername(String toUsername) {
        this.toUsername = toUsername;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TransactionStatus getStatus() {
        return status;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }
}