package com.swasthkart.inventory.entity;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class InventoryItemKey implements Serializable {
  private UUID skuId;
  private String cityId;

  public InventoryItemKey() {}

  public InventoryItemKey(UUID skuId, String cityId) {
    this.skuId = skuId;
    this.cityId = cityId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof InventoryItemKey that)) return false;
    return Objects.equals(skuId, that.skuId) && Objects.equals(cityId, that.cityId);
    }

  @Override
  public int hashCode() {
    return Objects.hash(skuId, cityId);
  }
}