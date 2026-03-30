package com.swasthkart.inventory.service;

import com.swasthkart.inventory.domain.ReservationStatus;
import com.swasthkart.inventory.dto.ReserveRequest;
import com.swasthkart.inventory.dto.ReserveResponse;
import com.swasthkart.inventory.entity.InventoryItem;
import com.swasthkart.inventory.entity.Reservation;
import com.swasthkart.inventory.entity.ReservationItem;
import com.swasthkart.inventory.repo.InventoryItemRepository;
import com.swasthkart.inventory.repo.ReservationItemRepository;
import com.swasthkart.inventory.repo.ReservationRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ReservationService {

    private static final Logger log = LoggerFactory.getLogger(ReservationService.class);

    private final InventoryItemRepository inventoryItemRepo;
    private final ReservationRepository reservationRepo;
    private final ReservationItemRepository reservationItemRepo;

    public ReservationService(InventoryItemRepository inventoryItemRepo,
                              ReservationRepository reservationRepo,
                              ReservationItemRepository reservationItemRepo) {
        this.inventoryItemRepo = inventoryItemRepo;
        this.reservationRepo = reservationRepo;
        this.reservationItemRepo = reservationItemRepo;
    }

    @Transactional
    public ReserveResponse reserve(ReserveRequest req) {
        UUID reservationId = UUID.randomUUID();
        Instant expiresAt = Instant.now().plusSeconds(req.effectiveTtl());
        List<ReserveResponse.FailedItem> failedItems = new ArrayList<>();

        // Check all items first
        for (ReserveRequest.Item itemReq : req.items()) {
            InventoryItem inv = inventoryItemRepo.findById(itemReq.sku()).orElse(null);
            if (inv == null || inv.getAvailableQty() < itemReq.quantity()) {
                failedItems.add(ReserveResponse.FailedItem.builder()
                        .productId(itemReq.productId())
                        .sku(itemReq.sku())
                        .availableQty(inv != null ? inv.getAvailableQty() : 0)
                        .requestedQty(itemReq.quantity())
                        .build());
            }
        }

        if (!failedItems.isEmpty()) {
            return ReserveResponse.builder()
                    .reservationId(reservationId)
                    .status("INSUFFICIENT_STOCK")
                    .failedItems(failedItems)
                    .build();
        }

        // Reserve all items
        Reservation reservation = new Reservation();
        reservation.setId(reservationId);
        reservation.setStatus(ReservationStatus.HELD);
        reservation.setExpiresAt(expiresAt);
        reservationRepo.save(reservation);

        for (ReserveRequest.Item itemReq : req.items()) {
            InventoryItem inv = inventoryItemRepo.findById(itemReq.sku()).orElseThrow();
            inv.setAvailableQty(inv.getAvailableQty() - itemReq.quantity());
            inv.setReservedQty(inv.getReservedQty() + itemReq.quantity());
            inventoryItemRepo.save(inv);

            ReservationItem ri = new ReservationItem();
            ri.setReservationId(reservationId);
            ri.setSku(itemReq.sku());
            ri.setQty(itemReq.quantity());
            reservationItemRepo.save(ri);
        }

        return ReserveResponse.builder()
                .reservationId(reservationId)
                .status("HELD")
                .expiresAt(expiresAt)
                .failedItems(List.of())
                .build();
    }

    @Transactional
    public String confirm(UUID reservationId) {
        Reservation reservation = reservationRepo.findById(reservationId).orElse(null);
        if (reservation == null) return "NOT_FOUND";
        if (reservation.getStatus() == ReservationStatus.CONFIRMED) return "ALREADY_CONFIRMED";
        if (reservation.getStatus() == ReservationStatus.EXPIRED) return "EXPIRED";
        if (reservation.getStatus() != ReservationStatus.HELD) return "NOT_FOUND";

        // Deduct from total, clear reserved
        List<ReservationItem> items = reservationItemRepo.findByReservationId(reservationId);
        for (ReservationItem ri : items) {
            InventoryItem inv = inventoryItemRepo.findById(ri.getSku()).orElseThrow();
            inv.setTotalQty(inv.getTotalQty() - ri.getQty());
            inv.setReservedQty(inv.getReservedQty() - ri.getQty());
            inventoryItemRepo.save(inv);
        }

        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservation.setConfirmedAt(Instant.now());
        reservationRepo.save(reservation);
        return "CONFIRMED";
    }

    @Transactional
    public String release(UUID reservationId) {
        Reservation reservation = reservationRepo.findById(reservationId).orElse(null);
        if (reservation == null) return "NOT_FOUND";
        if (reservation.getStatus() == ReservationStatus.RELEASED) return "ALREADY_RELEASED";
        if (reservation.getStatus() != ReservationStatus.HELD) return "NOT_FOUND";

        releaseReservation(reservation);
        return "RELEASED";
    }

    /**
     * Expire stale reservations every 60 seconds.
     */
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void expireStaleReservations() {
        List<Reservation> stale = reservationRepo.findByStatusAndExpiresAtBefore(
                ReservationStatus.HELD, Instant.now());
        for (Reservation reservation : stale) {
            releaseReservation(reservation);
            reservation.setStatus(ReservationStatus.EXPIRED);
            reservationRepo.save(reservation);
            log.info("Expired reservation {}", reservation.getId());
        }
    }

    private void releaseReservation(Reservation reservation) {
        List<ReservationItem> items = reservationItemRepo.findByReservationId(reservation.getId());
        for (ReservationItem ri : items) {
            InventoryItem inv = inventoryItemRepo.findById(ri.getSku()).orElseThrow();
            inv.setAvailableQty(inv.getAvailableQty() + ri.getQty());
            inv.setReservedQty(inv.getReservedQty() - ri.getQty());
            inventoryItemRepo.save(inv);
        }
        reservation.setStatus(ReservationStatus.RELEASED);
        reservationRepo.save(reservation);
    }
}
