package com.swasthkart.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record ReserveRequest(
    @NotNull List<Item> items,
    int ttlSeconds
) {
    public record Item(
        @NotNull UUID productId,
        @NotBlank String sku,
        @Min(1) int quantity
    ) {}

    public int effectiveTtl() {
        return ttlSeconds > 0 ? ttlSeconds : 600;
    }
}
