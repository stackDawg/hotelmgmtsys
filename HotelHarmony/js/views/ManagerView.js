/**
 * ManagerView
 * Implements MVC pattern - handles the presentation logic for manager functionality
 * Follows Single Responsibility Principle by focusing only on manager-related UI
 */
class ManagerView {
    constructor(controller, reportController) {
        this.controller = controller;
        this.reportController = reportController;
        this.managerView = document.getElementById('manager-view');
        
        // Dashboard counters
        this.totalRoomsCount = document.getElementById('total-rooms-count');
        this.occupiedRoomsCount = document.getElementById('occupied-rooms-count');
        this.todaysCheckinsCount = document.getElementById('todays-checkins-count');
        this.todaysCheckoutsCount = document.getElementById('todays-checkouts-count');
        
        // Room inventory
        this.roomInventoryTableBody = document.getElementById('room-inventory-table-body');
        
        // Staff accounts container
        this.staffAccountsContainer = document.getElementById('staff-accounts-container');
        this.staffAccountsTableBody = document.getElementById('staff-accounts-table-body');
        
        // Charts
        this.occupancyChart = null;
        this.roomTypeChart = null;
        
        // Observer pattern - subscribe to relevant events
        this.observer = Observer.getInstance();
        this.observer.subscribe('navigationChange', this.handleNavigation.bind(this));
        this.observer.subscribe('roomAdded', this.refreshRoomData.bind(this));
        this.observer.subscribe('roomUpdated', this.refreshRoomData.bind(this));
        this.observer.subscribe('roomDeleted', this.refreshRoomData.bind(this));
        
        this.registerEventListeners();
    }

    /**
     * Register event listeners for manager view
     */
    registerEventListeners() {
        // Add room button
        document.getElementById('add-room-btn').addEventListener('click', () => {
            // Reset add room form
            document.getElementById('add-room-form').reset();
            
            // Show modal
            const addRoomModal = new bootstrap.Modal(document.getElementById('add-room-modal'));
            addRoomModal.show();
        });
        
        // Save room button
        document.getElementById('save-room-btn').addEventListener('click', () => {
            this.handleAddRoom();
        });
        
        // Add staff button
        document.getElementById('add-staff-btn').addEventListener('click', () => {
            // Reset add staff form
            document.getElementById('add-staff-form').reset();
            
            // Show modal
            const addStaffModal = new bootstrap.Modal(document.getElementById('add-staff-modal'));
            addStaffModal.show();
        });
        
        // Save staff button
        document.getElementById('save-staff-btn').addEventListener('click', () => {
            this.handleAddStaff();
        });
    }

    /**
     * Initialize the manager view
     */
    init() {
        this.updateDashboardCounters();
        this.displayRoomInventory();
        this.initCharts();
    }

    /**
     * Handle navigation changes
     * @param {string} target Navigation target
     */
    handleNavigation(target) {
        switch (target) {
            case 'manager-dashboard':
                this.showDashboard();
                break;
            case 'manager-rooms':
                this.showRoomInventory();
                break;
            case 'manager-reports':
                this.showReports();
                break;
            case 'manager-staff':
                this.showStaffAccounts();
                break;
        }
    }

    /**
     * Update dashboard counters
     */
    updateDashboardCounters() {
        const stats = this.controller.getRoomOccupancyStats();
        this.totalRoomsCount.textContent = stats.totalRooms;
        this.occupiedRoomsCount.textContent = stats.occupiedRooms;
        
        const checkIns = this.controller.getTodaysCheckIns();
        this.todaysCheckinsCount.textContent = checkIns.length;
        
        const checkOuts = this.controller.getTodaysCheckOuts();
        this.todaysCheckoutsCount.textContent = checkOuts.length;
    }

    /**
     * Initialize charts
     */
    initCharts() {
        // Destroy existing charts if they exist
        if (this.occupancyChart) {
            this.occupancyChart.destroy();
        }
        
        if (this.roomTypeChart) {
            this.roomTypeChart.destroy();
        }
        
        // Create occupancy chart
        const occupancyCtx = document.getElementById('occupancy-chart').getContext('2d');
        this.occupancyChart = new Chart(occupancyCtx, {
            type: 'line',
            data: this.reportController.generateOccupancyTrendChartData(),
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Occupancy Rate (%)'
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
        
        // Create room type distribution chart
        const roomTypeCtx = document.getElementById('room-type-chart').getContext('2d');
        this.roomTypeChart = new Chart(roomTypeCtx, {
            type: 'doughnut',
            data: this.reportController.generateRoomTypeChartData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right'
                    }
                }
            }
        });
    }

    /**
     * Show dashboard view
     */
    showDashboard() {
        // Hide staff accounts container
        this.staffAccountsContainer.classList.add('d-none');
        
        // Update counters and charts
        this.updateDashboardCounters();
        this.initCharts();
    }

    /**
     * Show room inventory view
     */
    showRoomInventory() {
        // Hide staff accounts container
        this.staffAccountsContainer.classList.add('d-none');
        
        // Display room inventory
        this.displayRoomInventory();
    }

    /**
     * Display room inventory
     */
    displayRoomInventory() {
        const rooms = this.controller.getAllRooms();
        
        // Sort rooms by number
        rooms.sort((a, b) => parseInt(a.number) - parseInt(b.number));
        
        if (rooms.length === 0) {
            this.roomInventoryTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No rooms found</td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        
        rooms.forEach(room => {
            const lastCleaned = new Date(room.lastCleaned);
            const formattedLastCleaned = lastCleaned.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric'
            });
            
            let statusBadge = '';
            
            switch (room.status) {
                case 'available':
                    statusBadge = '<span class="badge bg-success">Available</span>';
                    break;
                case 'occupied':
                    statusBadge = '<span class="badge bg-danger">Occupied</span>';
                    break;
                case 'maintenance':
                    statusBadge = '<span class="badge bg-warning">Maintenance</span>';
                    break;
                case 'reserved':
                    statusBadge = '<span class="badge bg-primary">Reserved</span>';
                    break;
            }
            
            html += `
                <tr>
                    <td>${room.number}</td>
                    <td>${room.type.charAt(0).toUpperCase() + room.type.slice(1)}</td>
                    <td>${room.capacity}</td>
                    <td>$${room.pricePerNight.toFixed(2)}</td>
                    <td>${statusBadge}</td>
                    <td>${formattedLastCleaned}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-1 edit-room-btn" data-room-number="${room.number}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-room-btn" data-room-number="${room.number}">Delete</button>
                    </td>
                </tr>
            `;
        });
        
        this.roomInventoryTableBody.innerHTML = html;
        
        // Add event listeners to buttons
        document.querySelectorAll('.edit-room-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roomNumber = e.target.getAttribute('data-room-number');
                this.showEditRoomModal(roomNumber);
            });
        });
        
        document.querySelectorAll('.delete-room-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roomNumber = e.target.getAttribute('data-room-number');
                this.handleDeleteRoom(roomNumber);
            });
        });
    }

    /**
     * Handle adding a new room
     */
    handleAddRoom() {
        const roomNumber = document.getElementById('room-number').value;
        const roomType = document.getElementById('room-type-select').value;
        const capacity = document.getElementById('room-capacity').value;
        const pricePerNight = document.getElementById('room-price').value;
        
        if (!roomNumber || !roomType || !capacity || !pricePerNight) {
            alert('Please fill in all fields');
            return;
        }
        
        try {
            // Call controller to add room
            const roomData = {
                number: roomNumber,
                type: roomType,
                capacity,
                pricePerNight
            };
            
            this.controller.addRoom(roomData);
            
            // Hide modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('add-room-modal'));
            modal.hide();
            
            // Show success message
            alert('Room added successfully');
            
            // Refresh room inventory
            this.refreshRoomData();
        } catch (error) {
            alert(`Error adding room: ${error.message}`);
        }
    }

    /**
     * Show edit room modal
     * @param {string} roomNumber Room number to edit
     */
    showEditRoomModal(roomNumber) {
        // In a real application, we would show a modal to edit the room
        // For the MVP, we'll just show an alert
        alert(`Edit room ${roomNumber} - This feature would open a modal to edit the room`);
    }

    /**
     * Handle deleting a room
     * @param {string} roomNumber Room number to delete
     */
    handleDeleteRoom(roomNumber) {
        if (confirm(`Are you sure you want to delete room ${roomNumber}?`)) {
            try {
                // Call controller to delete room
                this.controller.deleteRoom(roomNumber);
                
                // Show success message
                alert('Room deleted successfully');
                
                // Refresh room inventory
                this.refreshRoomData();
            } catch (error) {
                alert(`Error deleting room: ${error.message}`);
            }
        }
    }

    /**
     * Refresh room data
     */
    refreshRoomData() {
        this.updateDashboardCounters();
        this.displayRoomInventory();
        this.initCharts();
    }

    /**
     * Show reports view
     */
    showReports() {
        // In a real application, we would show a reports view
        // For the MVP, we'll just show an alert
        alert('Reports View - This feature would show various hotel reports');
    }

    /**
     * Show staff accounts view
     */
    showStaffAccounts() {
        // Show staff accounts container
        this.staffAccountsContainer.classList.remove('d-none');
        
        // Display staff accounts
        this.displayStaffAccounts();
    }

    /**
     * Display staff accounts
     */
    displayStaffAccounts() {
        // For MVP, we'll show mock staff data
        const mockStaff = [
            {
                id: 'recept1',
                name: 'John Doe',
                role: 'receptionist',
                email: 'john.doe@hotel.com',
                phone: '555-123-4567',
                status: 'active'
            },
            {
                id: 'maint1',
                name: 'Jane Smith',
                role: 'maintenance',
                email: 'jane.smith@hotel.com',
                phone: '555-234-5678',
                status: 'active'
            },
            {
                id: 'mgr1',
                name: 'Robert Johnson',
                role: 'manager',
                email: 'robert.johnson@hotel.com',
                phone: '555-345-6789',
                status: 'active'
            }
        ];
        
        if (mockStaff.length === 0) {
            this.staffAccountsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No staff accounts found</td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        
        mockStaff.forEach(staff => {
            let statusBadge = '';
            
            switch (staff.status) {
                case 'active':
                    statusBadge = '<span class="badge bg-success">Active</span>';
                    break;
                case 'inactive':
                    statusBadge = '<span class="badge bg-secondary">Inactive</span>';
                    break;
            }
            
            html += `
                <tr>
                    <td>${staff.id}</td>
                    <td>${staff.name}</td>
                    <td>${staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}</td>
                    <td>${staff.email}</td>
                    <td>${staff.phone}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-1 edit-staff-btn" data-staff-id="${staff.id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-staff-btn" data-staff-id="${staff.id}">Delete</button>
                    </td>
                </tr>
            `;
        });
        
        this.staffAccountsTableBody.innerHTML = html;
        
        // Add event listeners to buttons
        document.querySelectorAll('.edit-staff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const staffId = e.target.getAttribute('data-staff-id');
                this.showEditStaffModal(staffId);
            });
        });
        
        document.querySelectorAll('.delete-staff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const staffId = e.target.getAttribute('data-staff-id');
                this.handleDeleteStaff(staffId);
            });
        });
    }

    /**
     * Handle adding a new staff member
     */
    handleAddStaff() {
        // In a real application, we would add staff to the database
        // For the MVP, we'll just show an alert
        alert('Staff added successfully - This would add the staff member to the database');
        
        // Hide modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('add-staff-modal'));
        modal.hide();
    }

    /**
     * Show edit staff modal
     * @param {string} staffId Staff ID to edit
     */
    showEditStaffModal(staffId) {
        // In a real application, we would show a modal to edit the staff
        // For the MVP, we'll just show an alert
        alert(`Edit staff ${staffId} - This feature would open a modal to edit the staff member`);
    }

    /**
     * Handle deleting a staff member
     * @param {string} staffId Staff ID to delete
     */
    handleDeleteStaff(staffId) {
        if (confirm(`Are you sure you want to delete staff member ${staffId}?`)) {
            // In a real application, we would delete the staff from the database
            // For the MVP, we'll just show an alert
            alert(`Staff member ${staffId} deleted successfully - This would remove the staff member from the database`);
            
            // Refresh staff accounts
            this.displayStaffAccounts();
        }
    }
}
