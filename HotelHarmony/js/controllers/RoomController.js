/**
 * RoomController
 * Implements MVC pattern - handles room-related operations
 * Follows Single Responsibility Principle by handling only room-related functionality
 */
class RoomController {
    constructor(databaseService, roomFactory) {
        // Dependency injection
        this.databaseService = databaseService;
        this.roomFactory = roomFactory;
        
        // Observer pattern
        this.observer = Observer.getInstance();
        
        // Initialize room data if not present
        this.initializeRoomData();
    }

    /**
     * Initialize the room data if not already present
     */
    initializeRoomData() {
        const rooms = this.databaseService.getAllRooms();
        if (!rooms || rooms.length === 0) {
            this.generateSampleRooms();
        }
    }

    /**
     * Generate sample rooms for demonstration
     */
    generateSampleRooms() {
        const roomTypes = ['standard', 'deluxe', 'suite'];
        const roomsToCreate = 20;
        
        for (let i = 101; i <= 100 + roomsToCreate; i++) {
            // Determine floor and distribute room types
            const floor = Math.floor(i / 100);
            let type;
            
            if (floor === 1) {
                type = roomTypes[0]; // Standard rooms on first floor
            } else if (floor === 2) {
                type = roomTypes[1]; // Deluxe rooms on second floor
            } else {
                type = roomTypes[2]; // Suites on third floor
            }
            
            // Create room using factory pattern
            const room = this.roomFactory.createRoom(type, i.toString());
            
            // Add some extra features to make rooms unique
            if (i % 2 === 0) {
                room.addFeature('City View');
            } else {
                room.addFeature('Garden View');
            }
            
            if (i % 5 === 0) {
                room.addFeature('Balcony');
            }
            
            // Randomly mark some rooms as unavailable
            if (i % 7 === 0) {
                room.updateStatus('maintenance');
            } else if (i % 11 === 0) {
                room.updateStatus('occupied');
            }
            
            // Save to database
            this.databaseService.saveRoom(room);
        }
    }

    /**
     * Get all rooms
     * @returns {Array} List of rooms
     */
    getAllRooms() {
        return this.databaseService.getAllRooms();
    }

    /**
     * Get a specific room by number
     * @param {string} roomNumber Room number
     * @returns {Room|null} Room object or null if not found
     */
    getRoomByNumber(roomNumber) {
        return this.databaseService.getRoomByNumber(roomNumber);
    }

    /**
     * Search for available rooms based on criteria
     * @param {Object} criteria Search criteria
     * @returns {Array} List of available rooms matching criteria
     */
    searchAvailableRooms(criteria) {
        const { checkInDate, checkOutDate, guests, roomType } = criteria;
        
        // Get all rooms
        let rooms = this.databaseService.getAllRooms();
        
        // Filter by availability
        rooms = rooms.filter(room => room.isAvailable());
        
        // Filter by capacity
        if (guests) {
            rooms = rooms.filter(room => room.capacity >= parseInt(guests));
        }
        
        // Filter by room type
        if (roomType) {
            rooms = rooms.filter(room => room.type === roomType);
        }
        
        // Filter by booking date range availability
        const bookings = this.databaseService.getAllBookings();
        
        return rooms.filter(room => {
            // Check if room has any bookings that overlap with the requested dates
            const roomBookings = bookings.filter(booking => 
                booking.roomNumber === room.number && 
                booking.status !== 'cancelled' && 
                booking.status !== 'checked-out'
            );
            
            // If no bookings for this room, it's available
            if (roomBookings.length === 0) {
                return true;
            }
            
            // Check for date overlaps
            for (const booking of roomBookings) {
                if (booking.overlapsWith(checkInDate, checkOutDate)) {
                    return false;
                }
            }
            
            return true;
        });
    }

    /**
     * Add a new room
     * @param {Object} roomData Room data
     * @returns {Room} Newly created room
     */
    addRoom(roomData) {
        const { number, type, capacity, pricePerNight } = roomData;
        
        // Check if room number already exists
        const existingRoom = this.databaseService.getRoomByNumber(number);
        if (existingRoom) {
            throw new Error(`Room ${number} already exists`);
        }
        
        // Create room using factory pattern
        const room = this.roomFactory.createRoom(type, number);
        
        // Override default capacity and price if provided
        if (capacity) room.capacity = parseInt(capacity);
        if (pricePerNight) room.pricePerNight = parseFloat(pricePerNight);
        
        // Save to database
        this.databaseService.saveRoom(room);
        
        // Notify observers
        this.observer.notify('roomAdded', room);
        
        return room;
    }

    /**
     * Update an existing room
     * @param {string} roomNumber Room number
     * @param {Object} updates Updates to apply
     * @returns {Room} Updated room
     */
    updateRoom(roomNumber, updates) {
        // Get existing room
        const room = this.databaseService.getRoomByNumber(roomNumber);
        if (!room) {
            throw new Error(`Room ${roomNumber} not found`);
        }
        
        // Apply updates
        if (updates.type) room.type = updates.type;
        if (updates.capacity) room.capacity = parseInt(updates.capacity);
        if (updates.pricePerNight) room.pricePerNight = parseFloat(updates.pricePerNight);
        if (updates.status) room.updateStatus(updates.status);
        if (updates.features) {
            room.features = updates.features;
        }
        
        // Save to database
        this.databaseService.saveRoom(room);
        
        // Notify observers
        this.observer.notify('roomUpdated', room);
        
        return room;
    }

    /**
     * Delete a room
     * @param {string} roomNumber Room number
     * @returns {boolean} Whether deletion was successful
     */
    deleteRoom(roomNumber) {
        // Check if room exists
        const room = this.databaseService.getRoomByNumber(roomNumber);
        if (!room) {
            throw new Error(`Room ${roomNumber} not found`);
        }
        
        // Check if room has any active bookings
        const bookings = this.databaseService.getAllBookings();
        const activeBookings = bookings.filter(booking => 
            booking.roomNumber === roomNumber &&
            (booking.status === 'reserved' || booking.status === 'checked-in')
        );
        
        if (activeBookings.length > 0) {
            throw new Error(`Cannot delete room ${roomNumber} as it has active bookings`);
        }
        
        // Delete from database
        const result = this.databaseService.deleteRoom(roomNumber);
        
        // Notify observers
        if (result) {
            this.observer.notify('roomDeleted', roomNumber);
        }
        
        return result;
    }

    /**
     * Get room occupancy statistics
     * @returns {Object} Occupancy statistics
     */
    getRoomOccupancyStats() {
        const rooms = this.databaseService.getAllRooms();
        const totalRooms = rooms.length;
        
        // Count rooms by status
        const statusCounts = {
            available: 0,
            occupied: 0,
            maintenance: 0,
            reserved: 0
        };
        
        // Count rooms by type
        const typeCounts = {
            standard: 0,
            deluxe: 0,
            suite: 0
        };
        
        rooms.forEach(room => {
            // Count by status
            statusCounts[room.status] = (statusCounts[room.status] || 0) + 1;
            
            // Count by type
            typeCounts[room.type] = (typeCounts[room.type] || 0) + 1;
        });
        
        // Calculate occupancy rate
        const occupancyRate = (statusCounts.occupied / totalRooms) * 100;
        
        return {
            totalRooms,
            occupiedRooms: statusCounts.occupied,
            availableRooms: statusCounts.available,
            maintenanceRooms: statusCounts.maintenance,
            reservedRooms: statusCounts.reserved,
            occupancyRate: occupancyRate.toFixed(2),
            roomsByType: typeCounts
        };
    }

    /**
     * Record room cleaning
     * @param {string} roomNumber Room number
     * @returns {boolean} Whether update was successful
     */
    recordRoomCleaning(roomNumber) {
        const room = this.databaseService.getRoomByNumber(roomNumber);
        if (!room) {
            throw new Error(`Room ${roomNumber} not found`);
        }
        
        room.markAsCleaned();
        this.databaseService.saveRoom(room);
        
        return true;
    }

    /**
     * Get today's check-ins
     * @returns {Array} List of bookings checking in today
     */
    getTodaysCheckIns() {
        const bookings = this.databaseService.getAllBookings();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return bookings.filter(booking => {
            const bookingDate = new Date(booking.checkInDate);
            bookingDate.setHours(0, 0, 0, 0);
            return (
                booking.status === 'reserved' &&
                bookingDate.getTime() === today.getTime()
            );
        });
    }

    /**
     * Get today's check-outs
     * @returns {Array} List of bookings checking out today
     */
    getTodaysCheckOuts() {
        const bookings = this.databaseService.getAllBookings();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return bookings.filter(booking => {
            const bookingDate = new Date(booking.checkOutDate);
            bookingDate.setHours(0, 0, 0, 0);
            return (
                booking.status === 'checked-in' &&
                bookingDate.getTime() === today.getTime()
            );
        });
    }
}
