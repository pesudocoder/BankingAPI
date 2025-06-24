package com.example.banking_app.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;

import com.example.banking_app.model.Account;

@Repository
public class AccountRepository {
    private List<Account> accounts = new ArrayList<>();
    
    public Account save(Account account) {
        // If the account already exists, update it
        if (account.getId() != null) {
            Optional<Account> existingAccount = findById(account.getId());
            if (existingAccount.isPresent()) {
                accounts.remove(existingAccount.get());
            }
        }
        
        accounts.add(account);
        return account;
    }
    
    public Optional<Account> findById(String id) {
        return accounts.stream()
                .filter(account -> account.getId().equals(id))
                .findFirst();
    }
    
    public Optional<Account> findByAccountNumber(String accountNumber) {
        return accounts.stream()
                .filter(account -> account.getAccountNumber().equals(accountNumber))
                .findFirst();
    }
    
    public Optional<Account> findByUpiId(String upiId) {
        return accounts.stream()
                .filter(account -> account.getUpiId() != null && account.getUpiId().equals(upiId))
                .findFirst();
    }
    
    public List<Account> findByUserId(String userId) {
        return accounts.stream()
                .filter(account -> account.getUserId() != null && account.getUserId().equals(userId))
                .collect(Collectors.toList());
    }
    
    public List<Account> findAll() {
        return new ArrayList<>(accounts);
    }
    
    public void deleteById(String id) {
        accounts.removeIf(account -> account.getId().equals(id));
    }
}