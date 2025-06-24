package com.example.banking_app.model;

import java.time.LocalDate;
import java.util.Random;
import java.util.UUID;

public class Card {
    public enum CardType {
        CREDIT,
        DEBIT
    }

    private String id;
    private String accountId;
    private String cardNumber;
    private String cardholderName;
    private LocalDate expiryDate;
    private String cvv;
    private CardType type;
    private double limit;
    private boolean isBlocked;
    
    public Card() {
        this.id = UUID.randomUUID().toString();
        this.cardNumber = generateCardNumber();
        this.cvv = generateCVV();
        this.expiryDate = LocalDate.now().plusYears(5);
        this.isBlocked = false;
    }
    
    private String generateCardNumber() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        
        // Generate 16-digit card number (4 groups of 4 digits)
        for (int i = 0; i < 4; i++) {
            int groupNum = 1000 + random.nextInt(9000); // 4-digit number between 1000-9999
            sb.append(groupNum);
            if (i < 3) {
                sb.append(" ");
            }
        }
        
        return sb.toString();
    }
    
    private String generateCVV() {
        Random random = new Random();
        return String.format("%03d", random.nextInt(1000)); // 3-digit number between 000-999
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public String getCardholderName() {
        return cardholderName;
    }

    public void setCardholderName(String cardholderName) {
        this.cardholderName = cardholderName;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getCvv() {
        return cvv;
    }

    public void setCvv(String cvv) {
        this.cvv = cvv;
    }

    public CardType getType() {
        return type;
    }

    public void setType(CardType type) {
        this.type = type;
    }

    public double getLimit() {
        return limit;
    }

    public void setLimit(double limit) {
        this.limit = limit;
    }

    public boolean isBlocked() {
        return isBlocked;
    }

    public void setBlocked(boolean isBlocked) {
        this.isBlocked = isBlocked;
    }
}