/**
 * User Model Class
 * Implements the Single Responsibility Principle by handling only user-related data and behaviors
 */
class User {
    constructor(id, username, name, role, email = '', phone = '') {
        this.id = id;
        this.username = username;
        this.name = name;
        this.role = role;
        this.email = email;
        this.phone = phone;
        this.isAuthenticated = false;
    }

    /**
     * Authenticate the user
     * @param {string} password - Password to verify
     * @returns {boolean} - Whether authentication was successful
     */
    authenticate(password) {
        // In a real app, this would validate against the database
        // For MVP, we're using mock data with simple validation
        if (this.username === 'guest' && password === 'guest') {
            this.isAuthenticated = true;
            return true;
        } else if (this.username === 'receptionist' && password === 'reception') {
            this.isAuthenticated = true;
            return true;
        } else if (this.username === 'maintenance' && password === 'maintain') {
            this.isAuthenticated = true;
            return true;
        } else if (this.username === 'manager' && password === 'manage') {
            this.isAuthenticated = true;
            return true;
        }
        
        // Check if this is a registered user (stored in localStorage)
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const user = registeredUsers.find(u => u.username === this.username);
        
        if (user && user.password === password) {
            this.isAuthenticated = true;
            // Update current object with registered user data
            this.id = user.id;
            this.name = user.name;
            this.email = user.email;
            this.phone = user.phone;
            return true;
        }
        
        return false;
    }
    
    /**
     * Register a new user
     * @param {string} username - Username
     * @param {string} password - Password
     * @param {string} name - Full name
     * @param {string} email - Email address
     * @param {string} phone - Phone number
     * @param {string} role - User role (guest, receptionist, maintenance, manager)
     * @param {string} department - Department (for staff users)
     * @returns {User} - New user instance
     */
    static register(username, password, name, email, phone, role = 'guest', department = '') {
        // Get existing registered users
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // Check if username is already taken
        if (registeredUsers.some(user => user.username === username)) {
            throw new Error('Username already exists');
        }
        
        // Generate a unique ID
        const id = 'user_' + Date.now();
        
        // Create new user data
        const userData = {
            id,
            username,
            password, // In a real app, this would be hashed
            name,
            role,
            email,
            phone,
            department
        };
        
        // Save to localStorage
        registeredUsers.push(userData);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        // Return appropriate user instance based on role
        if (role === 'guest') {
            return new GuestUser(id, username, name, email, phone);
        } else {
            return new StaffUser(id, username, name, role, department, email, phone);
        }
    }

    /**
     * Log the user out
     */
    logout() {
        this.isAuthenticated = false;
    }

    /**
     * Check if user has permission for specific action
     * @param {string} action - The action to check permission for
     * @returns {boolean} - Whether the user has permission
     */
    hasPermission(action) {
        if (!this.isAuthenticated) return false;

        // Define permissions based on role
        const permissions = {
            guest: ['search_rooms', 'book_room', 'view_booking', 'report_maintenance'],
            receptionist: ['search_rooms', 'check_in', 'check_out', 'modify_booking', 'view_maintenance'],
            maintenance: ['view_maintenance', 'update_maintenance'],
            manager: ['manage_rooms', 'generate_reports', 'manage_staff', 'view_all']
        };

        return permissions[this.role]?.includes(action) || false;
    }

    /**
     * Get user info as a plain object
     * @returns {Object} - User information
     */
    toJSON() {
        return {
            id: this.id,
            username: this.username,
            name: this.name,
            role: this.role,
            email: this.email,
            phone: this.phone
        };
    }
}

/**
 * Guest User Class - extends User
 * Implements Liskov Substitution Principle by being a proper subtype
 */
class GuestUser extends User {
    constructor(id, username, name, email = '', phone = '') {
        super(id, username, name, 'guest', email, phone);
        this.bookings = [];
    }

    /**
     * Add a booking to the guest's bookings
     * @param {Booking} booking - The booking to add
     */
    addBooking(booking) {
        this.bookings.push(booking);
    }

    /**
     * Get all bookings for this guest
     * @returns {Array} - List of bookings
     */
    getBookings() {
        return this.bookings;
    }
}

/**
 * Staff User Class - extends User
 * Implements Liskov Substitution Principle by being a proper subtype
 */
class StaffUser extends User {
    constructor(id, username, name, role, department, email = '', phone = '') {
        super(id, username, name, role, email, phone);
        this.department = department;
        this.hireDate = new Date();
        this.status = 'active';
    }

    /**
     * Get staff details as a plain object
     * @returns {Object} - Staff information
     */
    getStaffDetails() {
        return {
            ...this.toJSON(),
            department: this.department,
            hireDate: this.hireDate,
            status: this.status
        };
    }

    /**
     * Update staff status
     * @param {string} status - New status
     */
    updateStatus(status) {
        this.status = status;
    }
}
