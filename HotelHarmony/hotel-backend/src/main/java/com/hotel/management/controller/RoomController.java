package com.hotel.management.controller;

import com.hotel.management.dto.RoomRequest;
import com.hotel.management.dto.RoomResponse;
import com.hotel.management.entity.Room;
import com.hotel.management.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        List<Room> rooms = roomService.getAllRooms();
        List<RoomResponse> roomResponses = rooms.stream()
                .map(RoomResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(roomResponses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable Long id) {
        Room room = roomService.getRoomById(id);
        return ResponseEntity.ok(new RoomResponse(room));
    }

    @GetMapping("/number/{roomNumber}")
    public ResponseEntity<RoomResponse> getRoomByNumber(@PathVariable String roomNumber) {
        Room room = roomService.getRoomByNumber(roomNumber);
        return ResponseEntity.ok(new RoomResponse(room));
    }

    @GetMapping("/available")
    public ResponseEntity<List<RoomResponse>> getAvailableRooms(
            @RequestParam(required = false) Room.RoomType type,
            @RequestParam(required = false, defaultValue = "1") int guests,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date checkInDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date checkOutDate) {
        
        List<Room> availableRooms;
        
        if (checkInDate != null && checkOutDate != null) {
            if (type != null) {
                availableRooms = roomService.searchAvailableRooms(type, guests, checkInDate, checkOutDate);
            } else {
                availableRooms = roomService.getAvailableRoomsBetweenDates(checkInDate, checkOutDate);
            }
        } else {
            availableRooms = roomService.getAvailableRooms();
        }
        
        List<RoomResponse> roomResponses = availableRooms.stream()
                .map(RoomResponse::new)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(roomResponses);
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody RoomRequest roomRequest) {
        Room room = roomRequest.toEntity();
        Room createdRoom = roomService.createRoom(room);
        return new ResponseEntity<>(new RoomResponse(createdRoom), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<RoomResponse> updateRoom(@PathVariable Long id, @Valid @RequestBody RoomRequest roomRequest) {
        Room room = roomRequest.toEntity();
        Room updatedRoom = roomService.updateRoom(id, room);
        return ResponseEntity.ok(new RoomResponse(updatedRoom));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/clean")
    @PreAuthorize("hasAnyRole('MAINTENANCE', 'MANAGER')")
    public ResponseEntity<RoomResponse> recordRoomCleaning(@PathVariable Long id) {
        Room room = roomService.recordRoomCleaning(id);
        return ResponseEntity.ok(new RoomResponse(room));
    }

    @PutMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'MANAGER')")
    public ResponseEntity<RoomResponse> updateRoomAvailability(
            @PathVariable Long id, 
            @RequestParam boolean available) {
        Room room = roomService.updateRoomAvailability(id, available);
        return ResponseEntity.ok(new RoomResponse(room));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<RoomResponse>> getRoomsByType(@PathVariable Room.RoomType type) {
        List<Room> rooms = roomService.getRoomsByType(type);
        List<RoomResponse> roomResponses = rooms.stream()
                .map(RoomResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(roomResponses);
    }
}