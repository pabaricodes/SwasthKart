package com.swasthkart.inventory.api;

import com.swasthkart.inventory.dto.StockResponse;
import com.swasthkart.inventory.service.InventoryQueryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1")
public class StockController {

    private final InventoryQueryService inventoryQueryService;

    public StockController(InventoryQueryService inventoryQueryService) {
        this.inventoryQueryService = inventoryQueryService;
    }

    @GetMapping("/stock/{productId}")
    public StockResponse getStock(@PathVariable UUID productId) {
        return inventoryQueryService.getStockByProductId(productId);
    }

    @PostMapping("/stock/batch")
    public List<StockResponse> getStockBatch(@RequestBody List<UUID> productIds) {
        return inventoryQueryService.getStockByProductIds(productIds);
    }
}
