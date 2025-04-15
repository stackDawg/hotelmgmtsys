package com.hotel.management.service;

import com.hotel.management.entity.Booking;
import com.hotel.management.entity.MaintenanceRequest;
import com.hotel.management.entity.Room;
import com.hotel.management.repository.BookingRepository;
import com.hotel.management.repository.MaintenanceRequestRepository;
import com.hotel.management.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;

    public ReportService(BookingRepository bookingRepository, 
                        RoomRepository roomRepository, 
                        MaintenanceRequestRepository maintenanceRequestRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.maintenanceRequestRepository = maintenanceRequestRepository;
    }

    /**
     * Generate occupancy report for a given date range
     */
    public Map<String, Object> generateOccupancyReport(Date startDate, Date endDate) {
        Map<String, Object> report = new HashMap<>();
        
        // Get all rooms and bookings for the date range
        List<Room> allRooms = roomRepository.findAll();
        List<Booking> bookingsInRange = bookingRepository.findBookingsByDateRange(startDate, endDate);
        
        // Calculate total days in range
        long totalDays = ChronoUnit.DAYS.between(
                startDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate(),
                endDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
        
        // Calculate total room-days available
        long totalRoomDays = allRooms.size() * totalDays;
        
        // Calculate total booked days
        long totalBookedDays = bookingsInRange.stream()
                .mapToLong(booking -> calculateOverlapDays(booking, startDate, endDate))
                .sum();
        
        // Calculate occupancy rate
        double occupancyRate = (double) totalBookedDays / totalRoomDays * 100;
        
        // Occupancy by room type
        Map<Room.RoomType, Double> occupancyByRoomType = new HashMap<>();
        for (Room.RoomType type : Room.RoomType.values()) {
            List<Room> roomsByType = allRooms.stream()
                    .filter(room -> room.getType() == type)
                    .collect(Collectors.toList());
            
            if (!roomsByType.isEmpty()) {
                long typeTotalDays = roomsByType.size() * totalDays;
                
                long typeBookedDays = bookingsInRange.stream()
                        .filter(booking -> booking.getRoom().getType() == type)
                        .mapToLong(booking -> calculateOverlapDays(booking, startDate, endDate))
                        .sum();
                
                double typeOccupancyRate = (double) typeBookedDays / typeTotalDays * 100;
                occupancyByRoomType.put(type, typeOccupancyRate);
            }
        }
        
        report.put("startDate", startDate);
        report.put("endDate", endDate);
        report.put("totalRooms", allRooms.size());
        report.put("totalDays", totalDays);
        report.put("totalRoomDays", totalRoomDays);
        report.put("totalBookedDays", totalBookedDays);
        report.put("occupancyRate", occupancyRate);
        report.put("occupancyByRoomType", occupancyByRoomType);
        
        return report;
    }

    /**
     * Generate revenue report for a given date range
     */
    public Map<String, Object> generateRevenueReport(Date startDate, Date endDate) {
        Map<String, Object> report = new HashMap<>();
        
        // Get bookings for the date range
        List<Booking> bookingsInRange = bookingRepository.findBookingsByDateRange(startDate, endDate);
        
        // Calculate total revenue
        BigDecimal totalRevenue = bookingsInRange.stream()
                .filter(booking -> booking.getPaymentStatus() == Booking.PaymentStatus.PAID)
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Revenue by room type
        Map<Room.RoomType, BigDecimal> revenueByRoomType = new HashMap<>();
        for (Room.RoomType type : Room.RoomType.values()) {
            BigDecimal typeRevenue = bookingsInRange.stream()
                    .filter(booking -> booking.getRoom().getType() == type)
                    .filter(booking -> booking.getPaymentStatus() == Booking.PaymentStatus.PAID)
                    .map(Booking::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            revenueByRoomType.put(type, typeRevenue);
        }
        
        // Revenue by payment method
        Map<String, BigDecimal> revenueByPaymentMethod = new HashMap<>();
        bookingsInRange.stream()
                .filter(booking -> booking.getPaymentStatus() == Booking.PaymentStatus.PAID)
                .filter(booking -> booking.getPaymentMethod() != null)
                .forEach(booking -> {
                    String method = booking.getPaymentMethod();
                    BigDecimal current = revenueByPaymentMethod.getOrDefault(method, BigDecimal.ZERO);
                    revenueByPaymentMethod.put(method, current.add(booking.getTotalPrice()));
                });
        
        // Calculate average revenue per booking
        BigDecimal avgRevenuePerBooking = BigDecimal.ZERO;
        if (!bookingsInRange.isEmpty()) {
            avgRevenuePerBooking = totalRevenue.divide(
                    BigDecimal.valueOf(bookingsInRange.size()), 
                    BigDecimal.ROUND_HALF_UP);
        }
        
        report.put("startDate", startDate);
        report.put("endDate", endDate);
        report.put("totalBookings", bookingsInRange.size());
        report.put("totalRevenue", totalRevenue);
        report.put("averageRevenuePerBooking", avgRevenuePerBooking);
        report.put("revenueByRoomType", revenueByRoomType);
        report.put("revenueByPaymentMethod", revenueByPaymentMethod);
        
        return report;
    }

    /**
     * Generate maintenance report for a given date range
     */
    public Map<String, Object> generateMaintenanceReport(Date startDate, Date endDate) {
        Map<String, Object> report = new HashMap<>();
        
        // Get maintenance requests for the date range
        List<MaintenanceRequest> requestsInRange = 
                maintenanceRequestRepository.findRequestsByDateRange(startDate, endDate);
        
        // Count by status
        Map<MaintenanceRequest.Status, Long> countByStatus = requestsInRange.stream()
                .collect(Collectors.groupingBy(MaintenanceRequest::getStatus, Collectors.counting()));
        
        // Count by issue type
        Map<MaintenanceRequest.IssueType, Long> countByIssueType = requestsInRange.stream()
                .collect(Collectors.groupingBy(MaintenanceRequest::getIssueType, Collectors.counting()));
        
        // Count by priority
        Map<MaintenanceRequest.Priority, Long> countByPriority = requestsInRange.stream()
                .collect(Collectors.groupingBy(MaintenanceRequest::getPriority, Collectors.counting()));
        
        // Calculate average resolution time for completed requests
        double avgResolutionTime = requestsInRange.stream()
                .filter(req -> req.getStatus() == MaintenanceRequest.Status.COMPLETED)
                .filter(req -> req.getCompletedDate() != null && req.getCreatedDate() != null)
                .mapToLong(req -> ChronoUnit.HOURS.between(
                        req.getCreatedDate().toInstant(),
                        req.getCompletedDate().toInstant()))
                .average()
                .orElse(0);
        
        report.put("startDate", startDate);
        report.put("endDate", endDate);
        report.put("totalRequests", requestsInRange.size());
        report.put("countByStatus", countByStatus);
        report.put("countByIssueType", countByIssueType);
        report.put("countByPriority", countByPriority);
        report.put("averageResolutionTimeHours", avgResolutionTime);
        
        return report;
    }

    /**
     * Generate summary report of current hotel status
     */
    public Map<String, Object> generateSummaryReport() {
        Map<String, Object> report = new HashMap<>();
        Date today = new Date();
        
        // Room statistics
        List<Room> allRooms = roomRepository.findAll();
        long availableRooms = allRooms.stream().filter(Room::isAvailable).count();
        long occupiedRooms = allRooms.size() - availableRooms;
        double occupancyRate = (double) occupiedRooms / allRooms.size() * 100;
        
        // Booking statistics
        List<Booking> checkInsToday = bookingRepository.findTodayCheckIns(today);
        List<Booking> checkOutsToday = bookingRepository.findTodayCheckOuts(today);
        
        // Maintenance statistics
        List<MaintenanceRequest> openRequests = maintenanceRequestRepository.findOpenRequests();
        long highPriorityRequests = openRequests.stream()
                .filter(req -> req.getPriority() == MaintenanceRequest.Priority.HIGH || 
                               req.getPriority() == MaintenanceRequest.Priority.URGENT)
                .count();
        
        report.put("date", today);
        report.put("totalRooms", allRooms.size());
        report.put("availableRooms", availableRooms);
        report.put("occupiedRooms", occupiedRooms);
        report.put("occupancyRate", occupancyRate);
        report.put("checkInsToday", checkInsToday.size());
        report.put("checkOutsToday", checkOutsToday.size());
        report.put("openMaintenanceRequests", openRequests.size());
        report.put("highPriorityMaintenanceRequests", highPriorityRequests);
        
        return report;
    }

    /**
     * Helper method to calculate days of overlap between a booking and a date range
     */
    private long calculateOverlapDays(Booking booking, Date rangeStart, Date rangeEnd) {
        LocalDate bookingStart = booking.getCheckInDate().toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
        
        LocalDate bookingEnd = booking.getCheckOutDate().toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
        
        LocalDate reportStart = rangeStart.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
        
        LocalDate reportEnd = rangeEnd.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
        
        // Find overlap start and end
        LocalDate overlapStart = bookingStart.isBefore(reportStart) ? reportStart : bookingStart;
        LocalDate overlapEnd = bookingEnd.isAfter(reportEnd) ? reportEnd : bookingEnd;
        
        // Calculate days between overlap start and end
        if (overlapStart.isAfter(overlapEnd)) {
            return 0; // No overlap
        }
        
        return ChronoUnit.DAYS.between(overlapStart, overlapEnd);
    }
}