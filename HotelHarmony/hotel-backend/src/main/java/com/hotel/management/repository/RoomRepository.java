package com.hotel.management.repository;

import com.hotel.management.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    
    Optional<Room> findByRoomNumber(String roomNumber);
    
    List<Room> findByType(Room.RoomType type);
    
    List<Room> findByCapacityGreaterThanEqual(int capacity);
    
    List<Room> findByIsAvailable(boolean isAvailable);
    
    List<Room> findByIsClean(boolean isClean);
    
    @Query("SELECT r FROM Room r WHERE r.isAvailable = true AND r.isClean = true")
    List<Room> findAvailableAndCleanRooms();
    
    @Query("SELECT r FROM Room r WHERE r.id NOT IN " +
           "(SELECT b.room.id FROM Booking b " +
           "WHERE b.status IN ('RESERVED', 'CHECKED_IN') " +
           "AND ((b.checkInDate <= :checkOutDate) AND (b.checkOutDate >= :checkInDate)))")
    List<Room> findAvailableRoomsBetweenDates(
            @Param("checkInDate") Date checkInDate,
            @Param("checkOutDate") Date checkOutDate);
            
    @Query("SELECT r FROM Room r WHERE r.type = :type AND r.capacity >= :guests AND r.id NOT IN " +
           "(SELECT b.room.id FROM Booking b " +
           "WHERE b.status IN ('RESERVED', 'CHECKED_IN') " +
           "AND ((b.checkInDate <= :checkOutDate) AND (b.checkOutDate >= :checkInDate)))")
    List<Room> findAvailableRoomsByTypeAndCapacityBetweenDates(
            @Param("type") Room.RoomType type,
            @Param("guests") int guests,
            @Param("checkInDate") Date checkInDate,
            @Param("checkOutDate") Date checkOutDate);
}