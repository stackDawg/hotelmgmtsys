package com.hotel.management.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "guest_users")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class GuestUser extends User {
    
    @OneToMany(mappedBy = "guest")
    private List<Booking> bookings = new ArrayList<>();
    
    private String loyaltyPoints = "0";
    
    private String preferences;
    
    public GuestUser(User user) {
        this.setId(user.getId());
        this.setUsername(user.getUsername());
        this.setPassword(user.getPassword());
        this.setName(user.getName());
        this.setEmail(user.getEmail());
        this.setPhone(user.getPhone());
        this.setRole(Role.GUEST);
        this.setCreatedDate(user.getCreatedDate());
        this.setLastLoginDate(user.getLastLoginDate());
        this.setEnabled(user.isEnabled());
    }
}