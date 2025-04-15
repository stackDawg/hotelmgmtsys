package com.hotel.management.dto;

import com.hotel.management.entity.Booking;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class BookingResponse {
    
    private Long id;
    private RoomResponse room;
    private UserResponse guest;
    private Date bookingDate;
    private Date checkInDate;
    private Date checkOutDate;
    private int guests;
    private Booking.BookingStatus status;
    private Booking.PaymentStatus paymentStatus;
    private String paymentMethod;
    private BigDecimal totalPrice;
    private String specialRequests;
    private String notes;
    private String cancellationReason;
    
    public BookingResponse(Booking booking) {
        this.id = booking.getId();
        this.room = new RoomResponse(booking.getRoom());
        this.guest = new UserResponse(booking.getGuest());
        this.bookingDate = booking.getBookingDate();
        this.checkInDate = booking.getCheckInDate();
        this.checkOutDate = booking.getCheckOutDate();
        this.guests = booking.getGuests();
        this.status = booking.getStatus();
        this.paymentStatus = booking.getPaymentStatus();
        this.paymentMethod = booking.getPaymentMethod();
        this.totalPrice = booking.getTotalPrice();
        this.specialRequests = booking.getSpecialRequests();
        this.notes = booking.getNotes();
        this.cancellationReason = booking.getCancellationReason();
    }
}