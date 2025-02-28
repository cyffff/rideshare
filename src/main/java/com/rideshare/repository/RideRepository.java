package com.rideshare.repository;

import com.rideshare.model.Ride;
import com.rideshare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByDriver(User driver);
    List<Ride> findByPassenger(User passenger);
} 