package com.swasthkart.inventory.repo;

import com.swasthkart.inventory.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, String> {
    Optional<InventoryItem> findByProductId(UUID productId);
    List<InventoryItem> findByProductIdIn(List<UUID> productIds);
}
