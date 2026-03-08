package com.swasthkart.inventory.dto;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record ReserveResponse(
  UUID reservationId,
  Instant expiresAt
) {}