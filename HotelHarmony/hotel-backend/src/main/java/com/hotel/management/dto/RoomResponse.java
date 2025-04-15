package com.hotel.management.dto;

import com.hotel.management.entity.Room;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Data
public class RoomResponse {
    
    private Long id;
    private String roomNumber;
    private Room.RoomType type;
    private BigDecimal pricePerNight;
    private int capacity;
    private int floor;
    private boolean available;
    private boolean clean;
    private String description;
    private List<String> amenities;
    private Date lastCleaned;
    
    public RoomResponse(Room room) {
        this.id = room.getId();
        this.roomNumber = room.getRoomNumber();
        this.type = room.getType();
        this.pricePerNight = room.getPricePerNight();
        this.capacity = room.getCapacity();
        this.floor = room.getFloor();
        this.available = room.isAvailable();
        this.clean = room.isClean();
        this.description = room.getDescription();
        this.amenities = room.getAmenities();
        this.lastCleaned = room.getLastCleaned();
    }
}