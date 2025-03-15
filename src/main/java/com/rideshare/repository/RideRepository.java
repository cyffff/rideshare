package com.rideshare.repository;

import com.rideshare.model.Ride;
import com.rideshare.model.RideStatus;
import com.rideshare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByPassenger(User passenger);
    
    List<Ride> findByDriver(User driver);
    
    List<Ride> findByStatus(RideStatus status);
    
    List<Ride> findByStatusAndIsShared(RideStatus status, Boolean isShared);
    
    @Query("SELECT r FROM Ride r WHERE r.status = :status AND r.driver = NULL")
    List<Ride> findAvailableRides(RideStatus status);
    
    @Query("SELECT r FROM Ride r WHERE r.isScheduled = true AND r.scheduledTime BETWEEN :start AND :end")
    List<Ride> findScheduledRidesBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT r FROM Ride r WHERE r.driver = :driver AND r.status IN ('ACCEPTED', 'DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'IN_PROGRESS')")
    List<Ride> findActiveRidesByDriver(User driver);
    
    @Query("SELECT r FROM Ride r WHERE r.passenger = :passenger AND r.status IN ('ACCEPTED', 'DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'IN_PROGRESS')")
    List<Ride> findActiveRidesByPassenger(User passenger);
} 