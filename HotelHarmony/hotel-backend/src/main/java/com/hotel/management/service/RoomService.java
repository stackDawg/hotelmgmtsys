package com.hotel.management.service;

import com.hotel.management.entity.Room;
import com.hotel.management.exception.ResourceNotFoundException;
import com.hotel.management.repository.RoomRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Room getRoomById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", id));
    }

    public Room getRoomByNumber(String roomNumber) {
        return roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "roomNumber", roomNumber));
    }

    @Transactional
    public Room createRoom(Room room) {
        // Check if room with same number already exists
        if (roomRepository.findByRoomNumber(room.getRoomNumber()).isPresent()) {
            throw new RuntimeException("Room with this number already exists");
        }
        return roomRepository.save(room);
    }

    @Transactional
    public Room updateRoom(Long id, Room roomDetails) {
        Room room = getRoomById(id);
        
        room.setRoomNumber(roomDetails.getRoomNumber());
        room.setType(roomDetails.getType());
        room.setPricePerNight(roomDetails.getPricePerNight());
        room.setCapacity(roomDetails.getCapacity());
        room.setFloor(roomDetails.getFloor());
        room.setAvailable(roomDetails.isAvailable());
        room.setClean(roomDetails.isClean());
        room.setDescription(roomDetails.getDescription());
        room.setAmenities(roomDetails.getAmenities());
        
        return roomRepository.save(room);
    }

    @Transactional
    public void deleteRoom(Long id) {
        Room room = getRoomById(id);
        roomRepository.delete(room);
    }

    public List<Room> getRoomsByType(Room.RoomType type) {
        return roomRepository.findByType(type);
    }

    public List<Room> getAvailableRooms() {
        return roomRepository.findByIsAvailable(true);
    }

    public List<Room> getAvailableRoomsBetweenDates(Date checkInDate, Date checkOutDate) {
        return roomRepository.findAvailableRoomsBetweenDates(checkInDate, checkOutDate);
    }

    public List<Room> searchAvailableRooms(Room.RoomType type, int guests, Date checkInDate, Date checkOutDate) {
        return roomRepository.findAvailableRoomsByTypeAndCapacityBetweenDates(
                type, guests, checkInDate, checkOutDate);
    }

    @Transactional
    public Room recordRoomCleaning(Long id) {
        Room room = getRoomById(id);
        room.setClean(true);
        room.setLastCleaned(new Date());
        return roomRepository.save(room);
    }

    @Transactional
    public Room updateRoomAvailability(Long id, boolean isAvailable) {
        Room room = getRoomById(id);
        room.setAvailable(isAvailable);
        return roomRepository.save(room);
    }
}