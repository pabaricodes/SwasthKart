package com.swasthkart.inventory.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AdminCreateInventoryRequest(
    @NotBlank String sku,
    @NotNull @JsonProperty("product_id") UUID productId,
    @Min(0) @JsonProperty("total_qty") int totalQty,
    @Min(0) @JsonProperty("available_qty") int availableQty
) {}
