package com.example.banking_app.repository;


import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.example.banking_app.model.User;

@Repository
public class UserRepository {
    private List<User> users = new ArrayList<>();
    
    public User save(User user) {
        // If the user already exists, update it
        if (user.getId() != null) {
            Optional<User> existingUser = findById(user.getId());
            if (existingUser.isPresent()) {
                users.remove(existingUser.get());
            }
        }
        
        users.add(user);
        return user;
    }
    
    public Optional<User> findById(String id) {
        return users.stream()
                .filter(user -> user.getId().equals(id))
                .findFirst();
    }
    
    public Optional<User> findByUsername(String username) {
        return users.stream()
                .filter(user -> user.getUsername().equals(username))
                .findFirst();
    }
    
    public Optional<User> findByEmail(String email) {
        return users.stream()
                .filter(user -> user.getEmail().equals(email))
                .findFirst();
    }
    
    public List<User> findAll() {
        return new ArrayList<>(users);
    }
    
    public void deleteById(String id) {
        users.removeIf(user -> user.getId().equals(id));
    }
}