/**
 * GuestView
 * Implements MVC pattern - handles the presentation logic for guest functionality
 * Follows Single Responsibility Principle by focusing only on guest-related UI
 */
class GuestView {
    constructor(controller) {
        this.controller = controller;
        this.guestView = document.getElementById('guest-view');
        this.roomSearchForm = document.getElementById('room-search-form');
        this.availableRoomsContainer = document.getElementById('available-rooms-container');
        this.bookingDetailsContainer = document.getElementById('booking-details-container');
        this.bookingDetails = document.getElementById('booking-details');
        this.myBookingsContainer = document.getElementById('my-bookings-container');
        this.guestBookingsList = document.getElementById('guest-bookings-list');
        this.maintenanceRequestContainer = document.getElementById('maintenance-request-container');
        
        // Observer pattern - subscribe to relevant events
        this.observer = Observer.getInstance();
        this.observer.subscribe('navigationChange', this.handleNavigation.bind(this));
        
        this.registerEventListeners();
    }

    /**
     * Register event listeners for guest view
     */
    registerEventListeners() {
        // Room search form submission
        this.roomSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRoomSearch();
        });
        
        // Back to rooms button
        document.getElementById('back-to-rooms-btn').addEventListener('click', () => {
            this.bookingDetailsContainer.classList.add('d-none');
            this.availableRoomsContainer.classList.remove('d-none');
        });
        
        // Confirm booking button
        document.getElementById('confirm-booking-btn').addEventListener('click', () => {
            this.handleBookingConfirmation();
        });
        
        // Maintenance request form submission
        document.getElementById('maintenance-request-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleMaintenanceRequest();
        });
    }

    /**
     * Handle navigation changes
     * @param {string} target Navigation target
     */
    handleNavigation(target) {
        if (target === 'guest-search') {
            this.showRoomSearch();
        } else if (target === 'guest-bookings') {
            this.showMyBookings();
        } else if (target === 'guest-report') {
            this.showMaintenanceRequestForm();
        }
    }

    /**
     * Show room search view
     */
    showRoomSearch() {
        // Hide other containers
        this.myBookingsContainer.classList.add('d-none');
        this.maintenanceRequestContainer.classList.add('d-none');
        this.bookingDetailsContainer.classList.add('d-none');
        
        // Show room search form and available rooms
        this.availableRoomsContainer.classList.remove('d-none');
        
        // Reset form if needed
        this.roomSearchForm.reset();
        
        // Set minimum dates for check-in and check-out
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('check-in-date').min = today;
        document.getElementById('check-out-date').min = today;
    }

    /**
     * Handle room search form submission
     */
    handleRoomSearch() {
        const checkInDate = document.getElementById('check-in-date').value;
        const checkOutDate = document.getElementById('check-out-date').value;
        const guests = document.getElementById('guests').value;
        const roomType = document.getElementById('room-type').value;
        
        // Validate dates
        if (new Date(checkInDate) >= new Date(checkOutDate)) {
            alert('Check-out date must be after check-in date');
            return;
        }
        
        // Call controller to search for available rooms
        const criteria = { checkInDate, checkOutDate, guests, roomType };
        const availableRooms = this.controller.searchAvailableRooms(criteria);
        
        // Store search criteria for later use in booking
        this.currentSearchCriteria = criteria;
        
        // Display available rooms
        this.displayAvailableRooms(availableRooms);
    }

    /**
     * Display available rooms
     * @param {Array} rooms Array of available rooms
     */
    displayAvailableRooms(rooms) {
        this.availableRoomsContainer.innerHTML = '';
        
        if (rooms.length === 0) {
            this.availableRoomsContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info" role="alert">
                        No rooms available matching your criteria. Please try different dates or room type.
                    </div>
                </div>
            `;
            return;
        }
        
        // Calculate nights for price calculation
        const checkInDate = new Date(this.currentSearchCriteria.checkInDate);
        const checkOutDate = new Date(this.currentSearchCriteria.checkOutDate);
        const oneDay = 24 * 60 * 60 * 1000;
        const nights = Math.round(Math.abs((checkOutDate - checkInDate) / oneDay));
        
        rooms.forEach(room => {
            const totalPrice = room.pricePerNight * nights;
            
            const roomCard = document.createElement('div');
            roomCard.className = 'col';
            roomCard.innerHTML = `
                <div class="card h-100 room-card">
                    <div class="card-body">
                        <h5 class="card-title">Room ${room.number} - ${room.type.charAt(0).toUpperCase() + room.type.slice(1)}</h5>
                        <p class="card-text">
                            <i class="fas fa-user-friends"></i> Max Guests: ${room.capacity}<br>
                            <i class="fas fa-list"></i> Features: ${room.getFeaturesString()}<br>
                        </p>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="room-price">$${room.pricePerNight}<small>/night</small></div>
                            <button class="btn btn-primary book-room-btn" data-room-number="${room.number}">Book Now</button>
                        </div>
                        <div class="mt-2 text-muted">
                            <small>Total for ${nights} night${nights !== 1 ? 's' : ''}: $${totalPrice}</small>
                        </div>
                    </div>
                </div>
            `;
            
            this.availableRoomsContainer.appendChild(roomCard);
            
            // Add event listener to book button
            const bookBtn = roomCard.querySelector('.book-room-btn');
            bookBtn.addEventListener('click', () => {
                this.showBookingDetails(room, nights, totalPrice);
            });
        });
    }

    /**
     * Show booking details for a selected room
     * @param {Room} room Selected room
     * @param {number} nights Number of nights
     * @param {number} totalPrice Total price for the stay
     */
    showBookingDetails(room, nights, totalPrice) {
        // Hide available rooms container
        this.availableRoomsContainer.classList.add('d-none');
        
        // Show booking details container
        this.bookingDetailsContainer.classList.remove('d-none');
        
        // Format dates for display
        const checkInDate = new Date(this.currentSearchCriteria.checkInDate);
        const checkOutDate = new Date(this.currentSearchCriteria.checkOutDate);
        
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
        
        // Set booking details content
        this.bookingDetails.innerHTML = `
            <div class="booking-details">
                <div class="row">
                    <div class="col-md-6">
                        <div class="booking-detail-label">Room:</div>
                        <div class="booking-detail-value">Room ${room.number} - ${room.type.charAt(0).toUpperCase() + room.type.slice(1)}</div>
                        
                        <div class="booking-detail-label">Check-in Date:</div>
                        <div class="booking-detail-value">${formattedCheckIn}</div>
                        
                        <div class="booking-detail-label">Check-out Date:</div>
                        <div class="booking-detail-value">${formattedCheckOut}</div>
                        
                        <div class="booking-detail-label">Number of Nights:</div>
                        <div class="booking-detail-value">${nights}</div>
                    </div>
                    <div class="col-md-6">
                        <div class="booking-detail-label">Rate per Night:</div>
                        <div class="booking-detail-value">$${room.pricePerNight.toFixed(2)}</div>
                        
                        <div class="booking-detail-label">Number of Guests:</div>
                        <div class="booking-detail-value">${this.currentSearchCriteria.guests}</div>
                        
                        <div class="booking-detail-label">Total Price:</div>
                        <div class="booking-detail-value fw-bold">$${totalPrice.toFixed(2)}</div>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-12">
                        <div class="booking-detail-label">Special Requests:</div>
                        <textarea id="special-requests" class="form-control" rows="3" placeholder="Enter any special requests or requirements"></textarea>
                    </div>
                </div>
            </div>
        `;
        
        // Store selected room for booking confirmation
        this.selectedRoom = room;
        this.totalPrice = totalPrice;
    }

    /**
     * Handle booking confirmation
     */
    handleBookingConfirmation() {
        // Get current user
        const currentUser = this.controller.getCurrentUser();
        
        if (!currentUser) {
            alert('You must be logged in to book a room');
            return;
        }
        
        // Get special requests
        const specialRequests = document.getElementById('special-requests').value;
        
        // Create booking data
        const bookingData = {
            guestId: currentUser.id,
            roomNumber: this.selectedRoom.number,
            checkInDate: this.currentSearchCriteria.checkInDate,
            checkOutDate: this.currentSearchCriteria.checkOutDate,
            guests: parseInt(this.currentSearchCriteria.guests),
            specialRequests: specialRequests,
            totalPrice: this.totalPrice
        };
        
        try {
            // Call controller to create booking
            const booking = this.controller.createBooking(bookingData);
            
            // Show success message
            alert(`Booking confirmed! Your booking reference is: ${booking.id}`);
            
            // Show my bookings view
            this.showMyBookings();
        } catch (error) {
            alert(`Error creating booking: ${error.message}`);
        }
    }

    /**
     * Show my bookings view
     */
    showMyBookings() {
        // Hide other containers
        this.availableRoomsContainer.classList.add('d-none');
        this.bookingDetailsContainer.classList.add('d-none');
        this.maintenanceRequestContainer.classList.add('d-none');
        
        // Show my bookings container
        this.myBookingsContainer.classList.remove('d-none');
        
        // Get current user
        const currentUser = this.controller.getCurrentUser();
        
        if (!currentUser) {
            this.guestBookingsList.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    You must be logged in to view your bookings.
                </div>
            `;
            return;
        }
        
        // Get bookings for current user
        const bookings = this.controller.getBookingsByGuest(currentUser.id);
        
        // Display bookings
        this.displayMyBookings(bookings);
    }

    /**
     * Display user's bookings
     * @param {Array} bookings Array of user's bookings
     */
    displayMyBookings(bookings) {
        if (bookings.length === 0) {
            this.guestBookingsList.innerHTML = `
                <div class="alert alert-info" role="alert">
                    You don't have any bookings yet. <a href="#" id="start-booking-link">Book a room now</a>.
                </div>
            `;
            
            // Add event listener to booking link
            document.getElementById('start-booking-link').addEventListener('click', (e) => {
                e.preventDefault();
                this.showRoomSearch();
            });
            
            return;
        }
        
        // Sort bookings by check-in date (most recent first)
        bookings.sort((a, b) => new Date(b.checkInDate) - new Date(a.checkInDate));
        
        let html = `
            <div class="accordion" id="bookingsAccordion">
        `;
        
        bookings.forEach((booking, index) => {
            const room = this.controller.getRoomByNumber(booking.roomNumber);
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
            switch (booking.status) {
                case 'reserved':
                    statusBadge = '<span class="badge bg-primary">Reserved</span>';
                    break;
                case 'checked-in':
                    statusBadge = '<span class="badge bg-success">Checked In</span>';
                    break;
                case 'checked-out':
                    statusBadge = '<span class="badge bg-secondary">Checked Out</span>';
                    break;
                case 'cancelled':
                    statusBadge = '<span class="badge bg-danger">Cancelled</span>';
                    break;
            }
            
            html += `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="heading${index}">
                        <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse${index}">
                            <div class="d-flex w-100 justify-content-between align-items-center">
                                <div>
                                    <strong>Room ${booking.roomNumber}</strong> - ${formattedCheckIn} to ${formattedCheckOut}
                                </div>
                                <div>
                                    ${statusBadge}
                                </div>
                            </div>
                        </button>
                    </h2>
                    <div id="collapse${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="heading${index}" data-bs-parent="#bookingsAccordion">
                        <div class="accordion-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>Booking Reference:</strong> ${booking.id}</p>
                                    <p><strong>Room Type:</strong> ${room ? room.type.charAt(0).toUpperCase() + room.type.slice(1) : 'N/A'}</p>
                                    <p><strong>Check-in:</strong> ${formattedCheckIn}</p>
                                    <p><strong>Check-out:</strong> ${formattedCheckOut}</p>
                                    <p><strong>Guests:</strong> ${booking.guests}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Total Price:</strong> $${booking.totalPrice.toFixed(2)}</p>
                                    <p><strong>Payment Status:</strong> ${booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}</p>
                                    <p><strong>Special Requests:</strong> ${booking.specialRequests || 'None'}</p>
                                    <p><strong>Status:</strong> ${statusBadge}</p>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="col-12">
                                    ${booking.status === 'reserved' ? 
                                        `<button class="btn btn-sm btn-warning me-2 cancel-booking-btn" data-booking-id="${booking.id}">Cancel Booking</button>` : ''}
                                    ${(booking.status === 'checked-in' || booking.status === 'reserved') ? 
                                        `<button class="btn btn-sm btn-primary report-issue-btn" data-booking-id="${booking.id}">Report Issue</button>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        
        this.guestBookingsList.innerHTML = html;
        
        // Add event listeners to cancel buttons
        document.querySelectorAll('.cancel-booking-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const bookingId = btn.getAttribute('data-booking-id');
                this.handleCancelBooking(bookingId);
            });
        });
        
        // Add event listeners to report issue buttons
        document.querySelectorAll('.report-issue-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const bookingId = btn.getAttribute('data-booking-id');
                this.showMaintenanceRequestForm(bookingId);
            });
        });
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
                this.showMyBookings();
            } catch (error) {
                alert(`Error cancelling booking: ${error.message}`);
            }
        }
    }

    /**
     * Show maintenance request form
     * @param {string} bookingId Optional booking ID to pre-select
     */
    showMaintenanceRequestForm(bookingId = null) {
        // Hide other containers
        this.availableRoomsContainer.classList.add('d-none');
        this.bookingDetailsContainer.classList.add('d-none');
        this.myBookingsContainer.classList.add('d-none');
        
        // Show maintenance request container
        this.maintenanceRequestContainer.classList.remove('d-none');
        
        // Get current user
        const currentUser = this.controller.getCurrentUser();
        
        if (!currentUser) {
            alert('You must be logged in to report maintenance issues');
            this.showRoomSearch();
            return;
        }
        
        // Get bookings for current user
        const bookings = this.controller.getBookingsByGuest(currentUser.id);
        
        // Filter active bookings (reserved or checked-in)
        const activeBookings = bookings.filter(booking => 
            booking.status === 'reserved' || booking.status === 'checked-in'
        );
        
        if (activeBookings.length === 0) {
            document.getElementById('maintenance-request-form').innerHTML = `
                <div class="alert alert-info" role="alert">
                    You don't have any active bookings. You need an active booking to report a maintenance issue.
                </div>
            `;
            return;
        }
        
        // Populate booking select
        const bookingSelect = document.getElementById('booking-id');
        bookingSelect.innerHTML = '<option value="">Select Booking</option>';
        
        activeBookings.forEach(booking => {
            const option = document.createElement('option');
            option.value = booking.id;
            option.textContent = `Room ${booking.roomNumber} - ${new Date(booking.checkInDate).toLocaleDateString()} to ${new Date(booking.checkOutDate).toLocaleDateString()}`;
            
            // Pre-select booking if provided
            if (bookingId && booking.id === bookingId) {
                option.selected = true;
            }
            
            bookingSelect.appendChild(option);
        });
        
        // Reset the rest of the form
        document.getElementById('issue-type').value = '';
        document.getElementById('issue-description').value = '';
        document.getElementById('issue-priority').value = 'medium';
    }

    /**
     * Handle maintenance request submission
     */
    handleMaintenanceRequest() {
        // Get current user
        const currentUser = this.controller.getCurrentUser();
        
        if (!currentUser) {
            alert('You must be logged in to report maintenance issues');
            return;
        }
        
        // Get form values
        const bookingId = document.getElementById('booking-id').value;
        const issueType = document.getElementById('issue-type').value;
        const description = document.getElementById('issue-description').value;
        const priority = document.getElementById('issue-priority').value;
        
        if (!bookingId || !issueType || !description) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Get booking to get room number
        const booking = this.controller.getBookingById(bookingId);
        
        if (!booking) {
            alert('Invalid booking selected');
            return;
        }
        
        // Create maintenance request data
        const requestData = {
            roomNumber: booking.roomNumber,
            issueType,
            description,
            reportedBy: currentUser.id,
            priority
        };
        
        try {
            // Call controller to create maintenance request
            const request = this.controller.createMaintenanceRequest(requestData);
            
            // Show success message
            alert(`Maintenance request submitted successfully. Reference number: ${request.id}`);
            
            // Reset form
            document.getElementById('maintenance-request-form').reset();
            
            // Show my bookings view
            this.showMyBookings();
        } catch (error) {
            alert(`Error submitting maintenance request: ${error.message}`);
        }
    }
}
