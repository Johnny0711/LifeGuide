package com.lifeguide.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "gym_cards")
public class GymCard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "gym_name", nullable = false)
    private String gymName;

    @Column(name = "barcode_value", columnDefinition = "TEXT", nullable = false)
    private String barcodeValue;

    @Column(name = "color_theme")
    private String colorTheme;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public GymCard() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public String getGymName() { return gymName; }
    public void setGymName(String gymName) { this.gymName = gymName; }
    
    public String getBarcodeValue() { return barcodeValue; }
    public void setBarcodeValue(String barcodeValue) { this.barcodeValue = barcodeValue; }
    
    public String getColorTheme() { return colorTheme; }
    public void setColorTheme(String colorTheme) { this.colorTheme = colorTheme; }

    @JsonIgnore
    public User getUser() { return user; }
    @JsonIgnore
    public void setUser(User user) { this.user = user; }
}
