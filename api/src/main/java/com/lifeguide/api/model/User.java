package com.lifeguide.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private java.util.UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @Column(name = "needs_setup", nullable = false)
    private boolean needsSetup = false;

    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false, unique = true)
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isNeedsSetup() {
        return needsSetup;
    }

    public void setNeedsSetup(boolean needsSetup) {
        this.needsSetup = needsSetup;
    }
}
