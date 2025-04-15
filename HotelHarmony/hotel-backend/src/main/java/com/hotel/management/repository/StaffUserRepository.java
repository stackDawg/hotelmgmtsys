package com.hotel.management.repository;

import com.hotel.management.entity.StaffUser;
import com.hotel.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffUserRepository extends JpaRepository<StaffUser, Long> {
    
    List<StaffUser> findByDepartment(String department);
    
    List<StaffUser> findByRole(User.Role role);
    
    List<StaffUser> findByStatus(String status);
}