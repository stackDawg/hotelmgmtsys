/**
 * MaintenanceController
 * Implements MVC pattern - handles maintenance-related operations
 * Follows Single Responsibility Principle by handling only maintenance-related functionality
 */
class MaintenanceController {
    constructor(databaseService) {
        // Dependency injection
        this.databaseService = databaseService;
        
        // Observer pattern
        this.observer = Observer.getInstance();
    }

    /**
     * Create a new maintenance request
     * @param {Object} requestData Maintenance request data
     * @returns {MaintenanceRequest} Newly created maintenance request
     */
    createMaintenanceRequest(requestData) {
        const { roomNumber, issueType, description, reportedBy, priority } = requestData;
        
        // Check if room exists
        const room = this.databaseService.getRoomByNumber(roomNumber);
        if (!room) {
            throw new Error(`Room ${roomNumber} not found`);
        }
        
        // Create a unique request ID
        const requestId = `MR${Date.now().toString().slice(-6)}`;
        
        // Create maintenance request object
        const request = new MaintenanceRequest(
            requestId,
            roomNumber,
            issueType,
            description,
            reportedBy,
            priority || 'medium'
        );
        
        // Save to database
        this.databaseService.saveMaintenanceRequest(request);
        
        // Notify observers
        this.observer.notify('maintenanceRequestCreated', request);
        
        return request;
    }

    /**
     * Get all maintenance requests
     * @returns {Array} List of all maintenance requests
     */
    getAllMaintenanceRequests() {
        return this.databaseService.getAllMaintenanceRequests();
    }

    /**
     * Get a maintenance request by ID
     * @param {string} requestId Maintenance request ID
     * @returns {MaintenanceRequest|null} Maintenance request object or null if not found
     */
    getMaintenanceRequestById(requestId) {
        return this.databaseService.getMaintenanceRequestById(requestId);
    }

    /**
     * Get maintenance requests for a specific room
     * @param {string} roomNumber Room number
     * @returns {Array} List of maintenance requests for the room
     */
    getMaintenanceRequestsByRoom(roomNumber) {
        const requests = this.databaseService.getAllMaintenanceRequests();
        return requests.filter(request => request.roomNumber === roomNumber);
    }

    /**
     * Get open maintenance requests
     * @returns {Array} List of open maintenance requests
     */
    getOpenMaintenanceRequests() {
        const requests = this.databaseService.getAllMaintenanceRequests();
        return requests.filter(request => request.status === 'open');
    }

    /**
     * Get in-progress maintenance requests
     * @returns {Array} List of in-progress maintenance requests
     */
    getInProgressMaintenanceRequests() {
        const requests = this.databaseService.getAllMaintenanceRequests();
        return requests.filter(request => request.status === 'in-progress');
    }

    /**
     * Get completed maintenance requests
     * @returns {Array} List of completed maintenance requests
     */
    getCompletedMaintenanceRequests() {
        const requests = this.databaseService.getAllMaintenanceRequests();
        return requests.filter(request => request.status === 'completed');
    }

    /**
     * Update maintenance request status
     * @param {string} requestId Maintenance request ID
     * @param {string} status New status
     * @param {string} updatedBy User ID of the person updating the status
     * @param {string} notes Optional notes to add
     * @returns {MaintenanceRequest} Updated maintenance request
     */
    updateMaintenanceRequestStatus(requestId, status, updatedBy, notes) {
        // Get existing request
        const request = this.databaseService.getMaintenanceRequestById(requestId);
        if (!request) {
            throw new Error(`Maintenance request ${requestId} not found`);
        }
        
        // Update status
        request.updateStatus(status, updatedBy);
        
        // Add notes if provided
        if (notes) {
            request.addNote(notes, updatedBy);
        }
        
        // Update room status if maintenance is completed
        if (status === 'completed') {
            const room = this.databaseService.getRoomByNumber(request.roomNumber);
            if (room && room.status === 'maintenance') {
                room.updateStatus('available');
                room.addMaintenanceRecord(request.issueType, request.description, updatedBy);
                this.databaseService.saveRoom(room);
            }
        }
        
        // Save updated request
        this.databaseService.saveMaintenanceRequest(request);
        
        // Notify observers
        this.observer.notify('maintenanceRequestUpdated', request);
        
        return request;
    }

    /**
     * Assign a maintenance request to a staff member
     * @param {string} requestId Maintenance request ID
     * @param {string} staffId User ID of the assigned staff member
     * @param {string} assignedBy User ID of the person making the assignment
     * @returns {MaintenanceRequest} Updated maintenance request
     */
    assignMaintenanceRequest(requestId, staffId, assignedBy) {
        // Get existing request
        const request = this.databaseService.getMaintenanceRequestById(requestId);
        if (!request) {
            throw new Error(`Maintenance request ${requestId} not found`);
        }
        
        // Assign the request
        request.assignTo(staffId, assignedBy);
        
        // Save updated request
        this.databaseService.saveMaintenanceRequest(request);
        
        // Notify observers
        this.observer.notify('maintenanceRequestAssigned', request);
        
        return request;
    }

    /**
     * Update maintenance request priority
     * @param {string} requestId Maintenance request ID
     * @param {string} priority New priority
     * @param {string} updatedBy User ID of the person updating the priority
     * @returns {MaintenanceRequest} Updated maintenance request
     */
    updateMaintenanceRequestPriority(requestId, priority, updatedBy) {
        // Get existing request
        const request = this.databaseService.getMaintenanceRequestById(requestId);
        if (!request) {
            throw new Error(`Maintenance request ${requestId} not found`);
        }
        
        // Update priority
        request.updatePriority(priority, updatedBy);
        
        // Save updated request
        this.databaseService.saveMaintenanceRequest(request);
        
        // Notify observers
        this.observer.notify('maintenanceRequestUpdated', request);
        
        return request;
    }

    /**
     * Delete a maintenance request
     * @param {string} requestId Maintenance request ID
     * @returns {boolean} Whether deletion was successful
     */
    deleteMaintenanceRequest(requestId) {
        // Check if request exists
        const request = this.databaseService.getMaintenanceRequestById(requestId);
        if (!request) {
            throw new Error(`Maintenance request ${requestId} not found`);
        }
        
        // Delete from database
        const result = this.databaseService.deleteMaintenanceRequest(requestId);
        
        // Notify observers
        if (result) {
            this.observer.notify('maintenanceRequestDeleted', requestId);
        }
        
        return result;
    }

    /**
     * Get maintenance statistics
     * @returns {Object} Maintenance statistics
     */
    getMaintenanceStats() {
        const requests = this.databaseService.getAllMaintenanceRequests();
        
        // Count requests by status
        const statusCounts = {
            open: 0,
            'in-progress': 0,
            completed: 0
        };
        
        // Count requests by type
        const typeCounts = {};
        
        // Count requests by priority
        const priorityCounts = {
            low: 0,
            medium: 0,
            high: 0
        };
        
        // Count completed requests today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let completedToday = 0;
        
        requests.forEach(request => {
            // Count by status
            statusCounts[request.status] = (statusCounts[request.status] || 0) + 1;
            
            // Count by type
            typeCounts[request.issueType] = (typeCounts[request.issueType] || 0) + 1;
            
            // Count by priority
            priorityCounts[request.priority] = (priorityCounts[request.priority] || 0) + 1;
            
            // Count completed today
            if (request.status === 'completed' && request.completedOn) {
                const completedDate = new Date(request.completedOn);
                completedDate.setHours(0, 0, 0, 0);
                if (completedDate.getTime() === today.getTime()) {
                    completedToday++;
                }
            }
        });
        
        // Calculate average resolution time (for completed requests)
        let totalResolutionTime = 0;
        let completedCount = 0;
        
        requests.forEach(request => {
            if (request.status === 'completed' && request.completedOn) {
                const reportedDate = new Date(request.reportedOn);
                const completedDate = new Date(request.completedOn);
                const resolutionTimeHours = (completedDate - reportedDate) / (1000 * 60 * 60);
                totalResolutionTime += resolutionTimeHours;
                completedCount++;
            }
        });
        
        const avgResolutionTime = completedCount > 0 ? totalResolutionTime / completedCount : 0;
        
        return {
            totalRequests: requests.length,
            openRequests: statusCounts.open,
            inProgressRequests: statusCounts['in-progress'],
            completedRequests: statusCounts.completed,
            completedToday,
            requestsByType: typeCounts,
            requestsByPriority: priorityCounts,
            avgResolutionTimeHours: avgResolutionTime.toFixed(2)
        };
    }

    /**
     * Get overdue maintenance requests
     * @returns {Array} List of overdue maintenance requests
     */
    getOverdueMaintenanceRequests() {
        const requests = this.databaseService.getAllMaintenanceRequests();
        return requests.filter(request => request.isOverdue());
    }
}
