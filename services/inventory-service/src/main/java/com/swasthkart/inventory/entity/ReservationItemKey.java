package com.swasthkart.inventory.entity;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class ReservationItemKey implements Serializable {
  private UUID reservationId;
  private UUID skuId;

  public ReservationItemKey() {}

  public ReservationItemKey(UUID reservationId, UUID skuId) {
    this.reservationId = reservationId;
    this.skuId = skuId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof ReservationItemKey that)) return false;
    return Objects.equals(reservationId, that.reservationId) && Objects.equals(skuId, that.skuId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(reservationId, skuId);
  }
}