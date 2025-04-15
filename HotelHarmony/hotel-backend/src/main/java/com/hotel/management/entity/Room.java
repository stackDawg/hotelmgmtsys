package com.hotel.management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_number", nullable = false, unique = true)
    private String roomNumber;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RoomType type;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerNight;

    private int capacity;

    private String floor;

    @Column(name = "is_available")
    private boolean isAvailable = true;

    @Column(name = "is_clean")
    private boolean isClean = true;

    @Column(name = "last_cleaned")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastCleaned;

    private String description;

    @Column(name = "amenities", columnDefinition = "TEXT")
    private String amenities;

    @OneToMany(mappedBy = "room")
    private List<Booking> bookings = new ArrayList<>();

    @OneToMany(mappedBy = "room")
    private List<MaintenanceRequest> maintenanceRequests = new ArrayList<>();

    public enum RoomType {
        STANDARD, 
        DELUXE, 
        SUITE, 
        EXECUTIVE
    }
}