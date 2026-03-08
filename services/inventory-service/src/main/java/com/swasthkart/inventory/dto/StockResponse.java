package com.swasthkart.inventory.dto;

import com.swasthkart.inventory.domain.DeliveryType;
import lombok.Builder;

import java.time.LocalDate;
import java.util.UUID;

@Builder
public record StockResponse(
  UUID skuId,
  String cityId,
  int availableQty,
  DeliveryType deliveryType,
  boolean instant,
  LocalDate earliestDeliveryDate
) {}