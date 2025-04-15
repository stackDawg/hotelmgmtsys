/**
 * Booking Model Class
 * Implements Single Responsibility Principle by handling only booking-related data and behaviors
 */
class Booking {
    constructor(id, guestId, roomNumber, checkInDate, checkOutDate, guests, totalPrice) {
        this.id = id;
        this.guestId = guestId;
        this.roomNumber = roomNumber;
        this.checkInDate = new Date(checkInDate);
        this.checkOutDate = new Date(checkOutDate);
        this.guests = guests;
        this.totalPrice = totalPrice;
        this.status = 'reserved'; // reserved, checked-in, checked-out, cancelled
        this.paymentStatus = 'pending'; // pending, partial, paid
        this.paymentMethod = null;
        this.createdAt = new Date();
        this.specialRequests = '';
        this.notes = '';
    }

    /**
     * Calculate the number of nights for this booking
     * @returns {number} Number of nights
     */
    calculateNights() {
        const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
        return Math.round(Math.abs((this.checkOutDate - this.checkInDate) / oneDay));
    }

    /**
     * Check if the booking dates overlap with another booking
     * @param {Date} startDate Start date to check
     * @param {Date} endDate End date to check
     * @returns {boolean} Whether dates overlap
     */
    overlapsWith(startDate, endDate) {
        // Ensure we're comparing Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Check if date ranges overlap
        return (
            (this.checkInDate <= end && this.checkOutDate >= start) ||
            (start <= this.checkOutDate && end >= this.checkInDate)
        );
    }

    /**
     * Check if a booking can be cancelled
     * @returns {boolean} Whether booking can be cancelled
     */
    canBeCancelled() {
        // Can't cancel if already checked in or checked out
        if (this.status === 'checked-in' || this.status === 'checked-out') {
            return false;
        }
        
        // Check cancellation policy - for example, can cancel up to 24 hours before check-in
        const now = new Date();
        const cancellationDeadline = new Date(this.checkInDate);
        cancellationDeadline.setHours(cancellationDeadline.getHours() - 24);
        
        return now <= cancellationDeadline;
    }

    /**
     * Update booking status
     * @param {string} status New booking status
     */
    updateStatus(status) {
        // Validate status transition
        const validTransitions = {
            'reserved': ['checked-in', 'cancelled'],
            'checked-in': ['checked-out'],
            'checked-out': [], // Terminal state, no transitions allowed
            'cancelled': [] // Terminal state, no transitions allowed
        };
        
        if (validTransitions[this.status].includes(status)) {
            this.status = status;
            
            if (status === 'checked-in') {
                this.checkInDate = new Date(); // Update with actual check-in time
            } else if (status === 'checked-out') {
                this.checkOutDate = new Date(); // Update with actual check-out time
            }
            
            return true;
        }
        
        return false;
    }

    /**
     * Process payment for the booking
     * @param {string} method Payment method
     * @param {number} amount Payment amount
     * @returns {boolean} Whether payment was successful
     */
    processPayment(method, amount) {
        // In a real system, this would integrate with a payment gateway
        this.paymentMethod = method;
        
        if (amount >= this.totalPrice) {
            this.paymentStatus = 'paid';
        } else if (amount > 0) {
            this.paymentStatus = 'partial';
        }
        
        return true;
    }

    /**
     * Add special requests to the booking
     * @param {string} requests Special requests text
     */
    addSpecialRequests(requests) {
        this.specialRequests = requests;
    }

    /**
     * Add notes to the booking
     * @param {string} notes Notes text
     */
    addNotes(notes) {
        this.notes = notes;
    }

    /**
     * Get booking details as a plain object
     * @returns {Object} Booking details
     */
    toJSON() {
        return {
            id: this.id,
            guestId: this.guestId,
            roomNumber: this.roomNumber,
            checkInDate: this.checkInDate,
            checkOutDate: this.checkOutDate,
            guests: this.guests,
            totalPrice: this.totalPrice,
            status: this.status,
            paymentStatus: this.paymentStatus,
            paymentMethod: this.paymentMethod,
            createdAt: this.createdAt,
            specialRequests: this.specialRequests,
            notes: this.notes,
            nights: this.calculateNights()
        };
    }
}
