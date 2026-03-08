package com.swasthkart.inventory.service;

import com.swasthkart.inventory.domain.ReservationStatus;
import com.swasthkart.inventory.dto.ReserveRequest;
import com.swasthkart.inventory.dto.ReserveResponse;
import com.swasthkart.inventory.entity.InventoryItem;
import com.swasthkart.inventory.entity.InventoryItemKey;
import com.swasthkart.inventory.entity.Reservation;
import com.swasthkart.inventory.entity.ReservationItem;
import com.swasthkart.inventory.repo.InventoryItemRepository;
import com.swasthkart.inventory.repo.ReservationItemRepository;
import com.swasthkart.inventory.repo.ReservationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReservationService {

  private final InventoryItemRepository inventoryItemRepository;
  private final ReservationRepository reservationRepository;
  private final ReservationItemRepository reservationItemRepository;

  @Value("${inventory.reservation.ttlSeconds:600}")
  private long ttlSeconds;

  @Transactional
  public ReserveResponse reserve(ReserveRequest req) {
    // MVP rule: "reserve" means increment reserved_qty so others see reduced availability.
    // We do NOT implement expiry cleanup job yet (later); expiry is stored.

    UUID reservationId = UUID.randomUUID();
    Instant expiresAt = Instant.now().plusSeconds(ttlSeconds);

    Reservation reservation = new Reservation();
    reservation.setReservationId(reservationId);
    reservation.setUserId(req.userId());
    reservation.setCartId(req.cartId());
    reservation.setCityId(req.cityId());
    reservation.setStatus(ReservationStatus.ACTIVE.name());
    reservation.setExpiresAt(expiresAt);
    reservation.setCreatedAt(Instant.now());
    reservationRepository.save(reservation);

    for (ReserveRequest.Item itemReq : req.items()) {
      InventoryItemKey key = new InventoryItemKey(itemReq.skuId(), req.cityId());
      InventoryItem inv = inventoryItemRepository.findById(key)
        .orElseThrow(() -> new IllegalArgumentException("SKU not found in city: " + itemReq.skuId()));

      int available = inv.getOnHandQty() - inv.getReservedQty();
      if (available < itemReq.qty()) {
        throw new IllegalArgumentException("Insufficient stock for skuId=" + itemReq.skuId());
      }

      inv.setReservedQty(inv.getReservedQty() + itemReq.qty());
      inv.setUpdatedAt(Instant.now());
      inventoryItemRepository.save(inv);

      ReservationItem ri = new ReservationItem();
      ri.setReservationId(reservationId);
      ri.setSkuId(itemReq.skuId());
      ri.setQty(itemReq.qty());
      reservationItemRepository.save(ri);
    }

    return ReserveResponse.builder()
      .reservationId(reservationId)
      .expiresAt(expiresAt)
      .build();
  }

  @Transactional
  public void cancel(UUID reservationId) {
    Reservation reservation = reservationRepository.findById(reservationId)
      .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

    if (!ReservationStatus.ACTIVE.name().equals(reservation.getStatus())) {
      return;
    }

    // decrement reserved_qty back
    var items = reservationItemRepository.findAll().stream()
      .filter(x -> x.getReservationId().equals(reservationId))
      .toList();

    for (var item : items) {
      InventoryItemKey key = new InventoryItemKey(item.getSkuId(), reservation.getCityId());
      InventoryItem inv = inventoryItemRepository.findById(key)
        .orElseThrow(() -> new IllegalArgumentException("SKU not found in city: " + item.getSkuId()));

      inv.setReservedQty(Math.max(inv.getReservedQty() - item.getQty(), 0));
      inv.setUpdatedAt(Instant.now());
      inventoryItemRepository.save(inv);
    }

    reservation.setStatus(ReservationStatus.CANCELLED.name());
    reservationRepository.save(reservation);
  }
}