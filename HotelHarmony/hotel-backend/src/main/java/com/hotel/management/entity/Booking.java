package com.hotel.management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "guest_id", nullable = false)
    private GuestUser guest;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "check_in_date", nullable = false)
    @Temporal(TemporalType.DATE)
    private Date checkInDate;

    @Column(name = "check_out_date", nullable = false)
    @Temporal(TemporalType.DATE)
    private Date checkOutDate;

    @Column(name = "booking_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date bookingDate = new Date();

    @Column(nullable = false)
    private int guests;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.RESERVED;

    @Column(name = "payment_status")
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;

    private String notes;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "is_reviewed")
    private boolean isReviewed = false;

    public enum BookingStatus {
        RESERVED,
        CHECKED_IN,
        CHECKED_OUT,
        CANCELLED,
        NO_SHOW
    }

    public enum PaymentStatus {
        PENDING,
        PARTIALLY_PAID,
        PAID,
        REFUNDED
    }
}