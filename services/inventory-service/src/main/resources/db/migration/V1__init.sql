CREATE TYPE reservation_status AS ENUM ('HELD', 'CONFIRMED', 'RELEASED', 'EXPIRED');

CREATE TABLE inventory_items (
    sku VARCHAR(50) PRIMARY KEY,
    product_id UUID NOT NULL UNIQUE,
    total_qty INTEGER NOT NULL DEFAULT 0,
    available_qty INTEGER NOT NULL DEFAULT 0,
    reserved_qty INTEGER NOT NULL DEFAULT 0,
    version INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_available_qty_non_negative CHECK (available_qty >= 0),
    CONSTRAINT chk_qty_consistency CHECK (total_qty = available_qty + reserved_qty)
);

CREATE INDEX idx_inventory_product_id ON inventory_items(product_id);

CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status reservation_status NOT NULL DEFAULT 'HELD',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    confirmed_at TIMESTAMP
);

CREATE INDEX idx_reservations_status_expires ON reservations(status, expires_at)
    WHERE status = 'HELD';

CREATE TABLE reservation_items (
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    sku VARCHAR(50) NOT NULL REFERENCES inventory_items(sku),
    qty INTEGER NOT NULL CHECK (qty > 0),
    PRIMARY KEY (reservation_id, sku)
);
