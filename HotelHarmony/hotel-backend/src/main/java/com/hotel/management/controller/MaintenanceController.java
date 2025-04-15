package com.hotel.management.controller;

import com.hotel.management.dto.MaintenanceRequestRequest;
import com.hotel.management.dto.MaintenanceRequestResponse;
import com.hotel.management.entity.Booking;
import com.hotel.management.entity.MaintenanceRequest;
import com.hotel.management.entity.Room;
import com.hotel.management.entity.User;
import com.hotel.management.service.BookingService;
import com.hotel.management.service.MaintenanceService;
import com.hotel.management.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;
    private final RoomService roomService;
    private final BookingService bookingService;

    public MaintenanceController(MaintenanceService maintenanceService, 
                               RoomService roomService,
                               BookingService bookingService) {
        this.maintenanceService = maintenanceService;
        this.roomService = roomService;
        this.bookingService = bookingService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MAINTENANCE', 'MANAGER')")
    public ResponseEntity<List<MaintenanceRequestResponse>> getAllMaintenanceRequests() {
        List<MaintenanceRequest> requests = maintenanceService.getAllMaintenanceRequests();
        List<MaintenanceRequestResponse> responses = requests.stream()
                .map(MaintenanceRequestResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MAINTENANCE', 'MANAGER')")
    public ResponseEntity<MaintenanceRequestResponse> getMaintenanceRequestById(@PathVariable Long id) {
        MaintenanceRequest request = maintenanceService.getMaintenanceRequestById(id);
        return ResponseEntity.ok(new MaintenanceRequestResponse(request));
    }

    @PostMapping
    public ResponseEntity<MaintenanceRequestResponse> createMaintenanceRequest(
            @Valid @RequestBody MaintenanceRequestRequest requestDto,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        
        MaintenanceRequest request = new MaintenanceRequest();
        request.setIssueType(requestDto.getIssueType());
        request.setDescription(requestDto.getDescription());
        request.setPriority(requestDto.getPriority());
        request.setReportedBy(user);
        
        // Set room and booking if provided
        if (requestDto.getRoomId() != null) {
            Room room = roomService.getRoomById(requestDto.getRoomId());
            request.setRoom(room);
        }
        
        if (requestDto.getBookingId() != null) {
            Booking booking = bookingService.getBookingById(requestDto.getBookingId());
            request.setBooking(booking);
        }
        
        MaintenanceRequest createdRequest = maintenanceService.createMaintenanceRequest(request);
        return new ResponseEntity<>(new MaintenanceRequestResponse(createdRequest), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MAINTENANCE', 'MANAGER')")
    public ResponseEntity<MaintenanceRequestResponse> updateMaintenanceRequestStatus(
            @PathVariable Long id,
            @RequestParam MaintenanceRequest.Status status,
            @RequestParam(required = false) String notes) {
        
        MaintenanceRequest updatedRequest = maintenanceService.updateMaintenanceRequestStatus(id, status, notes);
        return ResponseEntity.ok(new MaintenanceRequestResponse(updatedRequest));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<MaintenanceRequestResponse> assignMaintenanceRequest(
            @PathVariable Long id,
            @RequestParam Long staffId) {
        
        MaintenanceRequest updatedRequest = maintenanceService.assignMaintenanceRequest(id, staffId);
        return ResponseEntity.ok(new MaintenanceRequestResponse(updatedRequest));
    }

    @PutMapping("/{id}/priority")
    @PreAuthorize("hasAnyRole('MAINTENANCE', 'MANAGER')")
    public ResponseEntity<MaintenanceRequestResponse> updateMaintenanceRequestPriority(
            @PathVariable Long id,
            @RequestParam MaintenanceRequest.Priority priority) {
        
        MaintenanceRequest updatedRequest = maintenanceService.updateMaintenanceRequestPriority(id, priority);
        return ResponseEntity.ok(new MaintenanceRequestResponse(updatedRequest));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> deleteMaintenanceRequest(@PathVariable Long id) {
        maintenanceService.deleteMaintenanceRequest(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/room/{roomId}")
    @PreAuthorize("hasAnyRole('MAINTENANCE', 'MANAGER')")
    public ResponseEntity<List<MaintenanceRequestResponse>> getMaintenanceRequestsByRoom(@PathVariable Long roomId) {
        List<MaintenanceRequest> requests = maintenanceService.getMaintenanceRequestsByRoom(roomId);
        List<MaintenanceRequestResponse> responses = requests.stream()
                .map(MaintenanceRequestResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/staff/{staffId}")
    @PreAuthorize("hasAnyRole('MAINTENANCE', 'MANAGER')")
    public ResponseEntity<List<MaintenanceRequestResponse>> getMaintenanceRequestsByStaff(@PathVariable Long staffId) {
        List<MaintenanceRequest> requests = maintenanceService.getMaintenanceRequestsByStaff(staffId);
        List<MaintenanceRequestResponse> responses = requests.stream()
                .map(MaintenanceRequestResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/open")
    @PreAuthorize("hasAnyRole('MAINTENANCE', 'MANAGER')")
    public ResponseEntity<List<MaintenanceRequestResponse>> getOpenMaintenanceRequests() {
        List<MaintenanceRequest> requests = maintenanceService.getOpenMaintenanceRequests();
        List<MaintenanceRequestResponse> responses = requests.stream()
                .map(MaintenanceRequestResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/unassigned")
    @PreAuthorize("hasAnyRole('MAINTENANCE', 'MANAGER')")
    public ResponseEntity<List<MaintenanceRequestResponse>> getUnassignedMaintenanceRequests() {
        List<MaintenanceRequest> requests = maintenanceService.getUnassignedMaintenanceRequests();
        List<MaintenanceRequestResponse> responses = requests.stream()
                .map(MaintenanceRequestResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/in-progress")
    @PreAuthorize("hasAnyRole('MAINTENANCE', 'MANAGER')")
    public ResponseEntity<List<MaintenanceRequestResponse>> getInProgressMaintenanceRequests() {
        List<MaintenanceRequest> requests = maintenanceService.getInProgressMaintenanceRequests();
        List<MaintenanceRequestResponse> responses = requests.stream()
                .map(MaintenanceRequestResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/high-priority")
    @PreAuthorize("hasAnyRole('MAINTENANCE', 'MANAGER')")
    public ResponseEntity<List<MaintenanceRequestResponse>> getHighPriorityMaintenanceRequests() {
        List<MaintenanceRequest> requests = maintenanceService.getHighPriorityMaintenanceRequests();
        List<MaintenanceRequestResponse> responses = requests.stream()
                .map(MaintenanceRequestResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('MAINTENANCE', 'MANAGER')")
    public ResponseEntity<MaintenanceRequestResponse> startMaintenanceWork(@PathVariable Long id) {
        MaintenanceRequest updatedRequest = maintenanceService.startMaintenanceWork(id);
        return ResponseEntity.ok(new MaintenanceRequestResponse(updatedRequest));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('MAINTENANCE', 'MANAGER')")
    public ResponseEntity<MaintenanceRequestResponse> completeMaintenanceWork(
            @PathVariable Long id,
            @RequestParam(required = false) String resolutionNotes) {
        
        MaintenanceRequest updatedRequest = maintenanceService.completeMaintenanceWork(id, resolutionNotes);
        return ResponseEntity.ok(new MaintenanceRequestResponse(updatedRequest));
    }

    @GetMapping("/my-tasks")
    @PreAuthorize("hasRole('MAINTENANCE')")
    public ResponseEntity<List<MaintenanceRequestResponse>> getMyMaintenanceTasks(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<MaintenanceRequest> requests = maintenanceService.getMaintenanceRequestsByStaff(user.getId());
        List<MaintenanceRequestResponse> responses = requests.stream()
                .map(MaintenanceRequestResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
}