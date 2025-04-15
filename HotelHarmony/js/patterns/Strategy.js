/**
 * Strategy Design Pattern Implementation
 * 
 * The Strategy pattern defines a family of algorithms, encapsulates each one, and makes them
 * interchangeable. Strategy lets the algorithm vary independently from clients that use it.
 * 
 * In this implementation, we create various payment strategies that can be selected at runtime.
 * This allows for flexible payment processing in the Hotel Management System.
 */

/**
 * PaymentContext
 * Context class that uses a strategy to process payments
 */
class PaymentContext {
    /**
     * Initialize with a payment strategy
     * @param {PaymentStrategy} strategy Payment strategy to use
     */
    constructor(strategy) {
        this.strategy = strategy;
    }

    /**
     * Set a new payment strategy
     * @param {PaymentStrategy} strategy New payment strategy
     */
    setStrategy(strategy) {
        this.strategy = strategy;
    }

    /**
     * Process payment using the current strategy
     * @param {string} bookingId Booking ID
     * @param {number} amount Payment amount
     * @returns {Object} Payment result
     */
    processPayment(bookingId, amount) {
        if (!this.strategy) {
            throw new Error('Payment strategy not set');
        }
        
        return this.strategy.processPayment(bookingId, amount);
    }
    
    /**
     * Process refund using the current strategy
     * @param {string} bookingId Booking ID
     * @param {number} amount Refund amount
     * @returns {Object} Refund result
     */
    processRefund(bookingId, amount) {
        if (!this.strategy) {
            throw new Error('Payment strategy not set');
        }
        
        return this.strategy.refundPayment(bookingId, amount);
    }
}

/**
 * PricingStrategy
 * Base class for all pricing strategies
 */
class PricingStrategy {
    /**
     * Calculate the price for a booking
     * @param {Room} room Room being booked
     * @param {number} nights Number of nights
     * @param {number} guests Number of guests
     * @param {Date} checkInDate Check-in date
     * @param {Date} checkOutDate Check-out date
     * @returns {number} Calculated price
     */
    calculatePrice(room, nights, guests, checkInDate, checkOutDate) {
        throw new Error('Method calculatePrice() must be implemented by subclass');
    }
}

/**
 * StandardPricingStrategy
 * Implementation of the Strategy pattern for standard pricing
 */
class StandardPricingStrategy extends PricingStrategy {
    /**
     * Calculate standard price based on room rate * nights
     */
    calculatePrice(room, nights, guests, checkInDate, checkOutDate) {
        return room.pricePerNight * nights;
    }
}

/**
 * WeekendPricingStrategy
 * Implementation of the Strategy pattern for weekend pricing
 */
class WeekendPricingStrategy extends PricingStrategy {
    /**
     * Calculate price with weekend rates (higher on Fri/Sat)
     */
    calculatePrice(room, nights, guests, checkInDate, checkOutDate) {
        let totalPrice = 0;
        let currentDate = new Date(checkInDate);
        
        for (let i = 0; i < nights; i++) {
            // Check if it's a weekend (Friday or Saturday)
            const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
            const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
            
            if (isWeekend) {
                // Apply weekend rate (25% higher)
                totalPrice += room.pricePerNight * 1.25;
            } else {
                // Standard rate for weekdays
                totalPrice += room.pricePerNight;
            }
            
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return totalPrice;
    }
}

/**
 * SeasonalPricingStrategy
 * Implementation of the Strategy pattern for seasonal pricing
 */
class SeasonalPricingStrategy extends PricingStrategy {
    /**
     * Initialize with seasonal rates
     * @param {Object} seasonalRates Seasonal rate multipliers by month
     */
    constructor(seasonalRates = null) {
        super();
        
        // Default seasonal rates if none provided
        this.seasonalRates = seasonalRates || {
            0: 1.0,  // January
            1: 1.0,  // February
            2: 1.1,  // March
            3: 1.2,  // April
            4: 1.2,  // May
            5: 1.5,  // June
            6: 1.8,  // July
            7: 1.8,  // August
            8: 1.5,  // September
            9: 1.2,  // October
            10: 1.0, // November
            11: 1.5  // December
        };
    }
    
    /**
     * Calculate price with seasonal rates
     */
    calculatePrice(room, nights, guests, checkInDate, checkOutDate) {
        let totalPrice = 0;
        let currentDate = new Date(checkInDate);
        
        for (let i = 0; i < nights; i++) {
            // Get month (0-11)
            const month = currentDate.getMonth();
            
            // Apply seasonal rate
            const seasonalRate = this.seasonalRates[month] || 1.0;
            totalPrice += room.pricePerNight * seasonalRate;
            
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return totalPrice;
    }
}

/**
 * LoyaltyPricingStrategy
 * Implementation of the Strategy pattern for pricing with loyalty discounts
 */
class LoyaltyPricingStrategy extends PricingStrategy {
    /**
     * Initialize with customer loyalty tier
     * @param {string} loyaltyTier Customer loyalty tier (bronze, silver, gold, platinum)
     */
    constructor(loyaltyTier = 'bronze') {
        super();
        
        // Discount rates by loyalty tier
        this.discountRates = {
            'bronze': 0.05, // 5% discount
            'silver': 0.10, // 10% discount
            'gold': 0.15,   // 15% discount
            'platinum': 0.20 // 20% discount
        };
        
        this.loyaltyTier = loyaltyTier.toLowerCase();
    }
    
    /**
     * Calculate price with loyalty discount
     */
    calculatePrice(room, nights, guests, checkInDate, checkOutDate) {
        // Calculate base price
        const basePrice = room.pricePerNight * nights;
        
        // Apply loyalty discount
        const discountRate = this.discountRates[this.loyaltyTier] || 0;
        const discount = basePrice * discountRate;
        
        return basePrice - discount;
    }
}

/**
 * Usage examples:
 * 
 * // Create room
 * const room = new DeluxeRoom('101');
 * 
 * // Set up dates
 * const checkInDate = new Date('2023-07-20');
 * const checkOutDate = new Date('2023-07-25');
 * const nights = 5;
 * const guests = 2;
 * 
 * // Standard pricing
 * const standardStrategy = new StandardPricingStrategy();
 * const standardPrice = standardStrategy.calculatePrice(room, nights, guests, checkInDate, checkOutDate);
 * console.log('Standard price:', standardPrice);
 * 
 * // Weekend pricing
 * const weekendStrategy = new WeekendPricingStrategy();
 * const weekendPrice = weekendStrategy.calculatePrice(room, nights, guests, checkInDate, checkOutDate);
 * console.log('Price with weekend rates:', weekendPrice);
 * 
 * // Seasonal pricing
 * const seasonalStrategy = new SeasonalPricingStrategy();
 * const seasonalPrice = seasonalStrategy.calculatePrice(room, nights, guests, checkInDate, checkOutDate);
 * console.log('Price with seasonal rates:', seasonalPrice);
 * 
 * // Loyalty pricing
 * const loyaltyStrategy = new LoyaltyPricingStrategy('gold');
 * const loyaltyPrice = loyaltyStrategy.calculatePrice(room, nights, guests, checkInDate, checkOutDate);
 * console.log('Price with loyalty discount:', loyaltyPrice);
 */
