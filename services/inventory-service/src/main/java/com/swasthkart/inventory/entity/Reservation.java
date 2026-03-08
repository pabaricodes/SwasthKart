package com.swasthkart.inventory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "reservations")
public class Reservation {

  @Id
  @Column(name = "reservation_id", nullable = false)
  private UUID reservationId;

  @Column(name = "user_id", nullable = true)
  private UUID userId;

  @Column(name = "cart_id", nullable = false)
  private UUID cartId;

  @Column(name = "city_id", nullable = false)
  private String cityId;

  @Column(name = "status", nullable = false)
  private String status;

  @Column(name = "expires_at", nullable = false)
  private Instant expiresAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;
}