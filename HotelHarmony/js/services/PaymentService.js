/**
 * PaymentService
 * Implements Strategy Pattern to handle different payment methods
 * Provides payment processing functionality for the Hotel Management System
 */
class PaymentService {
    constructor() {
        // Initialize payment strategies
        this.paymentStrategies = {
            'credit-card': new CreditCardPaymentStrategy(),
            'debit-card': new DebitCardPaymentStrategy(),
            'cash': new CashPaymentStrategy(),
            'bank-transfer': new BankTransferPaymentStrategy()
        };
    }

    /**
     * Process a payment using the selected payment method
     * @param {string} bookingId Booking ID
     * @param {number} amount Payment amount
     * @param {string} paymentMethod Payment method (e.g., 'credit-card', 'cash')
     * @returns {Object} Payment result containing success status and message
     */
    processPayment(bookingId, amount, paymentMethod) {
        // Validate parameters
        if (!bookingId || !amount || !paymentMethod) {
            return {
                success: false,
                message: 'Missing required payment information'
            };
        }
        
        // Get the appropriate payment strategy
        const strategy = this.paymentStrategies[paymentMethod];
        
        if (!strategy) {
            return {
                success: false,
                message: `Unsupported payment method: ${paymentMethod}`
            };
        }
        
        // Process payment using the strategy
        try {
            return strategy.processPayment(bookingId, amount);
        } catch (error) {
            return {
                success: false,
                message: `Payment error: ${error.message}`
            };
        }
    }

    /**
     * Refund a payment
     * @param {string} bookingId Booking ID
     * @param {number} amount Refund amount
     * @param {string} paymentMethod Payment method used in original payment
     * @returns {Object} Refund result containing success status and message
     */
    refundPayment(bookingId, amount, paymentMethod) {
        // Validate parameters
        if (!bookingId || !amount || !paymentMethod) {
            return {
                success: false,
                message: 'Missing required refund information'
            };
        }
        
        // Get the appropriate payment strategy
        const strategy = this.paymentStrategies[paymentMethod];
        
        if (!strategy) {
            return {
                success: false,
                message: `Unsupported payment method for refund: ${paymentMethod}`
            };
        }
        
        // Process refund using the strategy
        try {
            return strategy.refundPayment(bookingId, amount);
        } catch (error) {
            return {
                success: false,
                message: `Refund error: ${error.message}`
            };
        }
    }

    /**
     * Generate a payment receipt
     * @param {string} bookingId Booking ID
     * @param {number} amount Payment amount
     * @param {string} paymentMethod Payment method
     * @returns {Object} Receipt data
     */
    generateReceipt(bookingId, amount, paymentMethod) {
        return {
            receiptId: `RCPT-${Date.now().toString().slice(-6)}`,
            bookingId,
            amount,
            paymentMethod,
            timestamp: new Date(),
            status: 'paid'
        };
    }
}

/**
 * PaymentStrategy interface 
 * Base class for all payment strategies
 */
class PaymentStrategy {
    /**
     * Process a payment
     * @param {string} bookingId Booking ID
     * @param {number} amount Payment amount
     * @returns {Object} Payment result
     */
    processPayment(bookingId, amount) {
        throw new Error('Method processPayment() must be implemented by subclass');
    }

    /**
     * Refund a payment
     * @param {string} bookingId Booking ID
     * @param {number} amount Refund amount
     * @returns {Object} Refund result
     */
    refundPayment(bookingId, amount) {
        throw new Error('Method refundPayment() must be implemented by subclass');
    }
}

/**
 * CreditCardPaymentStrategy
 * Implementation of the Strategy pattern for credit card payments
 */
class CreditCardPaymentStrategy extends PaymentStrategy {
    /**
     * Process a credit card payment
     * @param {string} bookingId Booking ID
     * @param {number} amount Payment amount
     * @returns {Object} Payment result
     */
    processPayment(bookingId, amount) {
        // In a real application, this would interact with a payment gateway
        console.log(`Processing credit card payment of $${amount} for booking ${bookingId}`);
        
        // Simulate successful payment
        return {
            success: true,
            message: 'Credit card payment processed successfully',
            transactionId: `CC-${Date.now().toString().slice(-8)}`,
            amount: amount
        };
    }

    /**
     * Refund a credit card payment
     * @param {string} bookingId Booking ID
     * @param {number} amount Refund amount
     * @returns {Object} Refund result
     */
    refundPayment(bookingId, amount) {
        // In a real application, this would interact with a payment gateway
        console.log(`Refunding credit card payment of $${amount} for booking ${bookingId}`);
        
        // Simulate successful refund
        return {
            success: true,
            message: 'Credit card refund processed successfully',
            transactionId: `REFUND-${Date.now().toString().slice(-8)}`,
            amount: amount
        };
    }
}

/**
 * DebitCardPaymentStrategy
 * Implementation of the Strategy pattern for debit card payments
 */
class DebitCardPaymentStrategy extends PaymentStrategy {
    /**
     * Process a debit card payment
     * @param {string} bookingId Booking ID
     * @param {number} amount Payment amount
     * @returns {Object} Payment result
     */
    processPayment(bookingId, amount) {
        // In a real application, this would interact with a payment gateway
        console.log(`Processing debit card payment of $${amount} for booking ${bookingId}`);
        
        // Simulate successful payment
        return {
            success: true,
            message: 'Debit card payment processed successfully',
            transactionId: `DC-${Date.now().toString().slice(-8)}`,
            amount: amount
        };
    }

    /**
     * Refund a debit card payment
     * @param {string} bookingId Booking ID
     * @param {number} amount Refund amount
     * @returns {Object} Refund result
     */
    refundPayment(bookingId, amount) {
        // In a real application, this would interact with a payment gateway
        console.log(`Refunding debit card payment of $${amount} for booking ${bookingId}`);
        
        // Simulate successful refund
        return {
            success: true,
            message: 'Debit card refund processed successfully',
            transactionId: `REFUND-${Date.now().toString().slice(-8)}`,
            amount: amount
        };
    }
}

/**
 * CashPaymentStrategy
 * Implementation of the Strategy pattern for cash payments
 */
class CashPaymentStrategy extends PaymentStrategy {
    /**
     * Process a cash payment
     * @param {string} bookingId Booking ID
     * @param {number} amount Payment amount
     * @returns {Object} Payment result
     */
    processPayment(bookingId, amount) {
        // In a real application, this might record the cash payment in a POS system
        console.log(`Recording cash payment of $${amount} for booking ${bookingId}`);
        
        // Simulate successful payment
        return {
            success: true,
            message: 'Cash payment recorded successfully',
            transactionId: `CASH-${Date.now().toString().slice(-8)}`,
            amount: amount
        };
    }

    /**
     * Refund a cash payment
     * @param {string} bookingId Booking ID
     * @param {number} amount Refund amount
     * @returns {Object} Refund result
     */
    refundPayment(bookingId, amount) {
        // In a real application, this might record the cash refund in a POS system
        console.log(`Recording cash refund of $${amount} for booking ${bookingId}`);
        
        // Simulate successful refund
        return {
            success: true,
            message: 'Cash refund recorded successfully',
            transactionId: `REFUND-${Date.now().toString().slice(-8)}`,
            amount: amount
        };
    }
}

/**
 * BankTransferPaymentStrategy
 * Implementation of the Strategy pattern for bank transfer payments
 */
class BankTransferPaymentStrategy extends PaymentStrategy {
    /**
     * Process a bank transfer payment
     * @param {string} bookingId Booking ID
     * @param {number} amount Payment amount
     * @returns {Object} Payment result
     */
    processPayment(bookingId, amount) {
        // In a real application, this would interact with a banking API
        console.log(`Recording bank transfer payment of $${amount} for booking ${bookingId}`);
        
        // Simulate successful payment
        return {
            success: true,
            message: 'Bank transfer payment recorded successfully',
            transactionId: `BT-${Date.now().toString().slice(-8)}`,
            amount: amount
        };
    }

    /**
     * Refund a bank transfer payment
     * @param {string} bookingId Booking ID
     * @param {number} amount Refund amount
     * @returns {Object} Refund result
     */
    refundPayment(bookingId, amount) {
        // In a real application, this would interact with a banking API
        console.log(`Recording bank transfer refund of $${amount} for booking ${bookingId}`);
        
        // Simulate successful refund
        return {
            success: true,
            message: 'Bank transfer refund initiated successfully',
            transactionId: `REFUND-${Date.now().toString().slice(-8)}`,
            amount: amount
        };
    }
}
