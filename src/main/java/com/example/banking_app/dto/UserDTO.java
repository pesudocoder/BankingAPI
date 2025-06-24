package com.example.banking_app.dto;


import java.util.List;

public class UserDTO {
    private String id;
    private String username;
    private String email;
    private String fullName;
    private String mobile;
    private String address;
    private List<String> accountIds;
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getMobile() {
        return mobile;
    }
    
    public void setMobile(String mobile) {
        this.mobile = mobile;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public List<String> getAccountIds() {
        return accountIds;
    }
    
    public void setAccountIds(List<String> accountIds) {
        this.accountIds = accountIds;
    }
}