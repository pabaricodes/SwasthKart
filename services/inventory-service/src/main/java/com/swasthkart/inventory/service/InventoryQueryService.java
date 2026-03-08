package com.swasthkart.inventory.service;

import com.swasthkart.inventory.domain.DeliveryType;
import com.swasthkart.inventory.dto.StockResponse;
import com.swasthkart.inventory.entity.InventoryItem;
import com.swasthkart.inventory.repo.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryQueryService {

  private final InventoryItemRepository inventoryItemRepository;

  public StockResponse getStock(UUID skuId, String cityId) {
    InventoryItem item = inventoryItemRepository.findById(new com.swasthkart.inventory.entity.InventoryItemKey(skuId, cityId))
      .orElse(null);

    int available = 0;
    if (item != null) {
      available = Math.max(item.getOnHandQty() - item.getReservedQty(), 0);
    }

    // MVP delivery logic:
    // - If available > 0 => INSTANT (same-day tag)
    // - Else => SCHEDULED (earliest date = tomorrow)
    boolean instant = available > 0;
    DeliveryType deliveryType = instant ? DeliveryType.INSTANT : DeliveryType.SCHEDULED;
    LocalDate earliest = instant ? LocalDate.now() : LocalDate.now().plusDays(1);

    return StockResponse.builder()
      .skuId(skuId)
      .cityId(cityId)
      .availableQty(available)
      .deliveryType(deliveryType)
      .instant(instant)
      .earliestDeliveryDate(earliest)
      .build();
  }
}