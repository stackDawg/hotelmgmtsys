package com.hotel.management.repository;

import com.hotel.management.entity.Booking;
import com.hotel.management.entity.MaintenanceRequest;
import com.hotel.management.entity.Room;
import com.hotel.management.entity.StaffUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    
    List<MaintenanceRequest> findByRoom(Room room);
    
    List<MaintenanceRequest> findByAssignedTo(StaffUser staff);
    
    List<MaintenanceRequest> findByBooking(Booking booking);
    
    List<MaintenanceRequest> findByStatus(MaintenanceRequest.Status status);
    
    List<MaintenanceRequest> findByPriority(MaintenanceRequest.Priority priority);
    
    List<MaintenanceRequest> findByIssueType(MaintenanceRequest.IssueType issueType);
    
    @Query("SELECT m FROM MaintenanceRequest m WHERE m.status <> 'COMPLETED' AND m.status <> 'CANCELLED'")
    List<MaintenanceRequest> findOpenRequests();
    
    @Query("SELECT m FROM MaintenanceRequest m WHERE m.assignedTo IS NULL AND m.status = 'OPEN'")
    List<MaintenanceRequest> findUnassignedRequests();
    
    @Query("SELECT m FROM MaintenanceRequest m WHERE m.status = 'IN_PROGRESS'")
    List<MaintenanceRequest> findInProgressRequests();
    
    @Query("SELECT m FROM MaintenanceRequest m WHERE m.createdDate BETWEEN :startDate AND :endDate")
    List<MaintenanceRequest> findRequestsByDateRange(
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate);
    
    @Query("SELECT m FROM MaintenanceRequest m WHERE m.priority IN ('HIGH', 'URGENT') AND m.status <> 'COMPLETED' AND m.status <> 'CANCELLED'")
    List<MaintenanceRequest> findHighPriorityRequests();
}