package com.swasthkart.inventory.repo;

import com.swasthkart.inventory.domain.ReservationStatus;
import com.swasthkart.inventory.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
    List<Reservation> findByStatusAndExpiresAtBefore(ReservationStatus status, Instant before);
}
