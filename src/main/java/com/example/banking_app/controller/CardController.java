package com.example.banking_app.controller;


import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.banking_app.dto.CardDTO;
import com.example.banking_app.service.CardService;

@RestController
@RequestMapping("/api/cards")
public class CardController {
    
    @Autowired
    private CardService cardService;
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getCard(@PathVariable String id) {
        Optional<CardDTO> cardOpt = cardService.getCardById(id);
        
        if (cardOpt.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("card", cardOpt.get());
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Card not found");
            return ResponseEntity.status(404).body(response);
        }
    }
    
    @PutMapping("/{id}/block")
    public ResponseEntity<?> toggleCardBlock(@PathVariable String id, @RequestBody Map<String, Boolean> blockData) {
        try {
            boolean blocked = blockData.get("blocked");
            CardDTO updatedCard = cardService.toggleCardBlock(id, blocked);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("card", updatedCard);
            response.put("message", blocked ? "Card blocked successfully" : "Card unblocked successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}