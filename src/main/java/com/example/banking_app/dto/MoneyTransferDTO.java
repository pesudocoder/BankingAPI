package com.example.banking_app.dto;

public class MoneyTransferDTO {
    public enum TransferType {
        UPI,
        CREDIT_CARD,
        DEBIT_CARD
    }
    
    private String fromAccountId;
    private TransferType transferType;
    private double amount;
    private String note;
    
    // UPI transfer fields
    private String toUpiId;
    private String upiPin;
    
    // Credit card transfer fields
    private String creditCardNumber;
    private String cvv;
    private String expiryDate;
    
    // Debit card transfer fields
    private String debitCardNumber;
    // (cvv and expiryDate are shared with credit card fields)
    
    public String getFromAccountId() {
        return fromAccountId;
    }
    
    public void setFromAccountId(String fromAccountId) {
        this.fromAccountId = fromAccountId;
    }
    
    public TransferType getTransferType() {
        return transferType;
    }
    
    public void setTransferType(TransferType transferType) {
        this.transferType = transferType;
    }
    
    public double getAmount() {
        return amount;
    }
    
    public void setAmount(double amount) {
        this.amount = amount;
    }
    
    public String getNote() {
        return note;
    }
    
    public void setNote(String note) {
        this.note = note;
    }
    
    public String getToUpiId() {
        return toUpiId;
    }
    
    public void setToUpiId(String toUpiId) {
        this.toUpiId = toUpiId;
    }
    
    public String getUpiPin() {
        return upiPin;
    }
    
    public void setUpiPin(String upiPin) {
        this.upiPin = upiPin;
    }
    
    public String getCreditCardNumber() {
        return creditCardNumber;
    }
    
    public void setCreditCardNumber(String creditCardNumber) {
        this.creditCardNumber = creditCardNumber;
    }
    
    public String getCvv() {
        return cvv;
    }
    
    public void setCvv(String cvv) {
        this.cvv = cvv;
    }
    
    public String getExpiryDate() {
        return expiryDate;
    }
    
    public void setExpiryDate(String expiryDate) {
        this.expiryDate = expiryDate;
    }
    
    public String getDebitCardNumber() {
        return debitCardNumber;
    }
    
    public void setDebitCardNumber(String debitCardNumber) {
        this.debitCardNumber = debitCardNumber;
    }
}