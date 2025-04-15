/**
 * ReportController
 * Implements MVC pattern - handles report generation and data analysis
 * Follows Single Responsibility Principle by handling only reporting functionality
 */
class ReportController {
    constructor(databaseService) {
        // Dependency injection
        this.databaseService = databaseService;
    }

    /**
     * Generate occupancy report for a given date range
     * @param {Date} startDate Start date
     * @param {Date} endDate End date
     * @returns {Object} Occupancy report data
     */
    generateOccupancyReport(startDate, endDate) {
        const rooms = this.databaseService.getAllRooms();
        const bookings = this.databaseService.getAllBookings();
        const totalRooms = rooms.length;
        
        // Initialize result object
        const report = {
            startDate,
            endDate,
            totalRooms,
            dailyOccupancy: [],
            averageOccupancy: 0,
            typeDistribution: {
                standard: 0,
                deluxe: 0,
                suite: 0
            },
            totalRevenue: 0
        };
        
        // Calculate days in range
        const oneDay = 24 * 60 * 60 * 1000;
        const diffDays = Math.round(Math.abs((endDate - startDate) / oneDay)) + 1;
        
        // Loop through each day in range
        let currentDate = new Date(startDate);
        let totalOccupiedDays = 0;
        
        for (let i = 0; i < diffDays; i++) {
            // Calculate occupancy for this day
            let occupiedRooms = 0;
            const relevantBookings = bookings.filter(booking => {
                const bookingStart = new Date(booking.checkInDate);
                const bookingEnd = new Date(booking.checkOutDate);
                return (
                    (booking.status === 'checked-in' || booking.status === 'checked-out' || booking.status === 'reserved') &&
                    bookingStart <= currentDate && bookingEnd > currentDate
                );
            });
            
            // Count unique rooms occupied on this day
            const occupiedRoomNumbers = new Set();
            relevantBookings.forEach(booking => {
                occupiedRoomNumbers.add(booking.roomNumber);
            });
            
            occupiedRooms = occupiedRoomNumbers.size;
            const occupancyRate = (occupiedRooms / totalRooms) * 100;
            
            // Add to daily occupancy array
            report.dailyOccupancy.push({
                date: new Date(currentDate),
                occupiedRooms,
                occupancyRate: occupancyRate.toFixed(2)
            });
            
            totalOccupiedDays += occupancyRate;
            
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Calculate average occupancy
        report.averageOccupancy = (totalOccupiedDays / diffDays).toFixed(2);
        
        // Calculate room type distribution
        rooms.forEach(room => {
            report.typeDistribution[room.type]++;
        });
        
        // Calculate total revenue
        bookings.forEach(booking => {
            const bookingStart = new Date(booking.checkInDate);
            const bookingEnd = new Date(booking.checkOutDate);
            
            // Only count bookings that overlap with the date range
            if (bookingStart <= endDate && bookingEnd >= startDate) {
                if (booking.status === 'checked-out' || booking.status === 'checked-in') {
                    report.totalRevenue += booking.totalPrice;
                }
            }
        });
        
        return report;
    }

    /**
     * Generate revenue report for a given date range
     * @param {Date} startDate Start date
     * @param {Date} endDate End date
     * @returns {Object} Revenue report data
     */
    generateRevenueReport(startDate, endDate) {
        const bookings = this.databaseService.getAllBookings();
        
        // Initialize result object
        const report = {
            startDate,
            endDate,
            totalRevenue: 0,
            revenueByType: {
                standard: 0,
                deluxe: 0,
                suite: 0
            },
            revenueByDay: [],
            averageDailyRevenue: 0,
            paymentMethodDistribution: {}
        };
        
        // Calculate days in range
        const oneDay = 24 * 60 * 60 * 1000;
        const diffDays = Math.round(Math.abs((endDate - startDate) / oneDay)) + 1;
        
        // Prepare daily revenue tracking
        let currentDate = new Date(startDate);
        for (let i = 0; i < diffDays; i++) {
            report.revenueByDay.push({
                date: new Date(currentDate),
                revenue: 0
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Process each booking
        bookings.forEach(booking => {
            const bookingStart = new Date(booking.checkInDate);
            const bookingEnd = new Date(booking.checkOutDate);
            
            // Only count bookings that overlap with the date range and are checked-out (payment completed)
            if (booking.status === 'checked-out' && bookingStart <= endDate && bookingEnd >= startDate) {
                // Add to total revenue
                report.totalRevenue += booking.totalPrice;
                
                // Add to payment method distribution
                if (booking.paymentMethod) {
                    report.paymentMethodDistribution[booking.paymentMethod] = 
                        (report.paymentMethodDistribution[booking.paymentMethod] || 0) + booking.totalPrice;
                }
                
                // Get room to determine type
                const room = this.databaseService.getRoomByNumber(booking.roomNumber);
                if (room) {
                    report.revenueByType[room.type] += booking.totalPrice;
                }
                
                // Assign revenue to the check-out date
                const checkoutDate = new Date(booking.checkOutDate);
                checkoutDate.setHours(0, 0, 0, 0);
                
                // Find the corresponding day in revenueByDay
                const dayIndex = Math.floor((checkoutDate - startDate) / oneDay);
                if (dayIndex >= 0 && dayIndex < report.revenueByDay.length) {
                    report.revenueByDay[dayIndex].revenue += booking.totalPrice;
                }
            }
        });
        
        // Calculate average daily revenue
        report.averageDailyRevenue = (report.totalRevenue / diffDays).toFixed(2);
        
        return report;
    }

    /**
     * Generate maintenance report for a given date range
     * @param {Date} startDate Start date
     * @param {Date} endDate End date
     * @returns {Object} Maintenance report data
     */
    generateMaintenanceReport(startDate, endDate) {
        const maintenanceRequests = this.databaseService.getAllMaintenanceRequests();
        
        // Initialize result object
        const report = {
            startDate,
            endDate,
            totalRequests: 0,
            requestsByStatus: {
                open: 0,
                'in-progress': 0,
                completed: 0
            },
            requestsByType: {},
            requestsByRoom: {},
            averageResolutionTime: 0,
            requestsByPriority: {
                low: 0,
                medium: 0,
                high: 0
            }
        };
        
        // Filter requests in date range
        const requestsInRange = maintenanceRequests.filter(request => {
            const reportDate = new Date(request.reportedOn);
            return reportDate >= startDate && reportDate <= endDate;
        });
        
        report.totalRequests = requestsInRange.length;
        
        // Process each request
        let totalResolutionTime = 0;
        let completedCount = 0;
        
        requestsInRange.forEach(request => {
            // Count by status
            report.requestsByStatus[request.status]++;
            
            // Count by type
            report.requestsByType[request.issueType] = (report.requestsByType[request.issueType] || 0) + 1;
            
            // Count by room
            report.requestsByRoom[request.roomNumber] = (report.requestsByRoom[request.roomNumber] || 0) + 1;
            
            // Count by priority
            report.requestsByPriority[request.priority]++;
            
            // Calculate resolution time for completed requests
            if (request.status === 'completed' && request.completedOn) {
                const reportDate = new Date(request.reportedOn);
                const completedDate = new Date(request.completedOn);
                const resolutionTimeHours = (completedDate - reportDate) / (1000 * 60 * 60);
                totalResolutionTime += resolutionTimeHours;
                completedCount++;
            }
        });
        
        // Calculate average resolution time
        report.averageResolutionTime = completedCount > 0 ? (totalResolutionTime / completedCount).toFixed(2) : 0;
        
        return report;
    }

    /**
     * Generate staff performance report
     * @param {Date} startDate Start date
     * @param {Date} endDate End date
     * @returns {Object} Staff performance report data
     */
    generateStaffPerformanceReport(startDate, endDate) {
        const maintenanceRequests = this.databaseService.getAllMaintenanceRequests();
        const bookings = this.databaseService.getAllBookings();
        
        // Initialize result object
        const report = {
            startDate,
            endDate,
            maintenancePerformance: {},
            receptionistPerformance: {
                checkIns: {},
                checkOuts: {}
            }
        };
        
        // Process maintenance requests
        const requestsInRange = maintenanceRequests.filter(request => {
            const reportDate = new Date(request.reportedOn);
            return reportDate >= startDate && reportDate <= endDate;
        });
        
        requestsInRange.forEach(request => {
            if (request.assignedTo) {
                if (!report.maintenancePerformance[request.assignedTo]) {
                    report.maintenancePerformance[request.assignedTo] = {
                        assigned: 0,
                        completed: 0,
                        averageResolutionTime: 0,
                        totalResolutionTime: 0
                    };
                }
                
                report.maintenancePerformance[request.assignedTo].assigned++;
                
                if (request.status === 'completed') {
                    report.maintenancePerformance[request.assignedTo].completed++;
                    
                    if (request.completedOn) {
                        const reportDate = new Date(request.reportedOn);
                        const completedDate = new Date(request.completedOn);
                        const resolutionTimeHours = (completedDate - reportDate) / (1000 * 60 * 60);
                        report.maintenancePerformance[request.assignedTo].totalResolutionTime += resolutionTimeHours;
                    }
                }
            }
        });
        
        // Calculate average resolution time for each staff member
        Object.keys(report.maintenancePerformance).forEach(staffId => {
            const staff = report.maintenancePerformance[staffId];
            if (staff.completed > 0) {
                staff.averageResolutionTime = (staff.totalResolutionTime / staff.completed).toFixed(2);
            }
            delete staff.totalResolutionTime; // Remove the total since we only need the average
        });
        
        // Process bookings for receptionist performance
        const bookingsInRange = bookings.filter(booking => {
            const checkInDate = new Date(booking.checkInDate);
            const checkOutDate = new Date(booking.checkOutDate);
            return (checkInDate >= startDate && checkInDate <= endDate) || 
                   (checkOutDate >= startDate && checkOutDate <= endDate);
        });
        
        // This would require staff IDs to be recorded in actual check-in/check-out operations
        // For MVP, we'll leave this part as placeholders
        
        return report;
    }

    /**
     * Generate a quick summary report of current hotel status
     * @returns {Object} Summary report data
     */
    generateSummaryReport() {
        const rooms = this.databaseService.getAllRooms();
        const bookings = this.databaseService.getAllBookings();
        const maintenanceRequests = this.databaseService.getAllMaintenanceRequests();
        
        // Calculate room status counts
        const roomStatusCounts = {
            available: 0,
            occupied: 0,
            maintenance: 0,
            reserved: 0
        };
        
        rooms.forEach(room => {
            roomStatusCounts[room.status]++;
        });
        
        // Calculate today's check-ins and check-outs
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayCheckIns = bookings.filter(booking => {
            const checkInDate = new Date(booking.checkInDate);
            checkInDate.setHours(0, 0, 0, 0);
            return (
                booking.status === 'reserved' &&
                checkInDate.getTime() === today.getTime()
            );
        }).length;
        
        const todayCheckOuts = bookings.filter(booking => {
            const checkOutDate = new Date(booking.checkOutDate);
            checkOutDate.setHours(0, 0, 0, 0);
            return (
                booking.status === 'checked-in' &&
                checkOutDate.getTime() === today.getTime()
            );
        }).length;
        
        // Calculate pending maintenance issues
        const pendingMaintenance = maintenanceRequests.filter(request => 
            request.status === 'open' || request.status === 'in-progress'
        ).length;
        
        // Calculate occupancy rate
        const occupancyRate = (roomStatusCounts.occupied / rooms.length) * 100;
        
        return {
            date: new Date(),
            roomStatusCounts,
            totalRooms: rooms.length,
            occupancyRate: occupancyRate.toFixed(2),
            todayCheckIns,
            todayCheckOuts,
            pendingMaintenance
        };
    }

    /**
     * Generate chart data for occupancy trend
     * @param {number} days Number of days to include in the trend
     * @returns {Object} Chart data for occupancy trend
     */
    generateOccupancyTrendChartData(days = 7) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (days - 1));
        
        const report = this.generateOccupancyReport(startDate, endDate);
        
        // Format data for Chart.js
        const labels = report.dailyOccupancy.map(day => {
            return day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const occupancyData = report.dailyOccupancy.map(day => day.occupancyRate);
        
        return {
            labels,
            datasets: [{
                label: 'Occupancy Rate (%)',
                data: occupancyData,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        };
    }

    /**
     * Generate chart data for room type distribution
     * @returns {Object} Chart data for room type distribution
     */
    generateRoomTypeChartData() {
        const rooms = this.databaseService.getAllRooms();
        
        // Count rooms by type
        const typeCounts = {
            standard: 0,
            deluxe: 0,
            suite: 0
        };
        
        rooms.forEach(room => {
            typeCounts[room.type]++;
        });
        
        // Format data for Chart.js
        return {
            labels: ['Standard', 'Deluxe', 'Suite'],
            datasets: [{
                data: [typeCounts.standard, typeCounts.deluxe, typeCounts.suite],
                backgroundColor: ['#3498db', '#2ecc71', '#f39c12'],
                borderWidth: 0
            }]
        };
    }

    /**
     * Generate chart data for maintenance requests by type
     * @returns {Object} Chart data for maintenance requests by type
     */
    generateMaintenanceTypeChartData() {
        const maintenanceRequests = this.databaseService.getAllMaintenanceRequests();
        
        // Count requests by type
        const typeCounts = {};
        
        maintenanceRequests.forEach(request => {
            typeCounts[request.issueType] = (typeCounts[request.issueType] || 0) + 1;
        });
        
        // Format data for Chart.js
        const types = Object.keys(typeCounts);
        const counts = types.map(type => typeCounts[type]);
        const backgroundColors = [
            '#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', 
            '#1abc9c', '#34495e', '#d35400', '#c0392b', '#7f8c8d'
        ];
        
        return {
            labels: types,
            datasets: [{
                data: counts,
                backgroundColor: backgroundColors.slice(0, types.length),
                borderWidth: 0
            }]
        };
    }
}
