package com.hotel.management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "maintenance_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne
    @JoinColumn(name = "reported_by")
    private User reportedBy;

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private StaffUser assignedTo;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private IssueType issueType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status = Status.OPEN;

    @Column(name = "created_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate = new Date();

    @Column(name = "assigned_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date assignedDate;

    @Column(name = "completed_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date completedDate;

    @Column(name = "estimated_time")
    private Integer estimatedTime; // in minutes

    @Column(name = "actual_time")
    private Integer actualTime; // in minutes

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "resolution_details", columnDefinition = "TEXT")
    private String resolutionDetails;

    public enum IssueType {
        PLUMBING,
        ELECTRICAL,
        FURNITURE,
        HVAC,
        CLEANLINESS,
        SAFETY,
        OTHER
    }

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        URGENT
    }

    public enum Status {
        OPEN,
        ASSIGNED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
}