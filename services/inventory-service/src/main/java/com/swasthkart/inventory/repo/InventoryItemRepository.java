package com.swasthkart.inventory.repo;

import com.swasthkart.inventory.entity.InventoryItem;
import com.swasthkart.inventory.entity.InventoryItemKey;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, InventoryItemKey> {
}