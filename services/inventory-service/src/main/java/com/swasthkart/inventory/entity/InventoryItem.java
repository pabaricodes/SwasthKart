package com.swasthkart.inventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "inventory_items")
@IdClass(InventoryItemKey.class)
public class InventoryItem {

  @Id
  @Column(name = "sku_id", nullable = false)
  private UUID skuId;

  @Id
  @Column(name = "city_id", nullable = false)
  private String cityId;

  @Column(name = "on_hand_qty", nullable = false)
  private int onHandQty;

  @Column(name = "reserved_qty", nullable = false)
  private int reservedQty;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;
}