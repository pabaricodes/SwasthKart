package com.swasthkart.inventory.entity;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "reservation_items")
@IdClass(ReservationItemKey.class)
public class ReservationItem {

    @Id
    @Column(name = "reservation_id", nullable = false)
    private UUID reservationId;

    @Id
    @Column(name = "sku", nullable = false, length = 50)
    private String sku;

    @Column(name = "qty", nullable = false)
    private int qty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", insertable = false, updatable = false)
    private Reservation reservation;

    public UUID getReservationId() { return reservationId; }
    public void setReservationId(UUID reservationId) { this.reservationId = reservationId; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public int getQty() { return qty; }
    public void setQty(int qty) { this.qty = qty; }

    public Reservation getReservation() { return reservation; }
    public void setReservation(Reservation reservation) { this.reservation = reservation; }
}
