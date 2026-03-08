CREATE TABLE inventory_items (
  sku_id           UUID NOT NULL,
  city_id          TEXT NOT NULL,
  on_hand_qty      INT  NOT NULL CHECK (on_hand_qty >= 0),
  reserved_qty     INT  NOT NULL CHECK (reserved_qty >= 0),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (sku_id, city_id)
);

CREATE TABLE reservations (
  reservation_id   UUID PRIMARY KEY,
  user_id          UUID NULL,
  cart_id          UUID NOT NULL,
  city_id          TEXT NOT NULL,
  status           TEXT NOT NULL,
  expires_at       TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reservation_items (
  reservation_id   UUID NOT NULL REFERENCES reservations(reservation_id) ON DELETE CASCADE,
  sku_id           UUID NOT NULL,
  qty              INT  NOT NULL CHECK (qty > 0),
  PRIMARY KEY (reservation_id, sku_id)
);

CREATE INDEX idx_reservations_cart ON reservations(cart_id);
CREATE INDEX idx_reservations_expires ON reservations(expires_at);