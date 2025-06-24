package com.example.banking_app.controller;


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
import org.springframework.web.bind.annotation.RestController;

import com.example.banking_app.model.Account;
import com.example.banking_app.model.Card;
import com.example.banking_app.service.AccountService;
import com.example.banking_app.service.CardService;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {
    
    @Autowired
    private AccountService accountService;
    
    @Autowired
    private CardService cardService;
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getAccount(@PathVariable String id) {
        Optional<Account> accountOpt = accountService.getAccountById(id);
        
        if (accountOpt.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("account", accountOpt.get());
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Account not found");
            return ResponseEntity.status(404).body(response);
        }
    }
    
    @GetMapping("/number/{accountNumber}")
    public ResponseEntity<?> getAccountByNumber(@PathVariable String accountNumber) {
        Optional<Account> accountOpt = accountService.getAccountByNumber(accountNumber);
        
        if (accountOpt.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("account", accountOpt.get());
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Account not found");
            return ResponseEntity.status(404).body(response);
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getAccountsByUserId(@PathVariable String userId) {
        List<Account> accounts = accountService.getAccountsByUserId(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("accounts", accounts);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/balance")
    public ResponseEntity<?> updateBalance(@PathVariable String id, @RequestBody Map<String, Object> updateData) {
        try {
            double newBalance = ((Number) updateData.get("balance")).doubleValue();
            Account updatedAccount = accountService.updateBalance(id, newBalance);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("account", updatedAccount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/{id}/daily-limit")
    public ResponseEntity<?> updateDailyLimit(@PathVariable String id, @RequestBody Map<String, Object> updateData) {
        try {
            double dailyLimit = ((Number) updateData.get("dailyLimit")).doubleValue();
            Account updatedAccount = accountService.updateDailyLimit(id, dailyLimit);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("account", updatedAccount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/{id}/cards")
    public ResponseEntity<?> createCard(@PathVariable String id, @RequestBody Map<String, Object> cardData) {
        try {
            String cardType = (String) cardData.get("cardType");
            String cardholderName = (String) cardData.get("cardholderName");
            
            Card.CardType type = "CREDIT".equalsIgnoreCase(cardType) ? Card.CardType.CREDIT : Card.CardType.DEBIT;
            Card card = accountService.createCard(id, type, cardholderName);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("card", card);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/{id}/cards")
    public ResponseEntity<?> getCards(@PathVariable String id) {
        try {
            List<Card> cards = accountService.getCardsByAccountId(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("cards", cards);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/create-test-accounts")
    public ResponseEntity<?> createTestAccounts() {
        try {
            List<Account> accounts = accountService.createTestAccounts();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Test accounts created successfully");
            response.put("accounts", accounts);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/link")
    public ResponseEntity<?> linkAccounts(@RequestBody Map<String, String> linkData) {
        try {
            String parentAccountNumber = linkData.get("parentAccountNumber");
            String childAccountNumber = linkData.get("childAccountNumber");
            
            accountService.linkAccounts(parentAccountNumber, childAccountNumber);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Accounts linked successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/{id}/children")
    public ResponseEntity<?> getChildAccounts(@PathVariable String id) {
        try {
            List<Account> childAccounts = accountService.getChildAccounts(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("childAccounts", childAccounts);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/{id}/parent")
    public ResponseEntity<?> getParentAccount(@PathVariable String id) {
        try {
            Optional<Account> parentAccountOpt = accountService.getParentAccount(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            
            if (parentAccountOpt.isPresent()) {
                response.put("parentAccount", parentAccountOpt.get());
            } else {
                response.put("message", "No parent account found");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}