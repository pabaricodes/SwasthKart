package com.swasthkart.inventory.repo;

import com.swasthkart.inventory.entity.ReservationItem;
import com.swasthkart.inventory.entity.ReservationItemKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReservationItemRepository extends JpaRepository<ReservationItem, ReservationItemKey> {
    List<ReservationItem> findByReservationId(UUID reservationId);
}
