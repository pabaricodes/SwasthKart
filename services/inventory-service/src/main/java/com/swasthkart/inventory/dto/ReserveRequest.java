package com.swasthkart.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record ReserveRequest(
  UUID userId,
  @NotNull UUID cartId,
  @NotBlank String cityId,
  @NotNull List<Item> items
) {
  public record Item(
    @NotNull UUID skuId,
    @Min(1) int qty
  ) {}
}