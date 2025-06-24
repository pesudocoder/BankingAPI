package com.example.banking_app.repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;

import com.example.banking_app.model.Transaction;

@Repository
public class TransactionRepository {
    private List<Transaction> transactions = new ArrayList<>();
    
    public Transaction save(Transaction transaction) {
        // If the transaction already exists, update it
        if (transaction.getId() != null) {
            Optional<Transaction> existingTransaction = findById(transaction.getId());
            if (existingTransaction.isPresent()) {
                transactions.remove(existingTransaction.get());
            }
        }
        
        transactions.add(transaction);
        return transaction;
    }
    
    public Optional<Transaction> findById(String id) {
        return transactions.stream()
                .filter(transaction -> transaction.getId().equals(id))
                .findFirst();
    }
    
    public List<Transaction> findByAccountId(String accountId) {
        return transactions.stream()
                .filter(transaction -> 
                    (transaction.getFromAccountId() != null && transaction.getFromAccountId().equals(accountId)) || 
                    (transaction.getToAccountId() != null && transaction.getToAccountId().equals(accountId)))
                .collect(Collectors.toList());
    }
    
    public List<Transaction> findByAccountIdAndDateRange(String accountId, LocalDateTime startDate, LocalDateTime endDate) {
        return transactions.stream()
                .filter(transaction -> 
                    ((transaction.getFromAccountId() != null && transaction.getFromAccountId().equals(accountId)) || 
                     (transaction.getToAccountId() != null && transaction.getToAccountId().equals(accountId))) &&
                    transaction.getTimestamp().isAfter(startDate) &&
                    transaction.getTimestamp().isBefore(endDate))
                .collect(Collectors.toList());
    }
    
    public List<Transaction> findAll() {
        return new ArrayList<>(transactions);
    }
    
    public void deleteById(String id) {
        transactions.removeIf(transaction -> transaction.getId().equals(id));
    }
}