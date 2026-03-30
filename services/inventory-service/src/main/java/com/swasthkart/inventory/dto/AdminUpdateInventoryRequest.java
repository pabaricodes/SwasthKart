package com.swasthkart.inventory.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;

public record AdminUpdateInventoryRequest(
    @Min(0) @JsonProperty("total_qty") int totalQty,
    @Min(0) @JsonProperty("available_qty") int availableQty
) {}
