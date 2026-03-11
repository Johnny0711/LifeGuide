package com.lifeguide.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private java.util.UUID id;

    @Column(name = "auth0_id", unique = true, nullable = false)
    private String auth0Id; // e.g., "auth0|12345"
    
    @Column(nullable = false)
    private String email;

    private String name;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(unique = true)
    private String username;

    private Integer age;

    @Column(name = "height_cm")
    private Double heightCm;

    @Column(name = "current_weight_kg")
    private Double currentWeightKg;

    public User() {}

    public java.util.UUID getId() {
        return id;
    }

    public void setId(java.util.UUID id) {
        this.id = id;
    }

    public String getAuth0Id() {
        return auth0Id;
    }

    public void setAuth0Id(String auth0Id) {
        this.auth0Id = auth0Id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public Double getHeightCm() {
        return heightCm;
    }

    public void setHeightCm(Double heightCm) {
        this.heightCm = heightCm;
    }

    public Double getCurrentWeightKg() {
        return currentWeightKg;
    }

    public void setCurrentWeightKg(Double currentWeightKg) {
        this.currentWeightKg = currentWeightKg;
    }
}
