/**
 * Factory Design Pattern Implementation
 * 
 * The Factory pattern provides a way to create objects without specifying the exact class
 * of object that will be created. This pattern is useful when the creation logic is
 * complex or when we want to centralize object creation.
 * 
 * In this implementation, we create a RoomFactory that produces different types of rooms.
 */
class RoomFactory {
    /**
     * Create a new room of the specified type
     * @param {string} type Room type (standard, deluxe, suite)
     * @param {string} number Room number
     * @returns {Room} Room of the specified type
     */
    createRoom(type, number) {
        switch (type.toLowerCase()) {
            case 'standard':
                return new StandardRoom(number);
            case 'deluxe':
                return new DeluxeRoom(number);
            case 'suite':
                return new SuiteRoom(number);
            default:
                throw new Error(`Unsupported room type: ${type}`);
        }
    }
    
    /**
     * Create multiple rooms at once
     * @param {Object[]} roomSpecs Array of room specifications {type, number, [additionalProps]}
     * @returns {Room[]} Array of created rooms
     */
    createRooms(roomSpecs) {
        return roomSpecs.map(spec => {
            const room = this.createRoom(spec.type, spec.number);
            
            // Apply any additional properties if specified
            if (spec.capacity) room.capacity = spec.capacity;
            if (spec.pricePerNight) room.pricePerNight = spec.pricePerNight;
            if (spec.features) room.features = spec.features;
            if (spec.status) room.status = spec.status;
            
            return room;
        });
    }
    
    /**
     * Create a batch of sequential rooms
     * @param {string} type Room type
     * @param {number} startNumber Starting room number
     * @param {number} count Number of rooms to create
     * @param {number} floor Floor number
     * @returns {Room[]} Array of created rooms
     */
    createRoomBatch(type, startNumber, count, floor) {
        const rooms = [];
        
        for (let i = 0; i < count; i++) {
            // Create room number based on floor (e.g., 101, 102, etc.)
            const roomNumber = `${floor}${(startNumber + i).toString().padStart(2, '0')}`;
            const room = this.createRoom(type, roomNumber);
            rooms.push(room);
        }
        
        return rooms;
    }
}

/**
 * BookingFactory (example of another factory)
 * Creates Booking objects with appropriate initialization logic
 */
class BookingFactory {
    /**
     * Create a new booking
     * @param {Object} bookingData Booking data
     * @returns {Booking} Created booking
     */
    createBooking(bookingData) {
        // Generate a unique booking ID with prefix "BK" followed by timestamp
        const bookingId = bookingData.id || `BK${Date.now().toString().slice(-6)}`;
        
        // Create and return the booking
        return new Booking(
            bookingId,
            bookingData.guestId,
            bookingData.roomNumber,
            bookingData.checkInDate,
            bookingData.checkOutDate,
            bookingData.guests,
            bookingData.totalPrice
        );
    }
}

/**
 * MaintenanceRequestFactory (example of another factory)
 * Creates MaintenanceRequest objects with appropriate initialization logic
 */
class MaintenanceRequestFactory {
    /**
     * Create a new maintenance request
     * @param {Object} requestData Maintenance request data
     * @returns {MaintenanceRequest} Created maintenance request
     */
    createMaintenanceRequest(requestData) {
        // Generate a unique request ID with prefix "MR" followed by timestamp
        const requestId = requestData.id || `MR${Date.now().toString().slice(-6)}`;
        
        // Create and return the maintenance request
        return new MaintenanceRequest(
            requestId,
            requestData.roomNumber,
            requestData.issueType,
            requestData.description,
            requestData.reportedBy,
            requestData.priority || 'medium'
        );
    }
}

/**
 * UserFactory (example of another factory)
 * Creates User objects of different types based on role
 */
class UserFactory {
    /**
     * Create a new user
     * @param {Object} userData User data
     * @returns {User} Created user
     */
    createUser(userData) {
        // Generate a unique user ID if not provided
        const userId = userData.id || `USER${Date.now().toString().slice(-6)}`;
        
        // Create appropriate user type based on role
        switch (userData.role) {
            case 'guest':
                return new GuestUser(
                    userId,
                    userData.username,
                    userData.name,
                    userData.email,
                    userData.phone
                );
            case 'receptionist':
            case 'maintenance':
            case 'manager':
                return new StaffUser(
                    userId,
                    userData.username,
                    userData.name,
                    userData.role,
                    userData.department || 'hotel',
                    userData.email,
                    userData.phone
                );
            default:
                throw new Error(`Unsupported user role: ${userData.role}`);
        }
    }
}
