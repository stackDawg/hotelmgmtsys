/**
 * ReceptionistView
 * Implements MVC pattern - handles the presentation logic for receptionist functionality
 * Follows Single Responsibility Principle by focusing only on receptionist-related UI
 */
class ReceptionistView {
    constructor(controller) {
        this.controller = controller;
        this.receptionistView = document.getElementById('receptionist-view');
        
        // Check-in containers
        this.checkInContainer = document.getElementById('check-in-container');
        this.checkInForm = document.getElementById('check-in-form');
        this.checkInDetails = document.getElementById('check-in-details');
        
        // Check-out containers
        this.checkOutContainer = document.getElementById('check-out-container');
        this.checkOutForm = document.getElementById('check-out-form');
        this.checkOutDetails = document.getElementById('check-out-details');
        
        // Manage bookings container
        this.manageBookingsContainer = document.getElementById('manage-bookings-container');
        this.bookingsTableBody = document.getElementById('bookings-table-body');
        
        // Maintenance container
        this.receptionistMaintenanceContainer = document.getElementById('receptionist-maintenance-container');
        this.receptionistMaintenanceTableBody = document.getElementById('receptionist-maintenance-table-body');
        
        // Quick action buttons
        this.checkInBtn = document.getElementById('check-in-btn');
        this.checkOutBtn = document.getElementById('check-out-btn');
        this.manageBookingsBtn = document.getElementById('manage-bookings-btn');
        this.viewMaintenanceBtn = document.getElementById('view-maintenance-btn');
        
        // Observer pattern - subscribe to relevant events
        this.observer = Observer.getInstance();
        this.observer.subscribe('navigationChange', this.handleNavigation.bind(this));
        
        this.registerEventListeners();
    }

    /**
     * Register event listeners for receptionist view
     */
    registerEventListeners() {
        // Quick action buttons
        this.checkInBtn.addEventListener('click', () => this.showCheckIn());
        this.checkOutBtn.addEventListener('click', () => this.showCheckOut());
        this.manageBookingsBtn.addEventListener('click', () => this.showManageBookings());
        this.viewMaintenanceBtn.addEventListener('click', () => this.showMaintenanceRequests());
        
        // Check-in form submission
        this.checkInForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.findBookingForCheckIn();
        });
        
        // Check-out form submission
        this.checkOutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.findBookingForCheckOut();
        });
        
        // Search bookings input
        document.getElementById('search-booking').addEventListener('input', (e) => {
            this.searchBookings(e.target.value);
        });
    }

    /**
     * Handle navigation changes
     * @param {string} target Navigation target
     */
    handleNavigation(target) {
        switch (target) {
            case 'receptionist-checkin':
                this.showCheckIn();
                break;
            case 'receptionist-checkout':
                this.showCheckOut();
                break;
            case 'receptionist-bookings':
                this.showManageBookings();
                break;
            case 'receptionist-maintenance':
                this.showMaintenanceRequests();
                break;
        }
    }

    /**
     * Show check-in view
     */
    showCheckIn() {
        // Hide other containers
        this.checkOutContainer.classList.add('d-none');
        this.manageBookingsContainer.classList.add('d-none');
        this.receptionistMaintenanceContainer.classList.add('d-none');
        
        // Show check-in container
        this.checkInContainer.classList.remove('d-none');
        
        // Reset form and hide details
        this.checkInForm.reset();
        this.checkInDetails.classList.add('d-none');
    }

    /**
     * Find booking for check-in
     */
    findBookingForCheckIn() {
        const bookingId = document.getElementById('check-in-booking-id').value;
        const guestName = document.getElementById('guest-name').value;
        
        if (!bookingId && !guestName) {
            alert('Please enter a booking reference or guest name');
            return;
        }
        
        // In a real application, we would search by both booking ID and guest name
        // For the MVP, we'll just use booking ID
        const booking = this.controller.getBookingById(bookingId);
        
        if (!booking) {
            alert('Booking not found. Please check the reference number and try again.');
            return;
        }
        
        if (booking.status !== 'reserved') {
            alert(`This booking cannot be checked in (current status: ${booking.status})`);
            return;
        }
        
        // Display booking details for check-in
        this.displayCheckInDetails(booking);
    }

    /**
     * Display booking details for check-in
     * @param {Booking} booking Booking to check in
     */
    displayCheckInDetails(booking) {
        const room = this.controller.getRoomByNumber(booking.roomNumber);
        
        // Format check-in and check-out dates
        const checkInDate = new Date(booking.checkInDate);
        const checkOutDate = new Date(booking.checkOutDate);
        
        const formattedCheckIn = checkInDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const formattedCheckOut = checkOutDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Get room type
        const roomType = room ? (room.type.charAt(0).toUpperCase() + room.type.slice(1)) : 'Unknown';
        
        this.checkInDetails.innerHTML = `
            <div class="alert alert-info" role="alert">
                <h5 class="alert-heading">Booking Found</h5>
                <p>Please verify the details below with the guest before proceeding.</p>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Booking Reference:</strong> ${booking.id}</p>
                            <p><strong>Room Number:</strong> ${booking.roomNumber}</p>
                            <p><strong>Room Type:</strong> ${roomType}</p>
                            <p><strong>Guest ID:</strong> ${booking.guestId}</p>
                            <p><strong>Number of Guests:</strong> ${booking.guests}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Check-in Date:</strong> ${formattedCheckIn}</p>
                            <p><strong>Check-out Date:</strong> ${formattedCheckOut}</p>
                            <p><strong>Number of Nights:</strong> ${booking.calculateNights()}</p>
                            <p><strong>Total Price:</strong> $${booking.totalPrice.toFixed(2)}</p>
                            <p><strong>Special Requests:</strong> ${booking.specialRequests || 'None'}</p>
                        </div>
                    </div>
                    
                    <div class="row mt-3">
                        <div class="col-12">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="id-verified" required>
                                <label class="form-check-label" for="id-verified">
                                    I have verified the guest's ID
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="payment-verified" required>
                                <label class="form-check-label" for="payment-verified">
                                    I have verified the payment details
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mt-3">
                        <div class="col-12">
                            <button id="confirm-check-in-btn" class="btn btn-success" data-booking-id="${booking.id}">Confirm Check-in</button>
                            <button id="cancel-check-in-btn" class="btn btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Show details section
        this.checkInDetails.classList.remove('d-none');
        
        // Add event listeners to buttons
        document.getElementById('confirm-check-in-btn').addEventListener('click', (e) => {
            const bookingId = e.target.getAttribute('data-booking-id');
            this.confirmCheckIn(bookingId);
        });
        
        document.getElementById('cancel-check-in-btn').addEventListener('click', () => {
            this.checkInDetails.classList.add('d-none');
        });
    }

    /**
     * Confirm guest check-in
     * @param {string} bookingId Booking ID to check in
     */
    confirmCheckIn(bookingId) {
        const idVerified = document.getElementById('id-verified').checked;
        const paymentVerified = document.getElementById('payment-verified').checked;
        
        if (!idVerified || !paymentVerified) {
            alert('Please verify guest ID and payment details before check-in');
            return;
        }
        
        try {
            // Call controller to check in the guest
            const booking = this.controller.checkIn(bookingId);
            
            // Show success message
            alert(`Check-in successful! Guest is now checked in to Room ${booking.roomNumber}`);
            
            // Reset view
            this.checkInDetails.classList.add('d-none');
            this.checkInForm.reset();
        } catch (error) {
            alert(`Error during check-in: ${error.message}`);
        }
    }

    /**
     * Show check-out view
     */
    showCheckOut() {
        // Hide other containers
        this.checkInContainer.classList.add('d-none');
        this.manageBookingsContainer.classList.add('d-none');
        this.receptionistMaintenanceContainer.classList.add('d-none');
        
        // Show check-out container
        this.checkOutContainer.classList.remove('d-none');
        
        // Reset form and hide details
        this.checkOutForm.reset();
        this.checkOutDetails.classList.add('d-none');
    }

    /**
     * Find booking for check-out
     */
    findBookingForCheckOut() {
        const bookingId = document.getElementById('check-out-booking-id').value;
        const roomNumber = document.getElementById('check-out-room-number').value;
        
        if (!bookingId && !roomNumber) {
            alert('Please enter a booking reference or room number');
            return;
        }
        
        // Get booking by ID
        let booking = null;
        if (bookingId) {
            booking = this.controller.getBookingById(bookingId);
        } else if (roomNumber) {
            // Find booking by room number (assuming there's only one active booking per room)
            const bookings = this.controller.getAllBookings();
            booking = bookings.find(b => b.roomNumber === roomNumber && b.status === 'checked-in');
        }
        
        if (!booking) {
            alert('Booking not found. Please check the reference number or room number and try again.');
            return;
        }
        
        if (booking.status !== 'checked-in') {
            alert(`This booking cannot be checked out (current status: ${booking.status})`);
            return;
        }
        
        // Display booking details for check-out
        this.displayCheckOutDetails(booking);
    }

    /**
     * Display booking details for check-out
     * @param {Booking} booking Booking to check out
     */
    displayCheckOutDetails(booking) {
        const room = this.controller.getRoomByNumber(booking.roomNumber);
        
        // Format check-in and check-out dates
        const checkInDate = new Date(booking.checkInDate);
        const checkOutDate = new Date(booking.checkOutDate);
        
        const formattedCheckIn = checkInDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const formattedCheckOut = checkOutDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Get room type
        const roomType = room ? (room.type.charAt(0).toUpperCase() + room.type.slice(1)) : 'Unknown';
        
        this.checkOutDetails.innerHTML = `
            <div class="alert alert-info" role="alert">
                <h5 class="alert-heading">Booking Found</h5>
                <p>Please verify the details below and collect payment before proceeding.</p>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Booking Reference:</strong> ${booking.id}</p>
                            <p><strong>Room Number:</strong> ${booking.roomNumber}</p>
                            <p><strong>Room Type:</strong> ${roomType}</p>
                            <p><strong>Guest ID:</strong> ${booking.guestId}</p>
                            <p><strong>Number of Guests:</strong> ${booking.guests}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Check-in Date:</strong> ${formattedCheckIn}</p>
                            <p><strong>Check-out Date:</strong> ${formattedCheckOut}</p>
                            <p><strong>Number of Nights:</strong> ${booking.calculateNights()}</p>
                            <p><strong>Total Price:</strong> $${booking.totalPrice.toFixed(2)}</p>
                            <p><strong>Payment Status:</strong> ${booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}</p>
                        </div>
                    </div>
                    
                    <div class="row mt-3">
                        <div class="col-12">
                            <h6>Payment Information</h6>
                            <div class="form-group mb-3">
                                <label for="payment-method">Payment Method</label>
                                <select class="form-select" id="payment-method" required>
                                    <option value="">Select Payment Method</option>
                                    <option value="credit-card">Credit Card</option>
                                    <option value="debit-card">Debit Card</option>
                                    <option value="cash">Cash</option>
                                    <option value="bank-transfer">Bank Transfer</option>
                                </select>
                            </div>
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="room-checked" required>
                                <label class="form-check-label" for="room-checked">
                                    I have verified the room condition
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row mt-3">
                        <div class="col-12">
                            <button id="confirm-check-out-btn" class="btn btn-success" data-booking-id="${booking.id}">Complete Check-out</button>
                            <button id="cancel-check-out-btn" class="btn btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Show details section
        this.checkOutDetails.classList.remove('d-none');
        
        // Add event listeners to buttons
        document.getElementById('confirm-check-out-btn').addEventListener('click', (e) => {
            const bookingId = e.target.getAttribute('data-booking-id');
            this.confirmCheckOut(bookingId);
        });
        
        document.getElementById('cancel-check-out-btn').addEventListener('click', () => {
            this.checkOutDetails.classList.add('d-none');
        });
    }

    /**
     * Confirm guest check-out
     * @param {string} bookingId Booking ID to check out
     */
    confirmCheckOut(bookingId) {
        const paymentMethod = document.getElementById('payment-method').value;
        const roomChecked = document.getElementById('room-checked').checked;
        
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }
        
        if (!roomChecked) {
            alert('Please verify the room condition before check-out');
            return;
        }
        
        try {
            // Call controller to check out the guest
            const booking = this.controller.checkOut(bookingId, paymentMethod);
            
            // Show success message
            alert(`Check-out successful! Room ${booking.roomNumber} is now available.`);
            
            // Reset view
            this.checkOutDetails.classList.add('d-none');
            this.checkOutForm.reset();
        } catch (error) {
            alert(`Error during check-out: ${error.message}`);
        }
    }

    /**
     * Show manage bookings view
     */
    showManageBookings() {
        // Hide other containers
        this.checkInContainer.classList.add('d-none');
        this.checkOutContainer.classList.add('d-none');
        this.receptionistMaintenanceContainer.classList.add('d-none');
        
        // Show manage bookings container
        this.manageBookingsContainer.classList.remove('d-none');
        
        // Display all bookings
        this.displayAllBookings();
    }

    /**
     * Display all bookings
     */
    displayAllBookings() {
        const bookings = this.controller.getAllBookings();
        
        // Sort bookings by check-in date (most recent first)
        bookings.sort((a, b) => new Date(b.checkInDate) - new Date(a.checkInDate));
        
        if (bookings.length === 0) {
            this.bookingsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No bookings found</td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        
        bookings.forEach(booking => {
            const checkInDate = new Date(booking.checkInDate);
            const checkOutDate = new Date(booking.checkOutDate);
            
            const formattedCheckIn = checkInDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            
            const formattedCheckOut = checkOutDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            
            let statusBadge = '';
            let actions = '';
            
            switch (booking.status) {
                case 'reserved':
                    statusBadge = '<span class="badge bg-primary">Reserved</span>';
                    actions = `
                        <button class="btn btn-sm btn-success me-1 check-in-action" data-booking-id="${booking.id}">Check In</button>
                        <button class="btn btn-sm btn-warning me-1 modify-booking" data-booking-id="${booking.id}">Modify</button>
                        <button class="btn btn-sm btn-danger cancel-booking" data-booking-id="${booking.id}">Cancel</button>
                    `;
                    break;
                case 'checked-in':
                    statusBadge = '<span class="badge bg-success">Checked In</span>';
                    actions = `
                        <button class="btn btn-sm btn-info me-1 check-out-action" data-booking-id="${booking.id}">Check Out</button>
                        <button class="btn btn-sm btn-warning modify-booking" data-booking-id="${booking.id}">Modify</button>
                    `;
                    break;
                case 'checked-out':
                    statusBadge = '<span class="badge bg-secondary">Checked Out</span>';
                    actions = `
                        <button class="btn btn-sm btn-primary view-booking" data-booking-id="${booking.id}">View</button>
                    `;
                    break;
                case 'cancelled':
                    statusBadge = '<span class="badge bg-danger">Cancelled</span>';
                    actions = `
                        <button class="btn btn-sm btn-primary view-booking" data-booking-id="${booking.id}">View</button>
                    `;
                    break;
            }
            
            html += `
                <tr>
                    <td>${booking.id}</td>
                    <td>${booking.guestId}</td>
                    <td>${booking.roomNumber}</td>
                    <td>${formattedCheckIn}</td>
                    <td>${formattedCheckOut}</td>
                    <td>${statusBadge}</td>
                    <td>${actions}</td>
                </tr>
            `;
        });
        
        this.bookingsTableBody.innerHTML = html;
        
        // Add event listeners to action buttons
        document.querySelectorAll('.check-in-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookingId = e.target.getAttribute('data-booking-id');
                // Pre-fill the check-in form
                document.getElementById('check-in-booking-id').value = bookingId;
                this.showCheckIn();
                this.findBookingForCheckIn();
            });
        });
        
        document.querySelectorAll('.check-out-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookingId = e.target.getAttribute('data-booking-id');
                // Pre-fill the check-out form
                document.getElementById('check-out-booking-id').value = bookingId;
                this.showCheckOut();
                this.findBookingForCheckOut();
            });
        });
        
        document.querySelectorAll('.modify-booking').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookingId = e.target.getAttribute('data-booking-id');
                this.showModifyBookingModal(bookingId);
            });
        });
        
        document.querySelectorAll('.cancel-booking').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookingId = e.target.getAttribute('data-booking-id');
                this.handleCancelBooking(bookingId);
            });
        });
        
        document.querySelectorAll('.view-booking').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookingId = e.target.getAttribute('data-booking-id');
                this.showBookingDetails(bookingId);
            });
        });
    }

    /**
     * Show booking modification modal
     * @param {string} bookingId Booking ID to modify
     */
    showModifyBookingModal(bookingId) {
        // In a real application, we would show a modal to modify the booking
        // For the MVP, we'll just show an alert
        alert(`Modify booking ${bookingId} - This feature would open a modal to modify the booking`);
    }

    /**
     * Show booking details
     * @param {string} bookingId Booking ID to view
     */
    showBookingDetails(bookingId) {
        // In a real application, we would show a modal with booking details
        // For the MVP, we'll just show an alert
        alert(`View booking ${bookingId} - This feature would open a modal with detailed booking information`);
    }

    /**
     * Handle booking cancellation
     * @param {string} bookingId Booking ID to cancel
     */
    handleCancelBooking(bookingId) {
        if (confirm('Are you sure you want to cancel this booking?')) {
            try {
                // Call controller to cancel booking
                this.controller.cancelBooking(bookingId);
                
                // Show success message
                alert('Booking cancelled successfully');
                
                // Refresh bookings display
                this.displayAllBookings();
            } catch (error) {
                alert(`Error cancelling booking: ${error.message}`);
            }
        }
    }

    /**
     * Search bookings
     * @param {string} query Search query
     */
    searchBookings(query) {
        if (!query) {
            this.displayAllBookings();
            return;
        }
        
        const bookings = this.controller.getAllBookings();
        const filteredBookings = bookings.filter(booking => {
            return (
                booking.id.toLowerCase().includes(query.toLowerCase()) ||
                booking.guestId.toLowerCase().includes(query.toLowerCase()) ||
                booking.roomNumber.toLowerCase().includes(query.toLowerCase())
            );
        });
        
        // Update the table with filtered bookings
        if (filteredBookings.length === 0) {
            this.bookingsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No bookings found matching "${query}"</td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        
        filteredBookings.forEach(booking => {
            const checkInDate = new Date(booking.checkInDate);
            const checkOutDate = new Date(booking.checkOutDate);
            
            const formattedCheckIn = checkInDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            
            const formattedCheckOut = checkOutDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            
            let statusBadge = '';
            let actions = '';
            
            switch (booking.status) {
                case 'reserved':
                    statusBadge = '<span class="badge bg-primary">Reserved</span>';
                    actions = `
                        <button class="btn btn-sm btn-success me-1 check-in-action" data-booking-id="${booking.id}">Check In</button>
                        <button class="btn btn-sm btn-warning me-1 modify-booking" data-booking-id="${booking.id}">Modify</button>
                        <button class="btn btn-sm btn-danger cancel-booking" data-booking-id="${booking.id}">Cancel</button>
                    `;
                    break;
                case 'checked-in':
                    statusBadge = '<span class="badge bg-success">Checked In</span>';
                    actions = `
                        <button class="btn btn-sm btn-info me-1 check-out-action" data-booking-id="${booking.id}">Check Out</button>
                        <button class="btn btn-sm btn-warning modify-booking" data-booking-id="${booking.id}">Modify</button>
                    `;
                    break;
                case 'checked-out':
                    statusBadge = '<span class="badge bg-secondary">Checked Out</span>';
                    actions = `
                        <button class="btn btn-sm btn-primary view-booking" data-booking-id="${booking.id}">View</button>
                    `;
                    break;
                case 'cancelled':
                    statusBadge = '<span class="badge bg-danger">Cancelled</span>';
                    actions = `
                        <button class="btn btn-sm btn-primary view-booking" data-booking-id="${booking.id}">View</button>
                    `;
                    break;
            }
            
            html += `
                <tr>
                    <td>${booking.id}</td>
                    <td>${booking.guestId}</td>
                    <td>${booking.roomNumber}</td>
                    <td>${formattedCheckIn}</td>
                    <td>${formattedCheckOut}</td>
                    <td>${statusBadge}</td>
                    <td>${actions}</td>
                </tr>
            `;
        });
        
        this.bookingsTableBody.innerHTML = html;
        
        // Re-attach event listeners (same as in displayAllBookings)
        document.querySelectorAll('.check-in-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookingId = e.target.getAttribute('data-booking-id');
                // Pre-fill the check-in form
                document.getElementById('check-in-booking-id').value = bookingId;
                this.showCheckIn();
                this.findBookingForCheckIn();
            });
        });
        
        // Attach other event listeners as well...
        // (Same as in displayAllBookings)
    }

    /**
     * Show maintenance requests view
     */
    showMaintenanceRequests() {
        // Hide other containers
        this.checkInContainer.classList.add('d-none');
        this.checkOutContainer.classList.add('d-none');
        this.manageBookingsContainer.classList.add('d-none');
        
        // Show maintenance container
        this.receptionistMaintenanceContainer.classList.remove('d-none');
        
        // Display maintenance requests
        this.displayMaintenanceRequests();
    }

    /**
     * Display maintenance requests
     */
    displayMaintenanceRequests() {
        const requests = this.controller.getAllMaintenanceRequests();
        
        // Sort by status priority (open first, then in-progress, then completed)
        const statusPriority = { 'open': 0, 'in-progress': 1, 'completed': 2 };
        requests.sort((a, b) => {
            if (statusPriority[a.status] !== statusPriority[b.status]) {
                return statusPriority[a.status] - statusPriority[b.status];
            }
            
            // If same status, sort by reported date (most recent first)
            return new Date(b.reportedOn) - new Date(a.reportedOn);
        });
        
        if (requests.length === 0) {
            this.receptionistMaintenanceTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No maintenance requests found</td>
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
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            let statusBadge = '';
            
            switch (request.status) {
                case 'open':
                    statusBadge = '<span class="badge bg-danger">Open</span>';
                    break;
                case 'in-progress':
                    statusBadge = '<span class="badge bg-warning">In Progress</span>';
                    break;
                case 'completed':
                    statusBadge = '<span class="badge bg-success">Completed</span>';
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
                    <td>${request.description.substring(0, 50)}${request.description.length > 50 ? '...' : ''}</td>
                    <td>${statusBadge}</td>
                    <td class="${priorityClass}">${request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}</td>
                    <td>${formattedReportedDate}</td>
                </tr>
            `;
        });
        
        this.receptionistMaintenanceTableBody.innerHTML = html;
    }
}
