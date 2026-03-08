package com.swasthkart.inventory.dto;

import lombok.Builder;

@Builder
public record ErrorResponse(
  String code,
  String message
) {}