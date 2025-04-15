package com.hotel.management.repository;

import com.hotel.management.entity.Booking;
import com.hotel.management.entity.GuestUser;
import com.hotel.management.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByGuest(GuestUser guest);
    
    List<Booking> findByRoom(Room room);
    
    List<Booking> findByStatus(Booking.BookingStatus status);
    
    List<Booking> findByPaymentStatus(Booking.PaymentStatus paymentStatus);
    
    @Query("SELECT b FROM Booking b WHERE b.checkInDate = :date AND b.status = 'RESERVED'")
    List<Booking> findTodayCheckIns(@Param("date") Date date);
    
    @Query("SELECT b FROM Booking b WHERE b.checkOutDate = :date AND b.status = 'CHECKED_IN'")
    List<Booking> findTodayCheckOuts(@Param("date") Date date);
    
    @Query("SELECT b FROM Booking b WHERE b.guest = :guest AND " +
           "(b.status = 'RESERVED' OR b.status = 'CHECKED_IN')")
    List<Booking> findActiveBookingsByGuest(@Param("guest") GuestUser guest);
    
    @Query("SELECT b FROM Booking b WHERE (b.status = 'RESERVED' OR b.status = 'CHECKED_IN')")
    List<Booking> findActiveBookings();
    
    @Query("SELECT b FROM Booking b WHERE b.bookingDate BETWEEN :startDate AND :endDate")
    List<Booking> findBookingsByDateRange(
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate);
    
    @Query("SELECT b FROM Booking b WHERE b.guest.id = :guestId AND b.checkInDate <= :now AND b.checkOutDate >= :now AND b.status = 'CHECKED_IN'")
    List<Booking> findCurrentStaysByGuestId(@Param("guestId") Long guestId, @Param("now") Date now);
}