package com.swasthkart.inventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "reservation_items")
@IdClass(ReservationItemKey.class)
public class ReservationItem {

  @Id
  @Column(name = "reservation_id", nullable = false)
  private UUID reservationId;

  @Id
  @Column(name = "sku_id", nullable = false)
  private UUID skuId;

  @Column(name = "qty", nullable = false)
  private int qty;
}