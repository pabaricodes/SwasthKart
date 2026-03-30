package com.swasthkart.inventory.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ReserveResponse(
    UUID reservationId,
    String status,
    Instant expiresAt,
    List<FailedItem> failedItems
) {
    public static ReserveResponseBuilder builder() {
        return new ReserveResponseBuilder();
    }

    public static class ReserveResponseBuilder {
        private UUID reservationId;
        private String status;
        private Instant expiresAt;
        private List<FailedItem> failedItems;

        public ReserveResponseBuilder reservationId(UUID reservationId) { this.reservationId = reservationId; return this; }
        public ReserveResponseBuilder status(String status) { this.status = status; return this; }
        public ReserveResponseBuilder expiresAt(Instant expiresAt) { this.expiresAt = expiresAt; return this; }
        public ReserveResponseBuilder failedItems(List<FailedItem> failedItems) { this.failedItems = failedItems; return this; }

        public ReserveResponse build() {
            return new ReserveResponse(reservationId, status, expiresAt, failedItems);
        }
    }

    public record FailedItem(
        UUID productId,
        String sku,
        int availableQty,
        int requestedQty
    ) {
        public static FailedItemBuilder builder() {
            return new FailedItemBuilder();
        }

        public static class FailedItemBuilder {
            private UUID productId;
            private String sku;
            private int availableQty;
            private int requestedQty;

            public FailedItemBuilder productId(UUID productId) { this.productId = productId; return this; }
            public FailedItemBuilder sku(String sku) { this.sku = sku; return this; }
            public FailedItemBuilder availableQty(int availableQty) { this.availableQty = availableQty; return this; }
            public FailedItemBuilder requestedQty(int requestedQty) { this.requestedQty = requestedQty; return this; }

            public FailedItem build() {
                return new FailedItem(productId, sku, availableQty, requestedQty);
            }
        }
    }
}
