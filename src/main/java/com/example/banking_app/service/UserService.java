package com.example.banking_app.service;


import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.banking_app.dto.LoginDTO;
import com.example.banking_app.dto.RegisterDTO;
import com.example.banking_app.dto.UserDTO;
import com.example.banking_app.model.Account;
import com.example.banking_app.model.User;
import com.example.banking_app.repository.UserRepository;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AccountService accountService;
    
    /**
     * Register a new user
     * 
     * @param registerDTO The registration details
     * @return The created user
     * @throws RuntimeException if validation fails
     */
    public UserDTO register(RegisterDTO registerDTO) {
        // Check if username is already taken
        if (userRepository.findByUsername(registerDTO.getUsername()).isPresent()) {
            throw new RuntimeException("Username is already taken");
        }
        
        // Check if email is already registered
        if (userRepository.findByEmail(registerDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }
        
        // Create user
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setPassword(registerDTO.getPassword()); // In a real app, you should hash the password
        user.setEmail(registerDTO.getEmail());
        user.setFullName(registerDTO.getFullName());
        user.setMobile(registerDTO.getMobile());
        user.setAddress(registerDTO.getAddress());
        
        User savedUser = userRepository.save(user);
        
        // Create default account for the user
        Account account = accountService.createAccount(savedUser.getId());
        savedUser.addAccountId(account.getId());
        userRepository.save(savedUser);
        
        return convertToDTO(savedUser);
    }
    
    /**
     * Login user
     * 
     * @param loginDTO The login details
     * @return The logged in user
     * @throws RuntimeException if validation fails
     */
    public UserDTO login(LoginDTO loginDTO) {
        User user = userRepository.findByUsername(loginDTO.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // In a real app, you would compare hashed passwords
        if (!user.getPassword().equals(loginDTO.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        
        return convertToDTO(user);
    }
    
    /**
     * Get user by ID
     * 
     * @param userId The user ID
     * @return Optional of UserDTO if found, empty otherwise
     */
    public Optional<UserDTO> getUserById(String userId) {
        return userRepository.findById(userId)
                .map(this::convertToDTO);
    }
    
    /**
     * Get all users
     * 
     * @return List of users
     */
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Update user password
     * 
     * @param username The username
     * @param oldPassword The old password
     * @param newPassword The new password
     * @return The updated user
     * @throws RuntimeException if validation fails
     */
    public UserDTO updatePassword(String username, String oldPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // In a real app, you would compare hashed passwords
        if (!user.getPassword().equals(oldPassword)) {
            throw new RuntimeException("Invalid old password");
        }
        
        // In a real app, you would hash the new password
        user.setPassword(newPassword);
        User updatedUser = userRepository.save(user);
        
        return convertToDTO(updatedUser);
    }
    
    /**
     * Convert User entity to UserDTO
     * 
     * @param user The User entity
     * @return The UserDTO
     */
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setMobile(user.getMobile());
        dto.setAddress(user.getAddress());
        dto.setAccountIds(user.getAccountIds());
        return dto;
    }
}
