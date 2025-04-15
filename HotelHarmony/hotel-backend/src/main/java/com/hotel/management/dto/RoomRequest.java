package com.hotel.management.dto;

import com.hotel.management.entity.Room;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class RoomRequest {
    
    @NotBlank(message = "Room number is required")
    private String roomNumber;
    
    @NotNull(message = "Room type is required")
    private Room.RoomType type;
    
    @NotNull(message = "Price per night is required")
    @Positive(message = "Price per night must be positive")
    private BigDecimal pricePerNight;
    
    @NotNull(message = "Capacity is required")
    @Positive(message = "Capacity must be positive")
    private int capacity;
    
    @NotNull(message = "Floor is required")
    private int floor;
    
    private boolean available = true;
    
    private boolean clean = true;
    
    private String description;
    
    private List<String> amenities;
    
    // Convert DTO to Entity
    public Room toEntity() {
        Room room = new Room();
        room.setRoomNumber(this.roomNumber);
        room.setType(this.type);
        room.setPricePerNight(this.pricePerNight);
        room.setCapacity(this.capacity);
        room.setFloor(this.floor);
        room.setAvailable(this.available);
        room.setClean(this.clean);
        room.setDescription(this.description);
        room.setAmenities(this.amenities);
        return room;
    }
}