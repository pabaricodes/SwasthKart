package com.swasthkart.inventory.service;

import com.swasthkart.inventory.dto.AdminCreateInventoryRequest;
import com.swasthkart.inventory.dto.AdminInventoryResponse;
import com.swasthkart.inventory.dto.AdminUpdateInventoryRequest;
import com.swasthkart.inventory.entity.InventoryItem;
import com.swasthkart.inventory.repo.InventoryItemRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminInventoryService {

    private final InventoryItemRepository inventoryItemRepository;

    public AdminInventoryService(InventoryItemRepository inventoryItemRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
    }

    @Transactional(readOnly = true)
    public Page<AdminInventoryResponse> listAll(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("sku").ascending());
        return inventoryItemRepository.findAll(pageRequest).map(this::toResponse);
    }

    @Transactional
    public AdminInventoryResponse updateStock(String sku, AdminUpdateInventoryRequest request) {
        InventoryItem item = inventoryItemRepository.findById(sku)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found for SKU: " + sku));

        item.setTotalQty(request.totalQty());
        item.setAvailableQty(request.availableQty());
        item.setReservedQty(request.totalQty() - request.availableQty());

        InventoryItem saved = inventoryItemRepository.save(item);
        return toResponse(saved);
    }

    @Transactional
    public AdminInventoryResponse create(AdminCreateInventoryRequest request) {
        if (inventoryItemRepository.existsById(request.sku())) {
            throw new IllegalArgumentException("Inventory item already exists for SKU: " + request.sku());
        }

        InventoryItem item = new InventoryItem();
        item.setSku(request.sku());
        item.setProductId(request.productId());
        item.setTotalQty(request.totalQty());
        item.setAvailableQty(request.availableQty());
        item.setReservedQty(request.totalQty() - request.availableQty());

        InventoryItem saved = inventoryItemRepository.save(item);
        return toResponse(saved);
    }

    private AdminInventoryResponse toResponse(InventoryItem item) {
        return AdminInventoryResponse.builder()
                .sku(item.getSku())
                .productId(item.getProductId())
                .totalQty(item.getTotalQty())
                .availableQty(item.getAvailableQty())
                .reservedQty(item.getReservedQty())
                .build();
    }
}
