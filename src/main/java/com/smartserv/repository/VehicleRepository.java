package com.smartserv.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartserv.entity.Vehicle;


public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByIsActiveTrue();

    boolean existsByLicensePlate(String licensePlate);

    Optional<Vehicle> findByLicensePlateAndIsActiveTrue(String licensePlate);

    List<Vehicle> findByCustomerIdAndIsActiveTrue(Long customerID);

    Optional<Vehicle> findByIdAndIsActiveTrue(Long id);

}

