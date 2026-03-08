package com.swasthkart.inventory.repo;

import com.swasthkart.inventory.entity.ReservationItem;
import com.swasthkart.inventory.entity.ReservationItemKey;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationItemRepository extends JpaRepository<ReservationItem, ReservationItemKey> {
}