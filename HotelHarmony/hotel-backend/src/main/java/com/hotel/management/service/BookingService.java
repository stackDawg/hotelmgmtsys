package com.hotel.management.service;

import com.hotel.management.entity.Booking;
import com.hotel.management.entity.GuestUser;
import com.hotel.management.entity.Room;
import com.hotel.management.exception.ResourceNotFoundException;
import com.hotel.management.repository.BookingRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomService roomService;
    private final UserService userService;

    public BookingService(BookingRepository bookingRepository, RoomService roomService, UserService userService) {
        this.bookingRepository = bookingRepository;
        this.roomService = roomService;
        this.userService = userService;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
    }

    @Transactional
    public Booking createBooking(Booking booking) {
        Room room = roomService.getRoomById(booking.getRoom().getId());
        
        // Verify room is available for the dates
        List<Room> availableRooms = roomService.getAvailableRoomsBetweenDates(booking.getCheckInDate(), booking.getCheckOutDate());
        if (!availableRooms.contains(room)) {
            throw new RuntimeException("Room is not available for the selected dates");
        }
        
        // Calculate nights and total price
        long nights = calculateNights(booking.getCheckInDate(), booking.getCheckOutDate());
        BigDecimal totalPrice = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));
        booking.setTotalPrice(totalPrice);
        
        // Set initial status
        booking.setStatus(Booking.BookingStatus.RESERVED);
        booking.setPaymentStatus(Booking.PaymentStatus.PENDING);
        
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking updateBooking(Long id, Booking bookingDetails) {
        Booking booking = getBookingById(id);
        
        // Update basic details
        booking.setCheckInDate(bookingDetails.getCheckInDate());
        booking.setCheckOutDate(bookingDetails.getCheckOutDate());
        booking.setGuests(bookingDetails.getGuests());
        booking.setSpecialRequests(bookingDetails.getSpecialRequests());
        booking.setNotes(bookingDetails.getNotes());
        
        // Recalculate total price if dates changed
        if (bookingDetails.getCheckInDate() != null && bookingDetails.getCheckOutDate() != null) {
            long nights = calculateNights(bookingDetails.getCheckInDate(), bookingDetails.getCheckOutDate());
            BigDecimal totalPrice = booking.getRoom().getPricePerNight().multiply(BigDecimal.valueOf(nights));
            booking.setTotalPrice(totalPrice);
        }
        
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking updateBookingStatus(Long id, Booking.BookingStatus status) {
        Booking booking = getBookingById(id);
        booking.setStatus(status);
        
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking updatePaymentStatus(Long id, Booking.PaymentStatus paymentStatus, String paymentMethod) {
        Booking booking = getBookingById(id);
        booking.setPaymentStatus(paymentStatus);
        booking.setPaymentMethod(paymentMethod);
        
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking cancelBooking(Long id, String reason) {
        Booking booking = getBookingById(id);
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking checkIn(Long id) {
        Booking booking = getBookingById(id);
        
        // Verify booking status
        if (booking.getStatus() != Booking.BookingStatus.RESERVED) {
            throw new RuntimeException("Only reservations can be checked in");
        }
        
        booking.setStatus(Booking.BookingStatus.CHECKED_IN);
        
        // Update room status if needed
        Room room = booking.getRoom();
        if (room.isAvailable()) {
            room.setAvailable(false);
            roomService.updateRoom(room.getId(), room);
        }
        
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking checkOut(Long id) {
        Booking booking = getBookingById(id);
        
        // Verify booking status
        if (booking.getStatus() != Booking.BookingStatus.CHECKED_IN) {
            throw new RuntimeException("Only checked-in bookings can be checked out");
        }
        
        booking.setStatus(Booking.BookingStatus.CHECKED_OUT);
        
        // Update room status
        Room room = booking.getRoom();
        room.setAvailable(true);
        room.setClean(false);  // Room needs cleaning after checkout
        roomService.updateRoom(room.getId(), room);
        
        return bookingRepository.save(booking);
    }

    public List<Booking> getBookingsByGuest(Long guestId) {
        GuestUser guest = (GuestUser) userService.getUserById(guestId);
        return bookingRepository.findByGuest(guest);
    }

    public List<Booking> getBookingsByRoom(Long roomId) {
        Room room = roomService.getRoomById(roomId);
        return bookingRepository.findByRoom(room);
    }

    public List<Booking> getActiveBookings() {
        return bookingRepository.findActiveBookings();
    }

    public List<Booking> getBookingsByStatus(Booking.BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }

    public List<Booking> getTodayCheckIns() {
        Date today = new Date();
        return bookingRepository.findTodayCheckIns(today);
    }

    public List<Booking> getTodayCheckOuts() {
        Date today = new Date();
        return bookingRepository.findTodayCheckOuts(today);
    }

    private long calculateNights(Date checkInDate, Date checkOutDate) {
        LocalDate checkIn = checkInDate.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
        
        LocalDate checkOut = checkOutDate.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
        
        return ChronoUnit.DAYS.between(checkIn, checkOut);
    }
}