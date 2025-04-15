package com.hotel.management.controller;

import com.hotel.management.dto.BookingRequest;
import com.hotel.management.dto.BookingResponse;
import com.hotel.management.entity.Booking;
import com.hotel.management.entity.GuestUser;
import com.hotel.management.entity.Room;
import com.hotel.management.entity.User;
import com.hotel.management.service.BookingService;
import com.hotel.management.service.RoomService;
import com.hotel.management.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;
    private final RoomService roomService;

    public BookingController(BookingService bookingService, UserService userService, RoomService roomService) {
        this.bookingService = bookingService;
        this.userService = userService;
        this.roomService = roomService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'MANAGER')")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        List<BookingResponse> bookingResponses = bookings.stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(bookingResponses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id,
            Authentication authentication) {
        
        Booking booking = bookingService.getBookingById(id);
        
        // Check if the user has permission to view this booking
        if (!hasPermissionToAccessBooking(booking, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(new BookingResponse(booking));
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest bookingRequest,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        
        // Create booking from request
        Booking booking = new Booking();
        Room room = roomService.getRoomById(bookingRequest.getRoomId());
        booking.setRoom(room);
        booking.setCheckInDate(bookingRequest.getCheckInDate());
        booking.setCheckOutDate(bookingRequest.getCheckOutDate());
        booking.setGuests(bookingRequest.getGuests());
        booking.setSpecialRequests(bookingRequest.getSpecialRequests());
        
        // If user is a guest, set as the booking guest
        if (user.getRole() == User.Role.GUEST) {
            GuestUser guestUser = (GuestUser) user;
            booking.setGuest(guestUser);
        } else if (bookingRequest.getGuestId() != null) {
            // If staff is creating booking for a guest
            GuestUser guestUser = (GuestUser) userService.getUserById(bookingRequest.getGuestId());
            booking.setGuest(guestUser);
        } else {
            return ResponseEntity.badRequest().build();
        }
        
        Booking createdBooking = bookingService.createBooking(booking);
        return new ResponseEntity<>(new BookingResponse(createdBooking), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingRequest bookingRequest,
            Authentication authentication) {
        
        Booking booking = bookingService.getBookingById(id);
        
        // Check if the user has permission to update this booking
        if (!hasPermissionToAccessBooking(booking, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Update booking details
        booking.setCheckInDate(bookingRequest.getCheckInDate());
        booking.setCheckOutDate(bookingRequest.getCheckOutDate());
        booking.setGuests(bookingRequest.getGuests());
        booking.setSpecialRequests(bookingRequest.getSpecialRequests());
        
        Booking updatedBooking = bookingService.updateBooking(id, booking);
        return ResponseEntity.ok(new BookingResponse(updatedBooking));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'MANAGER')")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam Booking.BookingStatus status) {
        
        Booking updatedBooking = bookingService.updateBookingStatus(id, status);
        return ResponseEntity.ok(new BookingResponse(updatedBooking));
    }

    @PutMapping("/{id}/payment")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'MANAGER')")
    public ResponseEntity<BookingResponse> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam Booking.PaymentStatus paymentStatus,
            @RequestParam String paymentMethod) {
        
        Booking updatedBooking = bookingService.updatePaymentStatus(id, paymentStatus, paymentMethod);
        return ResponseEntity.ok(new BookingResponse(updatedBooking));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            Authentication authentication) {
        
        Booking booking = bookingService.getBookingById(id);
        
        // Check if the user has permission to cancel this booking
        if (!hasPermissionToAccessBooking(booking, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Booking cancelledBooking = bookingService.cancelBooking(id, reason);
        return ResponseEntity.ok(new BookingResponse(cancelledBooking));
    }

    @PostMapping("/{id}/check-in")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'MANAGER')")
    public ResponseEntity<BookingResponse> checkIn(@PathVariable Long id) {
        Booking updatedBooking = bookingService.checkIn(id);
        return ResponseEntity.ok(new BookingResponse(updatedBooking));
    }

    @PostMapping("/{id}/check-out")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'MANAGER')")
    public ResponseEntity<BookingResponse> checkOut(@PathVariable Long id) {
        Booking updatedBooking = bookingService.checkOut(id);
        return ResponseEntity.ok(new BookingResponse(updatedBooking));
    }

    @GetMapping("/guest/{guestId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByGuest(
            @PathVariable Long guestId,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        
        // If guest is accessing, ensure they're only seeing their own bookings
        if (user.getRole() == User.Role.GUEST && !user.getId().equals(guestId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        List<Booking> bookings = bookingService.getBookingsByGuest(guestId);
        List<BookingResponse> bookingResponses = bookings.stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(bookingResponses);
    }

    @GetMapping("/room/{roomId}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'MAINTENANCE', 'MANAGER')")
    public ResponseEntity<List<BookingResponse>> getBookingsByRoom(@PathVariable Long roomId) {
        List<Booking> bookings = bookingService.getBookingsByRoom(roomId);
        List<BookingResponse> bookingResponses = bookings.stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(bookingResponses);
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'MANAGER')")
    public ResponseEntity<List<BookingResponse>> getActiveBookings() {
        List<Booking> bookings = bookingService.getActiveBookings();
        List<BookingResponse> bookingResponses = bookings.stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(bookingResponses);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'MANAGER')")
    public ResponseEntity<List<BookingResponse>> getBookingsByStatus(@PathVariable Booking.BookingStatus status) {
        List<Booking> bookings = bookingService.getBookingsByStatus(status);
        List<BookingResponse> bookingResponses = bookings.stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(bookingResponses);
    }

    @GetMapping("/today-check-ins")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'MANAGER')")
    public ResponseEntity<List<BookingResponse>> getTodayCheckIns() {
        List<Booking> bookings = bookingService.getTodayCheckIns();
        List<BookingResponse> bookingResponses = bookings.stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(bookingResponses);
    }

    @GetMapping("/today-check-outs")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'MANAGER')")
    public ResponseEntity<List<BookingResponse>> getTodayCheckOuts() {
        List<Booking> bookings = bookingService.getTodayCheckOuts();
        List<BookingResponse> bookingResponses = bookings.stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(bookingResponses);
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponse>> getMyBookings(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        if (user.getRole() != User.Role.GUEST) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        List<Booking> bookings = bookingService.getBookingsByGuest(user.getId());
        List<BookingResponse> bookingResponses = bookings.stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(bookingResponses);
    }

    // Helper method to check if a user has permission to access/modify a booking
    private boolean hasPermissionToAccessBooking(Booking booking, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        // Managers and receptionists have full access
        if (user.getRole() == User.Role.MANAGER || user.getRole() == User.Role.RECEPTIONIST) {
            return true;
        }
        
        // If user is a guest, they should only access their own bookings
        if (user.getRole() == User.Role.GUEST) {
            return booking.getGuest().getId().equals(user.getId());
        }
        
        return false;
    }
}