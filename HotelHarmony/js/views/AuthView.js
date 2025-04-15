/**
 * AuthView
 * Implements MVC pattern - handles the presentation logic for authentication
 * Follows Single Responsibility Principle by focusing only on auth-related UI
 */
class AuthView {
    constructor(controller) {
        this.controller = controller;
        this.loginForm = document.getElementById('login-form');
        this.authSection = document.getElementById('auth-section');
        this.contentSection = document.getElementById('content-section');
        this.logoutBtn = document.getElementById('logout-btn');
        this.loginError = document.getElementById('login-error');
    }

    /**
     * Show the login form
     */
    showLoginForm() {
        this.authSection.classList.remove('d-none');
        this.loginError.classList.add('d-none');
        this.loginForm.reset();
    }

    /**
     * Hide the login form
     */
    hideLoginForm() {
        this.authSection.classList.add('d-none');
    }

    /**
     * Show the logout button
     */
    showLogoutButton() {
        this.logoutBtn.classList.remove('d-none');
    }

    /**
     * Hide the logout button
     */
    hideLogoutButton() {
        this.logoutBtn.classList.add('d-none');
    }

    /**
     * Display login error message
     * @param {string} message Error message to display
     */
    showLoginError(message) {
        this.loginError.textContent = message;
        this.loginError.classList.remove('d-none');
    }

    /**
     * Hide login error message
     */
    hideLoginError() {
        this.loginError.classList.add('d-none');
    }

    /**
     * Update the user info display in the sidebar
     * @param {User} user User object
     */
    updateUserInfo(user) {
        const userInfo = document.getElementById('user-info');
        
        if (user) {
            userInfo.innerHTML = `
                <div class="mb-2">
                    <i class="fas fa-user-circle fa-3x"></i>
                </div>
                <div>
                    <h6 class="mb-0">${user.name}</h6>
                    <small>${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</small>
                </div>
            `;
        } else {
            userInfo.innerHTML = '';
        }
    }

    /**
     * Create nav menu based on user role
     * @param {string} role User role
     * @returns {string} HTML for the navigation menu
     */
    createNavMenu(role) {
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
        return navHTML;
    }

    /**
     * Update the navigation menu display
     * @param {string} role User role
     */
    updateNavMenu(role) {
        const navMenu = document.getElementById('nav-menu');
        navMenu.innerHTML = this.createNavMenu(role);
    }

    /**
     * Set the active navigation item
     * @param {string} navId ID of the navigation item to activate
     */
    setActiveNavItem(navId) {
        // Remove active class from all nav links
        document.querySelectorAll('#nav-menu .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to specified nav link
        const navLink = document.getElementById(navId);
        if (navLink) {
            navLink.classList.add('active');
        }
    }

    /**
     * Update the page title
     * @param {string} title New page title
     */
    updatePageTitle(title) {
        document.getElementById('page-title').textContent = title;
    }
}
