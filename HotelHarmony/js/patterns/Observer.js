/**
 * Observer Design Pattern Implementation
 * 
 * The Observer pattern defines a one-to-many dependency between objects so that when one
 * object changes state, all its dependents are notified and updated automatically.
 * 
 * In this implementation, we create an Observer that manages subscribers and notifies them
 * when events occur. This pattern is used to implement event-driven communication between
 * components in the Hotel Management System.
 */
class Observer extends Singleton {
    constructor() {
        // Check if instance already exists (Singleton pattern)
        if (Observer.instance) {
            return Observer.instance;
        }
        
        super();
        this.subscribers = new Map();
        Observer.instance = this;
    }

    /**
     * Subscribe to an event
     * @param {string} event Event name
     * @param {Function} callback Callback function to execute when the event occurs
     * @returns {Function} Unsubscribe function
     */
    subscribe(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }
        
        const callbacks = this.subscribers.get(event);
        callbacks.push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        };
    }

    /**
     * Unsubscribe from an event
     * @param {string} event Event name
     * @param {Function} callback Callback function to remove
     * @returns {boolean} Whether the unsubscribe was successful
     */
    unsubscribe(event, callback) {
        if (!this.subscribers.has(event)) {
            return false;
        }
        
        const callbacks = this.subscribers.get(event);
        const index = callbacks.indexOf(callback);
        
        if (index !== -1) {
            callbacks.splice(index, 1);
            return true;
        }
        
        return false;
    }

    /**
     * Notify all subscribers of an event
     * @param {string} event Event name
     * @param {*} data Data to pass to subscribers
     */
    notify(event, data) {
        if (!this.subscribers.has(event)) {
            return;
        }
        
        const callbacks = this.subscribers.get(event);
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in observer callback for event "${event}":`, error);
            }
        });
    }

    /**
     * Get the number of subscribers for an event
     * @param {string} event Event name
     * @returns {number} Number of subscribers
     */
    getSubscriberCount(event) {
        if (!this.subscribers.has(event)) {
            return 0;
        }
        
        return this.subscribers.get(event).length;
    }

    /**
     * Check if an event has any subscribers
     * @param {string} event Event name
     * @returns {boolean} Whether the event has subscribers
     */
    hasSubscribers(event) {
        return this.getSubscriberCount(event) > 0;
    }

    /**
     * Clear all subscribers for an event
     * @param {string} event Event name
     */
    clearSubscribers(event) {
        if (this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }
    }

    /**
     * Clear all subscribers for all events
     */
    clearAllSubscribers() {
        this.subscribers.clear();
    }
}

/**
 * Usage examples:
 * 
 * // Get the observer instance
 * const observer = Observer.getInstance();
 * 
 * // Subscribe to an event
 * const unsubscribe = observer.subscribe('roomAdded', (room) => {
 *   console.log('Room added:', room);
 * });
 * 
 * // Trigger the event
 * observer.notify('roomAdded', { number: '101', type: 'standard' });
 * 
 * // Unsubscribe when no longer needed
 * unsubscribe();
 * 
 * // Alternative unsubscribe method
 * observer.unsubscribe('roomAdded', callbackFunction);
 */
