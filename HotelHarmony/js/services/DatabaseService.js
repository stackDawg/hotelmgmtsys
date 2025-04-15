/**
 * DatabaseService Class
 * Implements Singleton pattern to ensure a single instance of the database service
 * Provides in-memory storage for the Hotel Management System
 */
class DatabaseService {
    constructor() {
        // Check if an instance already exists
        if (DatabaseService.instance) {
            return DatabaseService.instance;
        }
        
        // Set up in-memory storage
        this.storage = {
            rooms: new Map(),         // key: room number
            bookings: new Map(),      // key: booking id
            maintenanceRequests: new Map(), // key: request id
            users: new Map()          // key: user id
        };
        
        // Store instance in class property
        DatabaseService.instance = this;
        
        // Load data from localStorage if available
        this.loadFromLocalStorage();
    }

    /**
     * Load data from localStorage if available
     */
    loadFromLocalStorage() {
        try {
            // Load rooms
            const roomsData = localStorage.getItem('hms_rooms');
            if (roomsData) {
                const roomsArray = JSON.parse(roomsData);
                roomsArray.forEach(roomData => {
                    // Convert plain objects back to Room instances
                    let room;
                    
                    switch (roomData.type) {
                        case 'standard':
                            room = new StandardRoom(roomData.number);
                            break;
                        case 'deluxe':
                            room = new DeluxeRoom(roomData.number);
                            break;
                        case 'suite':
                            room = new SuiteRoom(roomData.number);
                            break;
                        default:
                            room = new Room(roomData.number, roomData.type, roomData.capacity, roomData.pricePerNight);
                    }
                    
                    // Restore properties
                    room.status = roomData.status;
                    room.features = roomData.features;
                    room.lastCleaned = new Date(roomData.lastCleaned);
                    room.maintenanceHistory = roomData.maintenanceHistory;
                    
                    this.storage.rooms.set(room.number, room);
                });
            }
            
            // Load bookings
            const bookingsData = localStorage.getItem('hms_bookings');
            if (bookingsData) {
                const bookingsArray = JSON.parse(bookingsData);
                bookingsArray.forEach(bookingData => {
                    // Convert plain objects back to Booking instances
                    const booking = new Booking(
                        bookingData.id,
                        bookingData.guestId,
                        bookingData.roomNumber,
                        bookingData.checkInDate,
                        bookingData.checkOutDate,
                        bookingData.guests,
                        bookingData.totalPrice
                    );
                    
                    // Restore properties
                    booking.status = bookingData.status;
                    booking.paymentStatus = bookingData.paymentStatus;
                    booking.paymentMethod = bookingData.paymentMethod;
                    booking.createdAt = new Date(bookingData.createdAt);
                    booking.specialRequests = bookingData.specialRequests;
                    booking.notes = bookingData.notes;
                    
                    this.storage.bookings.set(booking.id, booking);
                });
            }
            
            // Load maintenance requests
            const maintenanceData = localStorage.getItem('hms_maintenance');
            if (maintenanceData) {
                const maintenanceArray = JSON.parse(maintenanceData);
                maintenanceArray.forEach(requestData => {
                    // Convert plain objects back to MaintenanceRequest instances
                    const request = new MaintenanceRequest(
                        requestData.id,
                        requestData.roomNumber,
                        requestData.issueType,
                        requestData.description,
                        requestData.reportedBy,
                        requestData.priority
                    );
                    
                    // Restore properties
                    request.reportedOn = new Date(requestData.reportedOn);
                    request.status = requestData.status;
                    request.assignedTo = requestData.assignedTo;
                    request.completedOn = requestData.completedOn ? new Date(requestData.completedOn) : null;
                    request.notes = requestData.notes;
                    
                    this.storage.maintenanceRequests.set(request.id, request);
                });
            }
            
            // Load users
            const usersData = localStorage.getItem('hms_users');
            if (usersData) {
                const usersArray = JSON.parse(usersData);
                usersArray.forEach(userData => {
                    // Convert plain objects back to User instances
                    let user;
                    
                    if (userData.role === 'guest') {
                        user = new GuestUser(
                            userData.id,
                            userData.username,
                            userData.name,
                            userData.email,
                            userData.phone
                        );
                    } else {
                        user = new StaffUser(
                            userData.id,
                            userData.username,
                            userData.name,
                            userData.role,
                            userData.department,
                            userData.email,
                            userData.phone
                        );
                        
                        // Restore staff-specific properties
                        if (userData.hireDate) {
                            user.hireDate = new Date(userData.hireDate);
                        }
                        user.status = userData.status;
                    }
                    
                    this.storage.users.set(user.id, user);
                });
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            // If error, start with empty storage
        }
    }

    /**
     * Save data to localStorage
     */
    saveToLocalStorage() {
        try {
            // Save rooms
            const roomsArray = Array.from(this.storage.rooms.values()).map(room => room.toJSON());
            localStorage.setItem('hms_rooms', JSON.stringify(roomsArray));
            
            // Save bookings
            const bookingsArray = Array.from(this.storage.bookings.values()).map(booking => booking.toJSON());
            localStorage.setItem('hms_bookings', JSON.stringify(bookingsArray));
            
            // Save maintenance requests
            const maintenanceArray = Array.from(this.storage.maintenanceRequests.values()).map(request => request.toJSON());
            localStorage.setItem('hms_maintenance', JSON.stringify(maintenanceArray));
            
            // Save users
            const usersArray = Array.from(this.storage.users.values()).map(user => user.toJSON());
            localStorage.setItem('hms_users', JSON.stringify(usersArray));
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
        }
    }

    /**
     * Get all rooms
     * @returns {Array} Array of all rooms
     */
    getAllRooms() {
        return Array.from(this.storage.rooms.values());
    }

    /**
     * Get a room by number
     * @param {string} roomNumber Room number
     * @returns {Room|null} Room object or null if not found
     */
    getRoomByNumber(roomNumber) {
        return this.storage.rooms.get(roomNumber) || null;
    }

    /**
     * Save a room
     * @param {Room} room Room object
     * @returns {boolean} Whether the operation was successful
     */
    saveRoom(room) {
        if (!room || !room.number) {
            return false;
        }
        
        this.storage.rooms.set(room.number, room);
        this.saveToLocalStorage();
        return true;
    }

    /**
     * Delete a room
     * @param {string} roomNumber Room number
     * @returns {boolean} Whether the operation was successful
     */
    deleteRoom(roomNumber) {
        const result = this.storage.rooms.delete(roomNumber);
        if (result) {
            this.saveToLocalStorage();
        }
        return result;
    }

    /**
     * Get all bookings
     * @returns {Array} Array of all bookings
     */
    getAllBookings() {
        return Array.from(this.storage.bookings.values());
    }

    /**
     * Get a booking by ID
     * @param {string} bookingId Booking ID
     * @returns {Booking|null} Booking object or null if not found
     */
    getBookingById(bookingId) {
        return this.storage.bookings.get(bookingId) || null;
    }

    /**
     * Save a booking
     * @param {Booking} booking Booking object
     * @returns {boolean} Whether the operation was successful
     */
    saveBooking(booking) {
        if (!booking || !booking.id) {
            return false;
        }
        
        this.storage.bookings.set(booking.id, booking);
        this.saveToLocalStorage();
        return true;
    }

    /**
     * Delete a booking
     * @param {string} bookingId Booking ID
     * @returns {boolean} Whether the operation was successful
     */
    deleteBooking(bookingId) {
        const result = this.storage.bookings.delete(bookingId);
        if (result) {
            this.saveToLocalStorage();
        }
        return result;
    }

    /**
     * Get all maintenance requests
     * @returns {Array} Array of all maintenance requests
     */
    getAllMaintenanceRequests() {
        return Array.from(this.storage.maintenanceRequests.values());
    }

    /**
     * Get a maintenance request by ID
     * @param {string} requestId Maintenance request ID
     * @returns {MaintenanceRequest|null} Maintenance request object or null if not found
     */
    getMaintenanceRequestById(requestId) {
        return this.storage.maintenanceRequests.get(requestId) || null;
    }

    /**
     * Save a maintenance request
     * @param {MaintenanceRequest} request Maintenance request object
     * @returns {boolean} Whether the operation was successful
     */
    saveMaintenanceRequest(request) {
        if (!request || !request.id) {
            return false;
        }
        
        this.storage.maintenanceRequests.set(request.id, request);
        this.saveToLocalStorage();
        return true;
    }

    /**
     * Delete a maintenance request
     * @param {string} requestId Maintenance request ID
     * @returns {boolean} Whether the operation was successful
     */
    deleteMaintenanceRequest(requestId) {
        const result = this.storage.maintenanceRequests.delete(requestId);
        if (result) {
            this.saveToLocalStorage();
        }
        return result;
    }

    /**
     * Get all users
     * @returns {Array} Array of all users
     */
    getAllUsers() {
        return Array.from(this.storage.users.values());
    }

    /**
     * Get a user by ID
     * @param {string} userId User ID
     * @returns {User|null} User object or null if not found
     */
    getUserById(userId) {
        return this.storage.users.get(userId) || null;
    }

    /**
     * Save a user
     * @param {User} user User object
     * @returns {boolean} Whether the operation was successful
     */
    saveUser(user) {
        if (!user || !user.id) {
            return false;
        }
        
        this.storage.users.set(user.id, user);
        this.saveToLocalStorage();
        return true;
    }

    /**
     * Delete a user
     * @param {string} userId User ID
     * @returns {boolean} Whether the operation was successful
     */
    deleteUser(userId) {
        const result = this.storage.users.delete(userId);
        if (result) {
            this.saveToLocalStorage();
        }
        return result;
    }

    /**
     * Clear all data (for testing/development)
     */
    clearAllData() {
        this.storage.rooms.clear();
        this.storage.bookings.clear();
        this.storage.maintenanceRequests.clear();
        this.storage.users.clear();
        
        // Clear localStorage
        localStorage.removeItem('hms_rooms');
        localStorage.removeItem('hms_bookings');
        localStorage.removeItem('hms_maintenance');
        localStorage.removeItem('hms_users');
    }
}
