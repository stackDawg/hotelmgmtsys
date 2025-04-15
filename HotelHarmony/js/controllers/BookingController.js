/**
 * BookingController
 * Implements MVC pattern - handles booking-related operations
 * Follows Single Responsibility Principle by handling only booking-related functionality
 */
class BookingController {
    constructor(databaseService, paymentService) {
        // Dependency injection
        this.databaseService = databaseService;
        this.paymentService = paymentService;
        
        // Observer pattern
        this.observer = Observer.getInstance();
    }

    /**
     * Create a new booking
     * @param {Object} bookingData Booking data
     * @returns {Booking} Newly created booking
     */
    createBooking(bookingData) {
        const { guestId, roomNumber, checkInDate, checkOutDate, guests, specialRequests } = bookingData;
        
        // Validate dates
        const startDate = new Date(checkInDate);
        const endDate = new Date(checkOutDate);
        
        if (startDate >= endDate) {
            throw new Error('Check-out date must be after check-in date');
        }
        
        // Check if room exists
        const room = this.databaseService.getRoomByNumber(roomNumber);
        if (!room) {
            throw new Error(`Room ${roomNumber} not found`);
        }
        
        // Check if room is available for the dates
        if (!room.isAvailable()) {
            throw new Error(`Room ${roomNumber} is not available`);
        }
        
        // Check for date conflicts with existing bookings
        const existingBookings = this.databaseService.getAllBookings().filter(
            booking => booking.roomNumber === roomNumber && booking.status !== 'cancelled' && booking.status !== 'checked-out'
        );
        
        for (const booking of existingBookings) {
            if (booking.overlapsWith(startDate, endDate)) {
                throw new Error(`Room ${roomNumber} is already booked for the selected dates`);
            }
        }
        
        // Calculate nights and total price
        const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
        const nights = Math.round(Math.abs((endDate - startDate) / oneDay));
        const totalPrice = nights * room.pricePerNight;
        
        // Create a unique booking ID
        const bookingId = `BK${Date.now().toString().slice(-6)}`;
        
        // Create booking object
        const booking = new Booking(
            bookingId,
            guestId,
            roomNumber,
            startDate,
            endDate,
            guests,
            totalPrice
        );
        
        // Add special requests if provided
        if (specialRequests) {
            booking.addSpecialRequests(specialRequests);
        }
        
        // Save to database
        this.databaseService.saveBooking(booking);
        
        // Update room status to reserved
        room.updateStatus('reserved');
        this.databaseService.saveRoom(room);
        
        // Notify observers
        this.observer.notify('bookingCreated', booking);
        
        return booking;
    }

    /**
     * Get all bookings
     * @returns {Array} List of all bookings
     */
    getAllBookings() {
        return this.databaseService.getAllBookings();
    }

    /**
     * Get a booking by ID
     * @param {string} bookingId Booking ID
     * @returns {Booking|null} Booking object or null if not found
     */
    getBookingById(bookingId) {
        return this.databaseService.getBookingById(bookingId);
    }

    /**
     * Get bookings for a specific guest
     * @param {string} guestId Guest ID
     * @returns {Array} List of bookings for the guest
     */
    getBookingsByGuest(guestId) {
        const bookings = this.databaseService.getAllBookings();
        return bookings.filter(booking => booking.guestId === guestId);
    }

    /**
     * Get bookings for a specific room
     * @param {string} roomNumber Room number
     * @returns {Array} List of bookings for the room
     */
    getBookingsByRoom(roomNumber) {
        const bookings = this.databaseService.getAllBookings();
        return bookings.filter(booking => booking.roomNumber === roomNumber);
    }

    /**
     * Get active bookings (reserved or checked-in)
     * @returns {Array} List of active bookings
     */
    getActiveBookings() {
        const bookings = this.databaseService.getAllBookings();
        return bookings.filter(booking => 
            booking.status === 'reserved' || booking.status === 'checked-in'
        );
    }

    /**
     * Update a booking
     * @param {string} bookingId Booking ID
     * @param {Object} updates Updates to apply
     * @returns {Booking} Updated booking
     */
    updateBooking(bookingId, updates) {
        // Get existing booking
        const booking = this.databaseService.getBookingById(bookingId);
        if (!booking) {
            throw new Error(`Booking ${bookingId} not found`);
        }
        
        const originalRoomNumber = booking.roomNumber;
        
        // Apply updates
        if (updates.specialRequests !== undefined) {
            booking.addSpecialRequests(updates.specialRequests);
        }
        
        if (updates.notes !== undefined) {
            booking.addNotes(updates.notes);
        }
        
        // Handle room change
        if (updates.roomNumber && updates.roomNumber !== originalRoomNumber) {
            // Check if new room exists
            const newRoom = this.databaseService.getRoomByNumber(updates.roomNumber);
            if (!newRoom) {
                throw new Error(`Room ${updates.roomNumber} not found`);
            }
            
            // Check if new room is available
            if (!newRoom.isAvailable()) {
                throw new Error(`Room ${updates.roomNumber} is not available`);
            }
            
            // Update room number
            booking.roomNumber = updates.roomNumber;
            
            // Update room statuses
            const oldRoom = this.databaseService.getRoomByNumber(originalRoomNumber);
            if (oldRoom) {
                oldRoom.updateStatus('available');
                this.databaseService.saveRoom(oldRoom);
            }
            
            newRoom.updateStatus('reserved');
            this.databaseService.saveRoom(newRoom);
        }
        
        // Handle date changes
        if (updates.checkInDate || updates.checkOutDate) {
            const newCheckInDate = updates.checkInDate ? new Date(updates.checkInDate) : booking.checkInDate;
            const newCheckOutDate = updates.checkOutDate ? new Date(updates.checkOutDate) : booking.checkOutDate;
            
            // Validate dates
            if (newCheckInDate >= newCheckOutDate) {
                throw new Error('Check-out date must be after check-in date');
            }
            
            // Check for conflicts with other bookings
            const roomNumber = updates.roomNumber || booking.roomNumber;
            const existingBookings = this.databaseService.getAllBookings().filter(
                b => b.id !== bookingId && b.roomNumber === roomNumber && b.status !== 'cancelled' && b.status !== 'checked-out'
            );
            
            for (const b of existingBookings) {
                if (b.overlapsWith(newCheckInDate, newCheckOutDate)) {
                    throw new Error(`Room ${roomNumber} is already booked for the selected dates`);
                }
            }
            
            // Update dates
            booking.checkInDate = newCheckInDate;
            booking.checkOutDate = newCheckOutDate;
            
            // Recalculate total price
            const room = this.databaseService.getRoomByNumber(roomNumber);
            const oneDay = 24 * 60 * 60 * 1000;
            const nights = Math.round(Math.abs((newCheckOutDate - newCheckInDate) / oneDay));
            booking.totalPrice = nights * room.pricePerNight;
        }
        
        if (updates.guests) {
            booking.guests = parseInt(updates.guests);
        }
        
        // Save updated booking
        this.databaseService.saveBooking(booking);
        
        // Notify observers
        this.observer.notify('bookingUpdated', booking);
        
        return booking;
    }

    /**
     * Cancel a booking
     * @param {string} bookingId Booking ID
     * @returns {boolean} Whether cancellation was successful
     */
    cancelBooking(bookingId) {
        // Get existing booking
        const booking = this.databaseService.getBookingById(bookingId);
        if (!booking) {
            throw new Error(`Booking ${bookingId} not found`);
        }
        
        // Check if booking can be cancelled
        if (!booking.canBeCancelled()) {
            throw new Error('This booking cannot be cancelled');
        }
        
        // Update booking status
        booking.updateStatus('cancelled');
        
        // Update room status
        const room = this.databaseService.getRoomByNumber(booking.roomNumber);
        if (room) {
            room.updateStatus('available');
            this.databaseService.saveRoom(room);
        }
        
        // Save updated booking
        this.databaseService.saveBooking(booking);
        
        // Notify observers
        this.observer.notify('bookingCancelled', booking);
        
        return true;
    }

    /**
     * Check in a guest
     * @param {string} bookingId Booking ID
     * @returns {Booking} Updated booking
     */
    checkIn(bookingId) {
        // Get existing booking
        const booking = this.databaseService.getBookingById(bookingId);
        if (!booking) {
            throw new Error(`Booking ${bookingId} not found`);
        }
        
        // Check if booking status allows check-in
        if (booking.status !== 'reserved') {
            throw new Error(`Cannot check in booking with status ${booking.status}`);
        }
        
        // Update booking status
        booking.updateStatus('checked-in');
        
        // Update room status
        const room = this.databaseService.getRoomByNumber(booking.roomNumber);
        if (room) {
            room.updateStatus('occupied');
            this.databaseService.saveRoom(room);
        }
        
        // Save updated booking
        this.databaseService.saveBooking(booking);
        
        // Notify observers
        this.observer.notify('guestCheckedIn', booking);
        
        return booking;
    }

    /**
     * Check out a guest
     * @param {string} bookingId Booking ID
     * @param {string} paymentMethod Payment method
     * @returns {Booking} Updated booking
     */
    checkOut(bookingId, paymentMethod) {
        // Get existing booking
        const booking = this.databaseService.getBookingById(bookingId);
        if (!booking) {
            throw new Error(`Booking ${bookingId} not found`);
        }
        
        // Check if booking status allows check-out
        if (booking.status !== 'checked-in') {
            throw new Error(`Cannot check out booking with status ${booking.status}`);
        }
        
        // Process payment
        const paymentResult = this.paymentService.processPayment(
            bookingId,
            booking.totalPrice,
            paymentMethod
        );
        
        if (paymentResult.success) {
            // Update booking status
            booking.updateStatus('checked-out');
            booking.processPayment(paymentMethod, booking.totalPrice);
            
            // Update room status
            const room = this.databaseService.getRoomByNumber(booking.roomNumber);
            if (room) {
                room.updateStatus('available');
                this.databaseService.saveRoom(room);
            }
            
            // Save updated booking
            this.databaseService.saveBooking(booking);
            
            // Notify observers
            this.observer.notify('guestCheckedOut', booking);
            
            return booking;
        } else {
            throw new Error(`Payment failed: ${paymentResult.message}`);
        }
    }

    /**
     * Get active bookings for today's check-ins
     * @returns {Array} List of bookings checking in today
     */
    getTodaysCheckIns() {
        const bookings = this.databaseService.getAllBookings();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return bookings.filter(booking => {
            const checkInDate = new Date(booking.checkInDate);
            checkInDate.setHours(0, 0, 0, 0);
            
            return (
                booking.status === 'reserved' &&
                checkInDate.getTime() === today.getTime()
            );
        });
    }

    /**
     * Get active bookings for today's check-outs
     * @returns {Array} List of bookings checking out today
     */
    getTodaysCheckOuts() {
        const bookings = this.databaseService.getAllBookings();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return bookings.filter(booking => {
            const checkOutDate = new Date(booking.checkOutDate);
            checkOutDate.setHours(0, 0, 0, 0);
            
            return (
                booking.status === 'checked-in' &&
                checkOutDate.getTime() === today.getTime()
            );
        });
    }

    /**
     * Search bookings with various criteria
     * @param {Object} criteria Search criteria
     * @returns {Array} List of matching bookings
     */
    searchBookings(criteria) {
        let bookings = this.databaseService.getAllBookings();
        
        // Filter by guest name or ID
        if (criteria.guestId) {
            bookings = bookings.filter(booking => booking.guestId === criteria.guestId);
        }
        
        // Filter by room number
        if (criteria.roomNumber) {
            bookings = bookings.filter(booking => booking.roomNumber === criteria.roomNumber);
        }
        
        // Filter by status
        if (criteria.status) {
            bookings = bookings.filter(booking => booking.status === criteria.status);
        }
        
        // Filter by date range
        if (criteria.startDate && criteria.endDate) {
            const start = new Date(criteria.startDate);
            const end = new Date(criteria.endDate);
            
            bookings = bookings.filter(booking => {
                const checkIn = new Date(booking.checkInDate);
                return checkIn >= start && checkIn <= end;
            });
        }
        
        return bookings;
    }
}
