package com.swasthkart.inventory.entity;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class ReservationItemKey implements Serializable {
    private UUID reservationId;
    private String sku;

    public ReservationItemKey() {}

    public ReservationItemKey(UUID reservationId, String sku) {
        this.reservationId = reservationId;
        this.sku = sku;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ReservationItemKey that)) return false;
        return Objects.equals(reservationId, that.reservationId) && Objects.equals(sku, that.sku);
    }

    @Override
    public int hashCode() {
        return Objects.hash(reservationId, sku);
    }
}
