package com.hotel.management.dto;

import com.hotel.management.entity.GuestUser;
import com.hotel.management.entity.StaffUser;
import com.hotel.management.entity.User;
import lombok.Data;

import java.util.Date;

@Data
public class UserResponse {
    
    private Long id;
    private String username;
    private String name;
    private String email;
    private String phone;
    private User.Role role;
    private boolean enabled;
    private Date createdDate;
    private Date lastLoginDate;
    
    // Fields specific to GuestUser
    private String preferences;
    private String loyaltyLevel;
    
    // Fields specific to StaffUser
    private String department;
    private String status;
    
    public UserResponse(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.role = user.getRole();
        this.enabled = user.isEnabled();
        this.createdDate = user.getCreatedDate();
        this.lastLoginDate = user.getLastLoginDate();
        
        // Handle specific user types
        if (user instanceof GuestUser) {
            GuestUser guestUser = (GuestUser) user;
            this.preferences = guestUser.getPreferences();
            this.loyaltyLevel = guestUser.getLoyaltyLevel();
        } else if (user instanceof StaffUser) {
            StaffUser staffUser = (StaffUser) user;
            this.department = staffUser.getDepartment();
            this.status = staffUser.getStatus();
        }
    }
}