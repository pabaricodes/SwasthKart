package com.swasthkart.inventory.dto;

import java.util.UUID;

public record AdminInventoryResponse(
    String sku,
    UUID productId,
    int totalQty,
    int availableQty,
    int reservedQty
) {
    public static AdminInventoryResponseBuilder builder() {
        return new AdminInventoryResponseBuilder();
    }

    public static class AdminInventoryResponseBuilder {
        private String sku;
        private UUID productId;
        private int totalQty;
        private int availableQty;
        private int reservedQty;

        public AdminInventoryResponseBuilder sku(String sku) { this.sku = sku; return this; }
        public AdminInventoryResponseBuilder productId(UUID productId) { this.productId = productId; return this; }
        public AdminInventoryResponseBuilder totalQty(int totalQty) { this.totalQty = totalQty; return this; }
        public AdminInventoryResponseBuilder availableQty(int availableQty) { this.availableQty = availableQty; return this; }
        public AdminInventoryResponseBuilder reservedQty(int reservedQty) { this.reservedQty = reservedQty; return this; }

        public AdminInventoryResponse build() {
            return new AdminInventoryResponse(sku, productId, totalQty, availableQty, reservedQty);
        }
    }
}
