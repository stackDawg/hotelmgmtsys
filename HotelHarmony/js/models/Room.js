/**
 * Room Model Class
 * Implements Single Responsibility Principle by focusing only on room data and related behaviors
 */
class Room {
    constructor(number, type, capacity, pricePerNight) {
        this.number = number;
        this.type = type;
        this.capacity = capacity;
        this.pricePerNight = pricePerNight;
        this.status = 'available'; // available, occupied, maintenance, reserved
        this.features = [];
        this.lastCleaned = new Date();
        this.maintenanceHistory = [];
    }

    /**
     * Get room features as a formatted string
     * @returns {string} Comma-separated features
     */
    getFeaturesString() {
        return this.features.join(', ');
    }

    /**
     * Check if room is available for booking
     * @returns {boolean} Room availability status
     */
    isAvailable() {
        return this.status === 'available';
    }

    /**
     * Update room status
     * @param {string} status New room status
     */
    updateStatus(status) {
        this.status = status;
    }

    /**
     * Add a feature to the room
     * @param {string} feature Feature to add
     */
    addFeature(feature) {
        if (!this.features.includes(feature)) {
            this.features.push(feature);
        }
    }

    /**
     * Remove a feature from the room
     * @param {string} feature Feature to remove
     */
    removeFeature(feature) {
        this.features = this.features.filter(f => f !== feature);
    }

    /**
     * Update room cleaning status
     */
    markAsCleaned() {
        this.lastCleaned = new Date();
    }

    /**
     * Add maintenance record to history
     * @param {string} issueType Type of maintenance issue
     * @param {string} description Description of the maintenance
     * @param {string} resolvedBy ID of staff who resolved the issue
     */
    addMaintenanceRecord(issueType, description, resolvedBy) {
        this.maintenanceHistory.push({
            date: new Date(),
            issueType,
            description,
            resolvedBy,
            id: Date.now().toString()
        });
    }

    /**
     * Get room details as a plain object
     * @returns {Object} Room details
     */
    toJSON() {
        return {
            number: this.number,
            type: this.type,
            capacity: this.capacity,
            pricePerNight: this.pricePerNight,
            status: this.status,
            features: [...this.features],
            lastCleaned: this.lastCleaned,
            maintenanceHistory: [...this.maintenanceHistory]
        };
    }
}

/**
 * Standard Room Class - extends Room
 * Part of the Factory Pattern implementation
 */
class StandardRoom extends Room {
    constructor(number) {
        super(number, 'standard', 2, 100);
        this.features = ['TV', 'WiFi', 'Air Conditioning'];
    }
}

/**
 * Deluxe Room Class - extends Room
 * Part of the Factory Pattern implementation
 */
class DeluxeRoom extends Room {
    constructor(number) {
        super(number, 'deluxe', 3, 200);
        this.features = ['TV', 'WiFi', 'Air Conditioning', 'Mini Bar', 'King Size Bed'];
    }
}

/**
 * Suite Room Class - extends Room
 * Part of the Factory Pattern implementation
 */
class SuiteRoom extends Room {
    constructor(number) {
        super(number, 'suite', 4, 300);
        this.features = ['TV', 'WiFi', 'Air Conditioning', 'Mini Bar', 'King Size Bed', 'Jacuzzi', 'Separate Living Area'];
    }
}
