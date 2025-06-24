package com.example.banking_app.controller;


import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.banking_app.dto.MoneyTransferDTO;
import com.example.banking_app.dto.TransactionDTO;
import com.example.banking_app.service.TransactionService;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    
    @Autowired
    private TransactionService transactionService;
    
    @PostMapping("/transfer")
    public ResponseEntity<?> transferMoney(@RequestBody MoneyTransferDTO transferDTO) {
        try {
            TransactionDTO transaction = transactionService.transferMoney(transferDTO);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Money transferred successfully");
            response.put("transaction", transaction);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/add-money")
    public ResponseEntity<?> addMoney(@RequestBody Map<String, Object> addMoneyData) {
        try {
            String accountId = (String) addMoneyData.get("accountId");
            Double amount = ((Number) addMoneyData.get("amount")).doubleValue();
            String source = (String) addMoneyData.get("source");
            String sourceInfo = (String) addMoneyData.get("sourceInfo");
            
            TransactionDTO transaction = transactionService.addMoney(accountId, amount, source, sourceInfo);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Money added successfully");
            response.put("transaction", transaction);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/request-money")
    public ResponseEntity<?> requestMoney(@RequestBody Map<String, Object> requestMoneyData) {
        try {
            String childAccountId = (String) requestMoneyData.get("childAccountId");
            Double amount = ((Number) requestMoneyData.get("amount")).doubleValue();
            String note = (String) requestMoneyData.get("note");
            
            TransactionDTO transaction = transactionService.requestMoney(childAccountId, amount, note);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Money request created successfully");
            response.put("transaction", transaction);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/request/{id}")
    public ResponseEntity<?> respondToMoneyRequest(@PathVariable String id, @RequestBody Map<String, Boolean> requestData) {
        try {
            boolean approved = requestData.get("approved");
            TransactionDTO transaction = transactionService.respondToMoneyRequest(id, approved);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", approved ? "Money request approved" : "Money request rejected");
            response.put("transaction", transaction);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/account/{accountId}")
    public ResponseEntity<?> getAccountTransactions(@PathVariable String accountId) {
        try {
            List<TransactionDTO> transactions = transactionService.getAccountTransactions(accountId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("transactions", transactions);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/account/{accountId}/date-range")
    public ResponseEntity<?> getAccountTransactionsByDateRange(
            @PathVariable String accountId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
            LocalDateTime start = LocalDateTime.parse(startDate, formatter);
            LocalDateTime end = LocalDateTime.parse(endDate, formatter);
            
            List<TransactionDTO> transactions = transactionService.getAccountTransactionsByDateRange(accountId, start, end);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("transactions", transactions);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error retrieving transactions: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getTransaction(@PathVariable String id) {
        Optional<TransactionDTO> transactionOpt = transactionService.getTransactionById(id);
        
        if (transactionOpt.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("transaction", transactionOpt.get());
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Transaction not found");
            return ResponseEntity.status(404).body(response);
        }
    }
}
