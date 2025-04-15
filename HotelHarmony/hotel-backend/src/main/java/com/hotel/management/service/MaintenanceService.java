package com.hotel.management.service;

import com.hotel.management.entity.Booking;
import com.hotel.management.entity.MaintenanceRequest;
import com.hotel.management.entity.Room;
import com.hotel.management.entity.StaffUser;
import com.hotel.management.exception.ResourceNotFoundException;
import com.hotel.management.repository.MaintenanceRequestRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class MaintenanceService {

    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final RoomService roomService;
    private final UserService userService;
    private final BookingService bookingService;

    public MaintenanceService(MaintenanceRequestRepository maintenanceRequestRepository,
                             RoomService roomService,
                             UserService userService,
                             BookingService bookingService) {
        this.maintenanceRequestRepository = maintenanceRequestRepository;
        this.roomService = roomService;
        this.userService = userService;
        this.bookingService = bookingService;
    }

    public List<MaintenanceRequest> getAllMaintenanceRequests() {
        return maintenanceRequestRepository.findAll();
    }

    public MaintenanceRequest getMaintenanceRequestById(Long id) {
        return maintenanceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request", "id", id));
    }

    @Transactional
    public MaintenanceRequest createMaintenanceRequest(MaintenanceRequest request) {
        request.setStatus(MaintenanceRequest.Status.OPEN);
        request.setCreatedDate(new Date());
        
        // If room is set but no booking, try to identify booking
        if (request.getRoom() != null && request.getBooking() == null) {
            Room room = roomService.getRoomById(request.getRoom().getId());
            
            if (!room.isAvailable()) {
                // Room is occupied, try to find the current booking
                List<Booking> bookings = bookingService.getBookingsByRoom(room.getId());
                Date now = new Date();
                
                bookings.stream()
                        .filter(b -> b.getStatus() == Booking.BookingStatus.CHECKED_IN)
                        .filter(b -> now.after(b.getCheckInDate()) && now.before(b.getCheckOutDate()))
                        .findFirst()
                        .ifPresent(request::setBooking);
            }
        }
        
        return maintenanceRequestRepository.save(request);
    }

    @Transactional
    public MaintenanceRequest updateMaintenanceRequestStatus(Long id, MaintenanceRequest.Status status, String notes) {
        MaintenanceRequest request = getMaintenanceRequestById(id);
        request.setStatus(status);
        
        if (notes != null && !notes.isBlank()) {
            request.addNote(notes);
        }
        
        // If completed, update completion date
        if (status == MaintenanceRequest.Status.COMPLETED) {
            request.setCompletedDate(new Date());
        }
        
        return maintenanceRequestRepository.save(request);
    }

    @Transactional
    public MaintenanceRequest assignMaintenanceRequest(Long id, Long staffId) {
        MaintenanceRequest request = getMaintenanceRequestById(id);
        StaffUser staff = (StaffUser) userService.getUserById(staffId);
        
        // Verify staff is maintenance personnel
        if (staff.getRole() != staff.getRole().MAINTENANCE && staff.getRole() != staff.getRole().MANAGER) {
            throw new RuntimeException("Staff member must be maintenance personnel or manager");
        }
        
        request.setAssignedTo(staff);
        
        // If status is OPEN, update to ASSIGNED
        if (request.getStatus() == MaintenanceRequest.Status.OPEN) {
            request.setStatus(MaintenanceRequest.Status.ASSIGNED);
        }
        
        return maintenanceRequestRepository.save(request);
    }

    @Transactional
    public MaintenanceRequest updateMaintenanceRequestPriority(Long id, MaintenanceRequest.Priority priority) {
        MaintenanceRequest request = getMaintenanceRequestById(id);
        request.setPriority(priority);
        
        return maintenanceRequestRepository.save(request);
    }

    @Transactional
    public void deleteMaintenanceRequest(Long id) {
        MaintenanceRequest request = getMaintenanceRequestById(id);
        maintenanceRequestRepository.delete(request);
    }

    public List<MaintenanceRequest> getMaintenanceRequestsByRoom(Long roomId) {
        Room room = roomService.getRoomById(roomId);
        return maintenanceRequestRepository.findByRoom(room);
    }

    public List<MaintenanceRequest> getMaintenanceRequestsByStaff(Long staffId) {
        StaffUser staff = (StaffUser) userService.getUserById(staffId);
        return maintenanceRequestRepository.findByAssignedTo(staff);
    }

    public List<MaintenanceRequest> getOpenMaintenanceRequests() {
        return maintenanceRequestRepository.findOpenRequests();
    }

    public List<MaintenanceRequest> getUnassignedMaintenanceRequests() {
        return maintenanceRequestRepository.findUnassignedRequests();
    }

    public List<MaintenanceRequest> getInProgressMaintenanceRequests() {
        return maintenanceRequestRepository.findInProgressRequests();
    }

    public List<MaintenanceRequest> getHighPriorityMaintenanceRequests() {
        return maintenanceRequestRepository.findHighPriorityRequests();
    }

    @Transactional
    public MaintenanceRequest startMaintenanceWork(Long id) {
        MaintenanceRequest request = getMaintenanceRequestById(id);
        
        // Verify request is assigned
        if (request.getStatus() != MaintenanceRequest.Status.ASSIGNED) {
            throw new RuntimeException("Maintenance request must be assigned before work can start");
        }
        
        request.setStatus(MaintenanceRequest.Status.IN_PROGRESS);
        request.setStartDate(new Date());
        
        return maintenanceRequestRepository.save(request);
    }

    @Transactional
    public MaintenanceRequest completeMaintenanceWork(Long id, String resolutionNotes) {
        MaintenanceRequest request = getMaintenanceRequestById(id);
        
        // Verify request is in progress
        if (request.getStatus() != MaintenanceRequest.Status.IN_PROGRESS) {
            throw new RuntimeException("Maintenance request must be in progress before it can be completed");
        }
        
        request.setStatus(MaintenanceRequest.Status.COMPLETED);
        request.setCompletedDate(new Date());
        
        if (resolutionNotes != null && !resolutionNotes.isBlank()) {
            request.setResolution(resolutionNotes);
        }
        
        return maintenanceRequestRepository.save(request);
    }
}