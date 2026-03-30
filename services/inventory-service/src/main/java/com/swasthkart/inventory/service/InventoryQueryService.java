package com.swasthkart.inventory.service;

import com.swasthkart.inventory.dto.StockResponse;
import com.swasthkart.inventory.entity.InventoryItem;
import com.swasthkart.inventory.repo.InventoryItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class InventoryQueryService {

    private final InventoryItemRepository inventoryItemRepository;

    public InventoryQueryService(InventoryItemRepository inventoryItemRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
    }

    public StockResponse getStockByProductId(UUID productId) {
        InventoryItem item = inventoryItemRepository.findByProductId(productId).orElse(null);
        if (item == null) {
            return StockResponse.builder()
                    .productId(productId)
                    .sku("")
                    .availableQty(0)
                    .inStock(false)
                    .build();
        }
        return StockResponse.builder()
                .productId(item.getProductId())
                .sku(item.getSku())
                .availableQty(item.getAvailableQty())
                .inStock(item.getAvailableQty() > 0)
                .build();
    }

    public List<StockResponse> getStockByProductIds(List<UUID> productIds) {
        List<InventoryItem> items = inventoryItemRepository.findByProductIdIn(productIds);
        return productIds.stream().<StockResponse>map(pid -> {
            InventoryItem item = items.stream()
                    .filter(i -> i.getProductId().equals(pid))
                    .findFirst()
                    .orElse(null);
            if (item == null) {
                return StockResponse.builder()
                        .productId(pid)
                        .sku("")
                        .availableQty(0)
                        .inStock(false)
                        .build();
            }
            return StockResponse.builder()
                    .productId(item.getProductId())
                    .sku(item.getSku())
                    .availableQty(item.getAvailableQty())
                    .inStock(item.getAvailableQty() > 0)
                    .build();
        }).toList();
    }
}
