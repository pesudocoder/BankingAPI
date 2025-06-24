package com.example.banking_app.service;


import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.banking_app.dto.CardDTO;
import com.example.banking_app.model.Card;
import com.example.banking_app.repository.CardRepository;

@Service
public class CardService {
    
    @Autowired
    private CardRepository cardRepository;
    
    /**
     * Convert Card entity to CardDTO
     * 
     * @param card The Card entity
     * @return The CardDTO
     */
    public CardDTO convertToDTO(Card card) {
        CardDTO dto = new CardDTO();
        dto.setId(card.getId());
        dto.setAccountId(card.getAccountId());
        dto.setCardNumber(card.getCardNumber());
        dto.setCardholderName(card.getCardholderName());
        dto.setExpiryDate(card.getExpiryDate());
        dto.setType(card.getType());
        dto.setLimit(card.getLimit());
        dto.setBlocked(card.isBlocked());
        return dto;
    }
    
    /**
     * Get card by ID
     * 
     * @param cardId The card ID
     * @return Optional of CardDTO if found, empty otherwise
     */
    public Optional<CardDTO> getCardById(String cardId) {
        return cardRepository.findById(cardId)
                .map(this::convertToDTO);
    }
    
    /**
     * Get all cards for an account
     * 
     * @param accountId The account ID
     * @return List of CardDTOs
     */
    public List<CardDTO> getCardsByAccountId(String accountId) {
        return cardRepository.findByAccountId(accountId).stream()
                .map(this::convertToDTO)
                .toList();
    }
    
    /**
     * Block/unblock a card
     * 
     * @param cardId The card ID
     * @param blocked Whether to block (true) or unblock (false)
     * @return The updated CardDTO
     * @throws RuntimeException if card not found
     */
    public CardDTO toggleCardBlock(String cardId, boolean blocked) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        
        card.setBlocked(blocked);
        Card updatedCard = cardRepository.save(card);
        
        return convertToDTO(updatedCard);
    }
}