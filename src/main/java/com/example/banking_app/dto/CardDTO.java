package com.example.banking_app.dto;


import java.time.LocalDate;

import com.example.banking_app.model.Card.CardType;

public class CardDTO {
    private String id;
    private String accountId;
    private String cardNumber;
    private String cardholderName;
    private LocalDate expiryDate;
    private CardType type;
    private double limit;
    private boolean isBlocked;
    
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