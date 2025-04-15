package com.hotel.management.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.Date;

@Data
public class BookingRequest {
    
    @NotNull(message = "Room ID is required")
    private Long roomId;
    
    private Long guestId;  // Optional for staff creating booking for guest
    
    @NotNull(message = "Check-in date is required")
    @Future(message = "Check-in date must be in the future")
    private Date checkInDate;
    
    @NotNull(message = "Check-out date is required")
    @Future(message = "Check-out date must be in the future")
    private Date checkOutDate;
    
    @NotNull(message = "Number of guests is required")
    @Positive(message = "Number of guests must be positive")
    private int guests;
    
    private String specialRequests;
}