package com.hotel.management.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "staff_users")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class StaffUser extends User {
    
    @Column(nullable = false)
    private String department;
    
    @Column(name = "hire_date")
    @Temporal(TemporalType.DATE)
    private Date hireDate = new Date();
    
    @Column(nullable = false)
    private String status = "active";
    
    private String position;
    
    public StaffUser(User user, String department) {
        this.setId(user.getId());
        this.setUsername(user.getUsername());
        this.setPassword(user.getPassword());
        this.setName(user.getName());
        this.setEmail(user.getEmail());
        this.setPhone(user.getPhone());
        this.setRole(user.getRole());
        this.setCreatedDate(user.getCreatedDate());
        this.setLastLoginDate(user.getLastLoginDate());
        this.setEnabled(user.isEnabled());
        this.department = department;
    }
}