/**
 * AuthController
 * Implements MVC pattern - handles user authentication and authorization
 * Follows Single Responsibility Principle by handling only authentication-related operations
 */
class AuthController {
    constructor(databaseService) {
        // Dependency injection for database service
        this.databaseService = databaseService;
        this.currentUser = null;
        this.authView = new AuthView(this);
        
        // Observer pattern - subscribe to auth events
        this.authObserver = Observer.getInstance();
    }

    /**
     * Initialize the auth controller
     */
    init() {
        this.checkExistingSession();
        this.registerEventListeners();
        
        // Initialize the registration form
        this.initRegForm();
    }

    /**
     * Register event listeners for auth-related DOM elements
     */
    registerEventListeners() {
        // Login form submission
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Registration form submission
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        // Guest access button
        document.getElementById('guest-access-btn').addEventListener('click', () => {
            this.continueAsGuest();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
    }
    
    /**
     * Handle user registration
     */
    register() {
        // Get form values
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const role = document.getElementById('reg-role').value;
        const department = document.getElementById('reg-department')?.value || '';
        
        // Get alert containers
        const errorAlert = document.getElementById('register-error');
        const successAlert = document.getElementById('register-success');
        
        // Hide alert messages
        errorAlert.classList.add('d-none');
        successAlert.classList.add('d-none');
        
        // Validate form
        if (!username || !password || !confirmPassword || !name || !email || !role) {
            errorAlert.textContent = 'Please fill in all required fields';
            errorAlert.classList.remove('d-none');
            return;
        }
        
        if (password !== confirmPassword) {
            errorAlert.textContent = 'Passwords do not match';
            errorAlert.classList.remove('d-none');
            return;
        }
        
        // Validate department for staff roles
        if (role !== 'guest' && !department) {
            errorAlert.textContent = 'Department is required for staff accounts';
            errorAlert.classList.remove('d-none');
            return;
        }
        
        // Attempt to register user
        try {
            const user = User.register(username, password, name, email, phone, role, department);
            
            // Show success message
            successAlert.textContent = 'Registration successful! You can now login.';
            successAlert.classList.remove('d-none');
            
            // Clear form
            document.getElementById('register-form').reset();
            
            // Switch to login tab after 1 second
            setTimeout(() => {
                document.getElementById('login-tab').click();
            }, 1000);
            
        } catch (error) {
            errorAlert.textContent = error.message;
            errorAlert.classList.remove('d-none');
        }
    }
    
    /**
     * Initialize registration form event listeners
     */
    initRegForm() {
        // Show/hide department field based on role selection
        const roleSelect = document.getElementById('reg-role');
        const departmentContainer = document.getElementById('reg-department-container');
        
        roleSelect.addEventListener('change', () => {
            if (roleSelect.value === 'guest') {
                departmentContainer.style.display = 'none';
            } else {
                departmentContainer.style.display = 'block';
                
                // Set appropriate default department label based on role
                const departmentLabel = document.querySelector('label[for="reg-department"]');
                const departmentInput = document.getElementById('reg-department');
                
                switch (roleSelect.value) {
                    case 'receptionist':
                        departmentLabel.textContent = 'Department (e.g., Front Desk)';
                        departmentInput.placeholder = 'Front Desk';
                        break;
                    case 'maintenance':
                        departmentLabel.textContent = 'Department (e.g., Maintenance, Housekeeping)';
                        departmentInput.placeholder = 'Maintenance';
                        break;
                    case 'manager':
                        departmentLabel.textContent = 'Department (e.g., Operations, General Management)';
                        departmentInput.placeholder = 'Operations';
                        break;
                }
            }
        });
    }

    /**
     * Check if user has an existing session (via localStorage)
     */
    checkExistingSession() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                
                // Create appropriate user instance based on role
                if (user.role === 'guest') {
                    this.currentUser = new GuestUser(user.id, user.username, user.name, user.email, user.phone);
                } else {
                    this.currentUser = new StaffUser(user.id, user.username, user.name, user.role, 'hotel', user.email, user.phone);
                }
                
                // Mark as authenticated
                this.currentUser.isAuthenticated = true;
                
                // Notify observers of login event
                this.authObserver.notify('userLoggedIn', this.currentUser);
                
                // Update UI for authenticated user
                this.authView.showLogoutButton();
                this.authView.hideLoginForm();
                
                // Show appropriate view based on role
                this.showUserView(user.role);
            } catch (e) {
                console.error('Error restoring session:', e);
                localStorage.removeItem('currentUser');
            }
        }
    }

    /**
     * Handle user login
     */
    login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        
        if (!username || !password || !role) {
            this.authView.showLoginError('Please fill in all fields');
            return;
        }
        
        let user;
        let isAuthenticated = false;
        
        // Check if user is a registered user for the selected role
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const registeredUser = registeredUsers.find(u => u.username === username && u.role === role);
        
        if (registeredUser && registeredUser.password === password) {
            // If registered user is found and password matches
            if (registeredUser.role === 'guest') {
                user = new GuestUser(
                    registeredUser.id, 
                    registeredUser.username, 
                    registeredUser.name, 
                    registeredUser.email, 
                    registeredUser.phone
                );
            } else {
                user = new StaffUser(
                    registeredUser.id, 
                    registeredUser.username, 
                    registeredUser.name, 
                    registeredUser.role, 
                    registeredUser.department || 'Default', 
                    registeredUser.email, 
                    registeredUser.phone
                );
            }
            isAuthenticated = true;
        } else {
            // Fall back to default users for demo/testing
            if (role === 'guest') {
                user = new GuestUser('guest1', username, 'Guest User', 'guest@example.com', '555-123-4567');
            } else if (role === 'receptionist') {
                user = new StaffUser('recept1', username, 'Receptionist User', 'receptionist', 'Front Desk', 'receptionist@hotel.com', '555-234-5678');
            } else if (role === 'maintenance') {
                user = new StaffUser('maint1', username, 'Maintenance User', 'maintenance', 'Maintenance', 'maintenance@hotel.com', '555-345-6789');
            } else if (role === 'manager') {
                user = new StaffUser('mgr1', username, 'Manager User', 'manager', 'Management', 'manager@hotel.com', '555-456-7890');
            }
        }
        
        // Authenticate user if not already authenticated
        if (!isAuthenticated && user && !user.authenticate(password)) {
            this.authView.showLoginError('Invalid credentials');
            return;
        }

        // If we get here, either the user is authenticated or passed authentication
        this.currentUser = user;
        this.currentUser.isAuthenticated = true;
        
        // Store user info in localStorage for session persistence
        localStorage.setItem('currentUser', JSON.stringify(user.toJSON()));
        
        // Notify observers of login event
        this.authObserver.notify('userLoggedIn', user);
        
        // Update UI for authenticated user
        this.authView.showLogoutButton();
        this.authView.hideLoginForm();
        
        // Show appropriate view based on role
        this.showUserView(role);
        
        // Log user login success
        console.log('User logged in:', user);
    }

    /**
     * Handle continue as guest (anonymous user)
     */
    continueAsGuest() {
        const guestUser = new GuestUser('guest999', 'anonymous', 'Anonymous Guest', '', '');
        guestUser.isAuthenticated = true;
        this.currentUser = guestUser;
        
        // Store minimal info for guest user
        localStorage.setItem('currentUser', JSON.stringify(guestUser.toJSON()));
        
        // Notify observers of login event
        this.authObserver.notify('userLoggedIn', guestUser);
        
        // Update UI for authenticated user
        this.authView.showLogoutButton();
        this.authView.hideLoginForm();
        
        // Show guest view
        this.showUserView('guest');
    }

    /**
     * Handle user logout
     */
    logout() {
        if (this.currentUser) {
            this.currentUser.logout();
            this.currentUser = null;
            
            // Clear session data
            localStorage.removeItem('currentUser');
            
            // Notify observers of logout event
            this.authObserver.notify('userLoggedOut');
            
            // Update UI for anonymous user
            this.authView.showLoginForm();
            this.authView.hideLogoutButton();
            
            // Hide all role-specific views
            document.getElementById('content-section').classList.add('d-none');
            document.querySelectorAll('#guest-view, #receptionist-view, #maintenance-staff-view, #manager-view').forEach(el => {
                el.classList.add('d-none');
            });
        }
    }

    /**
     * Show appropriate view based on user role
     * @param {string} role - User role
     */
    showUserView(role) {
        // Make content section visible
        document.getElementById('content-section').classList.remove('d-none');
        
        // Hide all views first
        document.getElementById('guest-view').classList.add('d-none');
        document.getElementById('receptionist-view').classList.add('d-none');
        document.getElementById('maintenance-staff-view').classList.add('d-none');
        document.getElementById('manager-view').classList.add('d-none');
        
        // Show appropriate view based on role
        switch (role) {
            case 'guest':
                document.getElementById('guest-view').classList.remove('d-none');
                document.getElementById('page-title').textContent = 'Guest Portal';
                break;
            case 'receptionist':
                document.getElementById('receptionist-view').classList.remove('d-none');
                document.getElementById('page-title').textContent = 'Receptionist Dashboard';
                break;
            case 'maintenance':
                document.getElementById('maintenance-staff-view').classList.remove('d-none');
                document.getElementById('page-title').textContent = 'Maintenance Dashboard';
                break;
            case 'manager':
                document.getElementById('manager-view').classList.remove('d-none');
                document.getElementById('page-title').textContent = 'Manager Dashboard';
                break;
        }
        
        // Update sidebar navigation
        this.updateSidebarNavigation(role);
    }

    /**
     * Update sidebar navigation based on user role
     * @param {string} role - User role
     */
    updateSidebarNavigation(role) {
        const navMenu = document.getElementById('nav-menu');
        const userInfo = document.getElementById('user-info');
        
        // Clear existing navigation
        navMenu.innerHTML = '';
        
        // Display user info
        if (this.currentUser) {
            userInfo.innerHTML = `
                <div class="mb-2">
                    <i class="fas fa-user-circle fa-3x"></i>
                </div>
                <div>
                    <h6 class="mb-0">${this.currentUser.name}</h6>
                    <small>${this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1)}</small>
                </div>
            `;
        }
        
        // Create role-specific navigation
        let navHTML = '<ul class="nav flex-column">';
        
        switch (role) {
            case 'guest':
                navHTML += `
                    <li class="nav-item">
                        <a class="nav-link active" href="#" id="nav-search-rooms">
                            <i class="fas fa-search"></i> Search Rooms
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" id="nav-my-bookings">
                            <i class="fas fa-calendar-check"></i> My Bookings
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" id="nav-report-issue">
                            <i class="fas fa-tools"></i> Report Issue
                        </a>
                    </li>
                `;
                break;
                
            case 'receptionist':
                navHTML += `
                    <li class="nav-item">
                        <a class="nav-link active" href="#" id="nav-check-in">
                            <i class="fas fa-sign-in-alt"></i> Check-in
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" id="nav-check-out">
                            <i class="fas fa-sign-out-alt"></i> Check-out
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" id="nav-manage-bookings">
                            <i class="fas fa-calendar-alt"></i> Manage Bookings
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" id="nav-maintenance-requests">
                            <i class="fas fa-tools"></i> Maintenance Requests
                        </a>
                    </li>
                `;
                break;
                
            case 'maintenance':
                navHTML += `
                    <li class="nav-item">
                        <a class="nav-link active" href="#" id="nav-view-requests">
                            <i class="fas fa-clipboard-list"></i> View Requests
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" id="nav-completed-requests">
                            <i class="fas fa-check-circle"></i> Completed Tasks
                        </a>
                    </li>
                `;
                break;
                
            case 'manager':
                navHTML += `
                    <li class="nav-item">
                        <a class="nav-link active" href="#" id="nav-dashboard">
                            <i class="fas fa-chart-line"></i> Dashboard
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" id="nav-room-inventory">
                            <i class="fas fa-bed"></i> Room Inventory
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" id="nav-reports">
                            <i class="fas fa-file-alt"></i> Reports
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" id="nav-staff-accounts">
                            <i class="fas fa-users"></i> Staff Accounts
                        </a>
                    </li>
                `;
                break;
        }
        
        navHTML += '</ul>';
        navMenu.innerHTML = navHTML;
        
        // Add event listeners to navigation items
        this.attachNavEventListeners(role);
    }

    /**
     * Attach event listeners to navigation items
     * @param {string} role - User role
     */
    attachNavEventListeners(role) {
        // Use event delegation for simpler code
        document.getElementById('nav-menu').addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                // Remove active class from all links
                document.querySelectorAll('#nav-menu .nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                
                // Add active class to clicked link
                e.target.classList.add('active');
                
                // Handle navigation based on ID
                switch (e.target.id) {
                    // Guest navigation
                    case 'nav-search-rooms':
                        this.authObserver.notify('navigationChange', 'guest-search');
                        break;
                    case 'nav-my-bookings':
                        this.authObserver.notify('navigationChange', 'guest-bookings');
                        break;
                    case 'nav-report-issue':
                        this.authObserver.notify('navigationChange', 'guest-report');
                        break;
                        
                    // Receptionist navigation
                    case 'nav-check-in':
                        this.authObserver.notify('navigationChange', 'receptionist-checkin');
                        break;
                    case 'nav-check-out':
                        this.authObserver.notify('navigationChange', 'receptionist-checkout');
                        break;
                    case 'nav-manage-bookings':
                        this.authObserver.notify('navigationChange', 'receptionist-bookings');
                        break;
                    case 'nav-maintenance-requests':
                        this.authObserver.notify('navigationChange', 'receptionist-maintenance');
                        break;
                        
                    // Maintenance navigation
                    case 'nav-view-requests':
                        this.authObserver.notify('navigationChange', 'maintenance-requests');
                        break;
                    case 'nav-completed-requests':
                        this.authObserver.notify('navigationChange', 'maintenance-completed');
                        break;
                        
                    // Manager navigation
                    case 'nav-dashboard':
                        this.authObserver.notify('navigationChange', 'manager-dashboard');
                        break;
                    case 'nav-room-inventory':
                        this.authObserver.notify('navigationChange', 'manager-rooms');
                        break;
                    case 'nav-reports':
                        this.authObserver.notify('navigationChange', 'manager-reports');
                        break;
                    case 'nav-staff-accounts':
                        this.authObserver.notify('navigationChange', 'manager-staff');
                        break;
                }
            }
        });
    }

    /**
     * Get the current authenticated user
     * @returns {User|null} Current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if the current user has permission for an action
     * @param {string} action - Action to check permission for
     * @returns {boolean} Whether user has permission
     */
    userHasPermission(action) {
        return this.currentUser?.hasPermission(action) || false;
    }
}
