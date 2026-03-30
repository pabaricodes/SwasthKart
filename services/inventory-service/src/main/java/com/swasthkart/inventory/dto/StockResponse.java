package com.swasthkart.inventory.dto;

import java.util.UUID;

public record StockResponse(
    UUID productId,
    String sku,
    int availableQty,
    boolean inStock
) {
    public static StockResponseBuilder builder() {
        return new StockResponseBuilder();
    }

    public static class StockResponseBuilder {
        private UUID productId;
        private String sku;
        private int availableQty;
        private boolean inStock;

        public StockResponseBuilder productId(UUID productId) { this.productId = productId; return this; }
        public StockResponseBuilder sku(String sku) { this.sku = sku; return this; }
        public StockResponseBuilder availableQty(int availableQty) { this.availableQty = availableQty; return this; }
        public StockResponseBuilder inStock(boolean inStock) { this.inStock = inStock; return this; }

        public StockResponse build() {
            return new StockResponse(productId, sku, availableQty, inStock);
        }
    }
}
