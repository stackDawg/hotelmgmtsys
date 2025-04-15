/**
 * Singleton Design Pattern Implementation
 * 
 * The Singleton pattern ensures that a class has only one instance and provides a global point
 * of access to that instance. This pattern is useful when exactly one object is needed to coordinate
 * actions across the system.
 * 
 * In this implementation, we create a generic Singleton wrapper that can be extended by other classes.
 */
class Singleton {
    /**
     * Get the Singleton instance of the class
     * @returns {Object} The Singleton instance
     */
    static getInstance() {
        // If the class doesn't have an instance property defined yet, create one
        if (!this.instance) {
            this.instance = new this();
        }
        
        return this.instance;
    }
}

/**
 * Examples of how to implement the Singleton pattern:
 * 
 * 1. For classes that need to be Singleton:
 * class MySingletonClass extends Singleton {
 *   constructor() { 
 *     // Check if instance already exists
 *     if (MySingletonClass.instance) {
 *       return MySingletonClass.instance;
 *     }
 *     super();
 *     // Initialize properties
 *     // ...
 *     // Save instance
 *     MySingletonClass.instance = this;
 *   }
 * }
 * 
 * 2. Using the getInstance method:
 * class AnotherSingletonClass extends Singleton {
 *   constructor() {
 *     super();
 *     // Initialize properties
 *     // ...
 *   }
 * }
 * 
 * Usage:
 * const instance1 = MySingletonClass.getInstance();
 * const instance2 = MySingletonClass.getInstance();
 * console.log(instance1 === instance2); // true
 * 
 * const anotherInstance1 = new AnotherSingletonClass(); // Regular constructor usage
 * const anotherInstance2 = AnotherSingletonClass.getInstance(); // Using static method
 */
