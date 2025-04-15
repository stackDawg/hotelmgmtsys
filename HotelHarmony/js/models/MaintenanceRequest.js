/**
 * MaintenanceRequest Model Class
 * Implements Single Responsibility Principle by focusing only on maintenance request data and behaviors
 */
class MaintenanceRequest {
    constructor(id, roomNumber, issueType, description, reportedBy, priority = 'medium') {
        this.id = id;
        this.roomNumber = roomNumber;
        this.issueType = issueType;
        this.description = description;
        this.reportedBy = reportedBy; // User ID who reported the issue
        this.reportedOn = new Date();
        this.status = 'open'; // open, in-progress, completed
        this.assignedTo = null; // User ID of maintenance staff assigned
        this.completedOn = null;
        this.notes = [];
        this.priority = priority; // low, medium, high
    }

    /**
     * Update the status of the maintenance request
     * @param {string} status New status value
     * @param {string} updatedBy User ID who updated the status
     * @returns {boolean} Whether the update was successful
     */
    updateStatus(status, updatedBy) {
        // Validate status values
        const validStatuses = ['open', 'in-progress', 'completed'];
        if (!validStatuses.includes(status)) {
            return false;
        }
        
        // Update status
        this.status = status;
        
        // Add note about status change
        this.addNote(`Status updated to ${status}`, updatedBy);
        
        // If completed, record completion date
        if (status === 'completed') {
            this.completedOn = new Date();
        }
        
        return true;
    }

    /**
     * Assign the request to a maintenance staff member
     * @param {string} staffId User ID of the maintenance staff
     * @param {string} assignedBy User ID who assigned the request
     * @returns {boolean} Whether the assignment was successful
     */
    assignTo(staffId, assignedBy) {
        this.assignedTo = staffId;
        this.addNote(`Assigned to staff ID ${staffId}`, assignedBy);
        return true;
    }

    /**
     * Add a note to the maintenance request
     * @param {string} text Note text
     * @param {string} addedBy User ID who added the note
     */
    addNote(text, addedBy) {
        this.notes.push({
            text,
            addedBy,
            timestamp: new Date()
        });
    }

    /**
     * Update the priority of the maintenance request
     * @param {string} priority New priority value
     * @param {string} updatedBy User ID who updated the priority
     * @returns {boolean} Whether the update was successful
     */
    updatePriority(priority, updatedBy) {
        // Validate priority values
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(priority)) {
            return false;
        }
        
        // Update priority
        this.priority = priority;
        
        // Add note about priority change
        this.addNote(`Priority updated to ${priority}`, updatedBy);
        
        return true;
    }

    /**
     * Check if the request is overdue based on priority
     * @returns {boolean} Whether the request is overdue
     */
    isOverdue() {
        if (this.status === 'completed') {
            return false;
        }
        
        const now = new Date();
        const reportedDate = new Date(this.reportedOn);
        
        // Define SLA timeframes based on priority (in hours)
        const slaTimes = {
            'high': 4,
            'medium': 24,
            'low': 72
        };
        
        // Calculate deadline based on priority
        const deadline = new Date(reportedDate);
        deadline.setHours(deadline.getHours() + slaTimes[this.priority]);
        
        return now > deadline;
    }

    /**
     * Get the time elapsed since the request was reported
     * @returns {string} Formatted time elapsed
     */
    getTimeElapsed() {
        const now = new Date();
        const reportedDate = new Date(this.reportedOn);
        const elapsedMs = now - reportedDate;
        
        // Convert to hours
        const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
        
        if (hours < 24) {
            return `${hours} hour${hours !== 1 ? 's' : ''}`;
        } else {
            const days = Math.floor(hours / 24);
            return `${days} day${days !== 1 ? 's' : ''}`;
        }
    }

    /**
     * Get maintenance request details as a plain object
     * @returns {Object} Maintenance request details
     */
    toJSON() {
        return {
            id: this.id,
            roomNumber: this.roomNumber,
            issueType: this.issueType,
            description: this.description,
            reportedBy: this.reportedBy,
            reportedOn: this.reportedOn,
            status: this.status,
            assignedTo: this.assignedTo,
            completedOn: this.completedOn,
            notes: [...this.notes],
            priority: this.priority,
            isOverdue: this.isOverdue(),
            timeElapsed: this.getTimeElapsed()
        };
    }
}
