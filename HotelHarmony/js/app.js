/**
 * Main Application Entry Point
 * Implements MVC pattern by initializing and coordinating controllers and views
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize services (Singleton pattern)
    const databaseService = new DatabaseService();
    const paymentService = new PaymentService();
    
    // Initialize factories (Factory pattern)
    const roomFactory = new RoomFactory();
    const bookingFactory = new BookingFactory();
    const maintenanceRequestFactory = new MaintenanceRequestFactory();
    const userFactory = new UserFactory();
    
    // Initialize controllers
    const authController = new AuthController(databaseService);
    const roomController = new RoomController(databaseService, roomFactory);
    const bookingController = new BookingController(databaseService, paymentService);
    const maintenanceController = new MaintenanceController(databaseService);
    const reportController = new ReportController(databaseService);
    
    // Initialize views
    const guestView = new GuestView({
        searchAvailableRooms: (criteria) => roomController.searchAvailableRooms(criteria),
        createBooking: (bookingData) => bookingController.createBooking(bookingData),
        getBookingsByGuest: (guestId) => bookingController.getBookingsByGuest(guestId),
        cancelBooking: (bookingId) => bookingController.cancelBooking(bookingId),
        getRoomByNumber: (roomNumber) => roomController.getRoomByNumber(roomNumber),
        getBookingById: (bookingId) => bookingController.getBookingById(bookingId),
        createMaintenanceRequest: (requestData) => maintenanceController.createMaintenanceRequest(requestData),
        getCurrentUser: () => authController.getCurrentUser()
    });
    
    const receptionistView = new ReceptionistView({
        checkIn: (bookingId) => bookingController.checkIn(bookingId),
        checkOut: (bookingId, paymentMethod) => bookingController.checkOut(bookingId, paymentMethod),
        getAllBookings: () => bookingController.getAllBookings(),
        getBookingById: (bookingId) => bookingController.getBookingById(bookingId),
        getRoomByNumber: (roomNumber) => roomController.getRoomByNumber(roomNumber),
        cancelBooking: (bookingId) => bookingController.cancelBooking(bookingId),
        updateBooking: (bookingId, updates) => bookingController.updateBooking(bookingId, updates),
        getAllMaintenanceRequests: () => maintenanceController.getAllMaintenanceRequests(),
        getTodaysCheckIns: () => bookingController.getTodaysCheckIns(),
        getTodaysCheckOuts: () => bookingController.getTodaysCheckOuts()
    });
    
    const maintenanceView = new MaintenanceView({
        getAllMaintenanceRequests: () => maintenanceController.getAllMaintenanceRequests(),
        getOpenMaintenanceRequests: () => maintenanceController.getOpenMaintenanceRequests(),
        getInProgressMaintenanceRequests: () => maintenanceController.getInProgressMaintenanceRequests(),
        getCompletedMaintenanceRequests: () => maintenanceController.getCompletedMaintenanceRequests(),
        getMaintenanceRequestById: (requestId) => maintenanceController.getMaintenanceRequestById(requestId),
        updateMaintenanceRequestStatus: (requestId, status, updatedBy, notes) => 
            maintenanceController.updateMaintenanceRequestStatus(requestId, status, updatedBy, notes),
        getCurrentUser: () => authController.getCurrentUser()
    });
    
    const managerView = new ManagerView({
        getAllRooms: () => roomController.getAllRooms(),
        getRoomOccupancyStats: () => roomController.getRoomOccupancyStats(),
        getTodaysCheckIns: () => roomController.getTodaysCheckIns(),
        getTodaysCheckOuts: () => roomController.getTodaysCheckOuts(),
        addRoom: (roomData) => roomController.addRoom(roomData),
        updateRoom: (roomNumber, updates) => roomController.updateRoom(roomNumber, updates),
        deleteRoom: (roomNumber) => roomController.deleteRoom(roomNumber)
    }, reportController);
    
    // Initialize app
    initApp();
    
    /**
     * Initialize the application
     */
    function initApp() {
        console.log('Initializing Hotel Management System...');
        
        // Initialize authentication controller
        authController.init();
        
        // Set up event listeners
        setupEventListeners();
        
        console.log('Hotel Management System initialized successfully');
    }
    
    /**
     * Set up application-wide event listeners
     */
    function setupEventListeners() {
        // Get observer instance (Singleton pattern)
        const observer = Observer.getInstance();
        
        // Listen for user login event
        observer.subscribe('userLoggedIn', (user) => {
            console.log('User logged in:', user);
            
            // Initialize appropriate view based on user role
            if (user.role === 'guest') {
                initializeGuestView();
            } else if (user.role === 'receptionist') {
                initializeReceptionistView();
            } else if (user.role === 'maintenance') {
                initializeMaintenanceView();
            } else if (user.role === 'manager') {
                initializeManagerView();
            }
        });
        
        // Listen for user logout event
        observer.subscribe('userLoggedOut', () => {
            console.log('User logged out');
        });
    }
    
    /**
     * Initialize the guest view
     */
    function initializeGuestView() {
        // Initialize minimum dates for check-in and check-out
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('check-in-date').min = today;
        document.getElementById('check-out-date').min = today;
        
        // Default check-in date to today and check-out to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (!document.getElementById('check-in-date').value) {
            document.getElementById('check-in-date').value = today;
        }
        
        if (!document.getElementById('check-out-date').value) {
            document.getElementById('check-out-date').value = tomorrow.toISOString().split('T')[0];
        }
    }
    
    /**
     * Initialize the receptionist view
     */
    function initializeReceptionistView() {
        // Load today's check-ins and check-outs
        const todayCheckIns = bookingController.getTodaysCheckIns();
        const todayCheckOuts = bookingController.getTodaysCheckOuts();
        
        console.log(`Today's check-ins: ${todayCheckIns.length}`);
        console.log(`Today's check-outs: ${todayCheckOuts.length}`);
    }
    
    /**
     * Initialize the maintenance view
     */
    function initializeMaintenanceView() {
        // Initialize the maintenance staff view
        maintenanceView.init();
    }
    
    /**
     * Initialize the manager view
     */
    function initializeManagerView() {
        // Initialize the manager view
        managerView.init();
    }
});
