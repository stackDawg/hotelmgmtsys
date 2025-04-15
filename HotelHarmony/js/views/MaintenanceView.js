/**
 * MaintenanceView
 * Implements MVC pattern - handles the presentation logic for maintenance staff functionality
 * Follows Single Responsibility Principle by focusing only on maintenance-related UI
 */
class MaintenanceView {
    constructor(controller) {
        this.controller = controller;
        this.maintenanceStaffView = document.getElementById('maintenance-staff-view');
        this.openRequestsCount = document.getElementById('open-requests-count');
        this.inProgressRequestsCount = document.getElementById('in-progress-requests-count');
        this.completedRequestsCount = document.getElementById('completed-requests-count');
        this.maintenanceFilter = document.getElementById('maintenance-filter');
        this.maintenanceTableBody = document.getElementById('maintenance-table-body');
        this.maintenanceDetailContent = document.getElementById('maintenance-detail-content');
        this.updateMaintenanceBtn = document.getElementById('update-maintenance-btn');
        
        // Observer pattern - subscribe to relevant events
        this.observer = Observer.getInstance();
        this.observer.subscribe('navigationChange', this.handleNavigation.bind(this));
        this.observer.subscribe('maintenanceRequestUpdated', this.refreshData.bind(this));
        
        this.registerEventListeners();
    }

    /**
     * Register event listeners for maintenance view
     */
    registerEventListeners() {
        // Maintenance filter change
        this.maintenanceFilter.addEventListener('change', () => {
            this.displayMaintenanceRequests();
        });
        
        // Update maintenance button click
        this.updateMaintenanceBtn.addEventListener('click', () => {
            this.updateMaintenanceRequest();
        });
    }

    /**
     * Initialize the maintenance view
     */
    init() {
        this.updateMaintenanceCounters();
        this.displayMaintenanceRequests();
    }

    /**
     * Handle navigation changes
     * @param {string} target Navigation target
     */
    handleNavigation(target) {
        if (target === 'maintenance-requests') {
            this.maintenanceFilter.value = 'all';
            this.displayMaintenanceRequests();
        } else if (target === 'maintenance-completed') {
            this.maintenanceFilter.value = 'completed';
            this.displayMaintenanceRequests();
        }
    }

    /**
     * Refresh data after updates
     */
    refreshData() {
        this.updateMaintenanceCounters();
        this.displayMaintenanceRequests();
    }

    /**
     * Update maintenance counters
     */
    updateMaintenanceCounters() {
        const openRequests = this.controller.getOpenMaintenanceRequests();
        const inProgressRequests = this.controller.getInProgressMaintenanceRequests();
        const completedRequests = this.controller.getCompletedMaintenanceRequests();
        
        // Get requests completed today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const completedToday = completedRequests.filter(request => {
            if (!request.completedOn) return false;
            
            const completedDate = new Date(request.completedOn);
            completedDate.setHours(0, 0, 0, 0);
            return completedDate.getTime() === today.getTime();
        });
        
        // Update counters
        this.openRequestsCount.textContent = openRequests.length;
        this.inProgressRequestsCount.textContent = inProgressRequests.length;
        this.completedRequestsCount.textContent = completedToday.length;
    }

    /**
     * Display maintenance requests based on filter
     */
    displayMaintenanceRequests() {
        const filterValue = this.maintenanceFilter.value;
        let requests;
        
        // Get requests based on filter
        if (filterValue === 'open') {
            requests = this.controller.getOpenMaintenanceRequests();
        } else if (filterValue === 'in-progress') {
            requests = this.controller.getInProgressMaintenanceRequests();
        } else if (filterValue === 'completed') {
            requests = this.controller.getCompletedMaintenanceRequests();
        } else {
            requests = this.controller.getAllMaintenanceRequests();
        }
        
        // Sort by priority and date
        requests.sort((a, b) => {
            // First by status
            const statusPriority = { 'open': 0, 'in-progress': 1, 'completed': 2 };
            if (statusPriority[a.status] !== statusPriority[b.status]) {
                return statusPriority[a.status] - statusPriority[b.status];
            }
            
            // Then by priority
            const priorityValues = { 'high': 0, 'medium': 1, 'low': 2 };
            if (priorityValues[a.priority] !== priorityValues[b.priority]) {
                return priorityValues[a.priority] - priorityValues[b.priority];
            }
            
            // Then by date (most recent first)
            return new Date(b.reportedOn) - new Date(a.reportedOn);
        });
        
        if (requests.length === 0) {
            this.maintenanceTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">No maintenance requests found</td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        
        requests.forEach(request => {
            const reportedDate = new Date(request.reportedOn);
            
            const formattedReportedDate = reportedDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric'
            });
            
            let statusBadge = '';
            let actions = '';
            
            switch (request.status) {
                case 'open':
                    statusBadge = '<span class="badge bg-danger">Open</span>';
                    actions = `
                        <button class="btn btn-sm btn-primary view-request-btn" data-request-id="${request.id}" data-bs-toggle="modal" data-bs-target="#maintenance-detail-modal">View</button>
                        <button class="btn btn-sm btn-warning start-request-btn" data-request-id="${request.id}">Start</button>
                    `;
                    break;
                case 'in-progress':
                    statusBadge = '<span class="badge bg-warning">In Progress</span>';
                    actions = `
                        <button class="btn btn-sm btn-primary view-request-btn" data-request-id="${request.id}" data-bs-toggle="modal" data-bs-target="#maintenance-detail-modal">View</button>
                        <button class="btn btn-sm btn-success complete-request-btn" data-request-id="${request.id}">Complete</button>
                    `;
                    break;
                case 'completed':
                    statusBadge = '<span class="badge bg-success">Completed</span>';
                    actions = `
                        <button class="btn btn-sm btn-primary view-request-btn" data-request-id="${request.id}" data-bs-toggle="modal" data-bs-target="#maintenance-detail-modal">View</button>
                    `;
                    break;
            }
            
            let priorityClass = '';
            switch (request.priority) {
                case 'high':
                    priorityClass = 'priority-high';
                    break;
                case 'medium':
                    priorityClass = 'priority-medium';
                    break;
                case 'low':
                    priorityClass = 'priority-low';
                    break;
            }
            
            html += `
                <tr>
                    <td>${request.id}</td>
                    <td>${request.roomNumber}</td>
                    <td>${request.issueType}</td>
                    <td>${request.description.substring(0, 30)}${request.description.length > 30 ? '...' : ''}</td>
                    <td class="${priorityClass}">${request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}</td>
                    <td>${formattedReportedDate}</td>
                    <td>${statusBadge}</td>
                    <td>${actions}</td>
                </tr>
            `;
        });
        
        this.maintenanceTableBody.innerHTML = html;
        
        // Add event listeners to buttons
        document.querySelectorAll('.view-request-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const requestId = e.target.getAttribute('data-request-id');
                this.showMaintenanceDetails(requestId);
            });
        });
        
        document.querySelectorAll('.start-request-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const requestId = e.target.getAttribute('data-request-id');
                this.startMaintenanceRequest(requestId);
            });
        });
        
        document.querySelectorAll('.complete-request-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const requestId = e.target.getAttribute('data-request-id');
                this.completeMaintenanceRequest(requestId);
            });
        });
    }

    /**
     * Show maintenance request details in modal
     * @param {string} requestId Maintenance request ID
     */
    showMaintenanceDetails(requestId) {
        const request = this.controller.getMaintenanceRequestById(requestId);
        
        if (!request) {
            alert('Maintenance request not found');
            return;
        }
        
        const reportedDate = new Date(request.reportedOn);
        const formattedReportedDate = reportedDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        let completedInfo = '';
        if (request.status === 'completed' && request.completedOn) {
            const completedDate = new Date(request.completedOn);
            const formattedCompletedDate = completedDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            completedInfo = `
                <div class="mt-3">
                    <strong>Completed On:</strong> ${formattedCompletedDate}
                </div>
            `;
        }
        
        // Format notes
        let notesHtml = '<strong>Notes:</strong>';
        if (request.notes.length === 0) {
            notesHtml += ' <em>No notes</em>';
        } else {
            notesHtml += '<ul class="mt-2">';
            request.notes.forEach(note => {
                const noteDate = new Date(note.timestamp);
                const formattedNoteDate = noteDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                notesHtml += `
                    <li>
                        <strong>${formattedNoteDate}</strong><br>
                        ${note.text}
                    </li>
                `;
            });
            notesHtml += '</ul>';
        }
        
        // Set content
        this.maintenanceDetailContent.innerHTML = `
            <div class="mb-3">
                <strong>Request ID:</strong> ${request.id}
            </div>
            <div class="mb-3">
                <strong>Room Number:</strong> ${request.roomNumber}
            </div>
            <div class="mb-3">
                <strong>Issue Type:</strong> ${request.issueType}
            </div>
            <div class="mb-3">
                <strong>Description:</strong><br>
                ${request.description}
            </div>
            <div class="mb-3">
                <strong>Priority:</strong> 
                <span class="priority-${request.priority}">${request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}</span>
            </div>
            <div class="mb-3">
                <strong>Status:</strong> ${request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </div>
            <div class="mb-3">
                <strong>Reported On:</strong> ${formattedReportedDate}
            </div>
            ${completedInfo}
            <div class="mb-3">
                ${notesHtml}
            </div>
        `;
        
        // Update form elements for status update
        document.getElementById('maintenance-id').value = request.id;
        document.getElementById('maintenance-status').value = request.status;
        document.getElementById('maintenance-notes').value = '';
    }

    /**
     * Start a maintenance request
     * @param {string} requestId Maintenance request ID
     */
    startMaintenanceRequest(requestId) {
        try {
            const currentUser = this.controller.getCurrentUser();
            
            if (!currentUser) {
                alert('You must be logged in to update maintenance requests');
                return;
            }
            
            // Call controller to update maintenance request status
            this.controller.updateMaintenanceRequestStatus(
                requestId, 
                'in-progress', 
                currentUser.id, 
                'Maintenance work started'
            );
            
            // Refresh the view
            this.refreshData();
            
            // Show success message
            alert('Maintenance request updated to In Progress');
        } catch (error) {
            alert(`Error updating maintenance request: ${error.message}`);
        }
    }

    /**
     * Complete a maintenance request
     * @param {string} requestId Maintenance request ID
     */
    completeMaintenanceRequest(requestId) {
        if (confirm('Are you sure you want to mark this request as completed?')) {
            try {
                const currentUser = this.controller.getCurrentUser();
                
                if (!currentUser) {
                    alert('You must be logged in to update maintenance requests');
                    return;
                }
                
                // Call controller to update maintenance request status
                this.controller.updateMaintenanceRequestStatus(
                    requestId, 
                    'completed', 
                    currentUser.id, 
                    'Maintenance work completed'
                );
                
                // Refresh the view
                this.refreshData();
                
                // Show success message
                alert('Maintenance request marked as completed');
            } catch (error) {
                alert(`Error updating maintenance request: ${error.message}`);
            }
        }
    }

    /**
     * Update maintenance request from modal form
     */
    updateMaintenanceRequest() {
        const requestId = document.getElementById('maintenance-id').value;
        const status = document.getElementById('maintenance-status').value;
        const notes = document.getElementById('maintenance-notes').value;
        
        if (!requestId || !status) {
            alert('Missing required information');
            return;
        }
        
        try {
            const currentUser = this.controller.getCurrentUser();
            
            if (!currentUser) {
                alert('You must be logged in to update maintenance requests');
                return;
            }
            
            // Call controller to update maintenance request status
            this.controller.updateMaintenanceRequestStatus(
                requestId, 
                status, 
                currentUser.id, 
                notes
            );
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('maintenance-detail-modal'));
            modal.hide();
            
            // Refresh the view
            this.refreshData();
            
            // Show success message
            alert('Maintenance request updated successfully');
        } catch (error) {
            alert(`Error updating maintenance request: ${error.message}`);
        }
    }
}
