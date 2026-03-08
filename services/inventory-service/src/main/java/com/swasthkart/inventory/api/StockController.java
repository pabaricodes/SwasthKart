package com.swasthkart.inventory.api;

import com.swasthkart.inventory.dto.StockResponse;
import com.swasthkart.inventory.service.InventoryQueryService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/inventory")
public class StockController {

  private final InventoryQueryService inventoryQueryService;

  @GetMapping("/stock")
  public StockResponse getStock(
    @RequestParam("skuId") @NotNull UUID skuId,
    @RequestParam("cityId") @NotBlank String cityId
  ) {
    return inventoryQueryService.getStock(skuId, cityId);
  }
}