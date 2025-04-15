package com.hotel.management.service;

import com.hotel.management.entity.GuestUser;
import com.hotel.management.entity.StaffUser;
import com.hotel.management.entity.User;
import com.hotel.management.exception.ResourceNotFoundException;
import com.hotel.management.repository.GuestUserRepository;
import com.hotel.management.repository.StaffUserRepository;
import com.hotel.management.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final GuestUserRepository guestUserRepository;
    private final StaffUserRepository staffUserRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, 
                      GuestUserRepository guestUserRepository, 
                      StaffUserRepository staffUserRepository, 
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.guestUserRepository = guestUserRepository;
        this.staffUserRepository = staffUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    @Transactional
    public User registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Save basic user info
        User savedUser = userRepository.save(user);
        
        // Based on role, create specific user type
        if (user.getRole() == User.Role.GUEST) {
            GuestUser guestUser = new GuestUser(savedUser);
            return guestUserRepository.save(guestUser);
        } else {
            StaffUser staffUser = new StaffUser(savedUser, "Default");
            return staffUserRepository.save(staffUser);
        }
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
    
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    @Transactional
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        
        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());
        user.setPhone(userDetails.getPhone());
        user.setEnabled(userDetails.isEnabled());
        
        return userRepository.save(user);
    }
    
    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }
    
    @Transactional
    public void updateLastLoginDate(String username) {
        User user = getUserByUsername(username);
        user.setLastLoginDate(new Date());
        userRepository.save(user);
    }
    
    public List<StaffUser> getStaffByDepartment(String department) {
        return staffUserRepository.findByDepartment(department);
    }
    
    public List<StaffUser> getStaffByRole(User.Role role) {
        return staffUserRepository.findByRole(role);
    }
    
    @Transactional
    public StaffUser updateStaffStatus(Long id, String status) {
        User user = getUserById(id);
        if (!(user instanceof StaffUser)) {
            throw new RuntimeException("User is not a staff member");
        }
        
        StaffUser staffUser = (StaffUser) user;
        staffUser.setStatus(status);
        return staffUserRepository.save(staffUser);
    }
}