package com.example.banking_app.repository;


import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;

import com.example.banking_app.model.Card;

@Repository
public class CardRepository {
    private List<Card> cards = new ArrayList<>();
    
    public Card save(Card card) {
        // If the card already exists, update it
        if (card.getId() != null) {
            Optional<Card> existingCard = findById(card.getId());
            if (existingCard.isPresent()) {
                cards.remove(existingCard.get());
            }
        }
        
        cards.add(card);
        return card;
    }
    
    public Optional<Card> findById(String id) {
        return cards.stream()
                .filter(card -> card.getId().equals(id))
                .findFirst();
    }
    
    public Optional<Card> findByCardNumber(String cardNumber) {
        return cards.stream()
                .filter(card -> card.getCardNumber().equals(cardNumber))
                .findFirst();
    }
    
    public List<Card> findByAccountId(String accountId) {
        return cards.stream()
                .filter(card -> card.getAccountId().equals(accountId))
                .collect(Collectors.toList());
    }
    
    public List<Card> findAll() {
        return new ArrayList<>(cards);
    }
    
    public void deleteById(String id) {
        cards.removeIf(card -> card.getId().equals(id));
    }
}