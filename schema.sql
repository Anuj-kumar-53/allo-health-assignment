
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE products (
  id         UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT          NOT NULL,
  price      NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


CREATE TABLE warehouses (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT        NOT NULL,
  location   TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE inventory (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id     UUID        NOT NULL REFERENCES products(id)   ON DELETE CASCADE,
  warehouse_id   UUID        NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  total_stock    INTEGER     NOT NULL DEFAULT 0 CHECK (total_stock >= 0),
  reserved_stock INTEGER     NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, warehouse_id)
);


CREATE TABLE reservations (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID        NOT NULL REFERENCES products(id)   ON DELETE RESTRICT,
  warehouse_id UUID        NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
  quantity     INTEGER     NOT NULL CHECK (quantity > 0),
  status       TEXT        NOT NULL DEFAULT 'PENDING'
                           CHECK (status IN ('PENDING', 'CONFIRMED', 'RELEASED')),
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_product_warehouse
  ON inventory(product_id, warehouse_id);

CREATE INDEX idx_reservations_status
  ON reservations(status);

CREATE INDEX idx_reservations_pending_expiry
  ON reservations(expires_at)
  WHERE status = 'PENDING';


INSERT INTO products (name, price) VALUES
  ('Sony WH-1000XM5 Headphones',      349.99),
  ('Apple AirPods Pro 2',             249.99),
  ('Samsung Galaxy S24 Ultra',       1299.99),
  ('iPad Air M2',                     599.99),
  ('Keychron Q1 Mechanical Keyboard', 169.99);

INSERT INTO warehouses (name, location) VALUES
  ('East Coast Hub', 'Newark, NJ'),
  ('West Coast Hub', 'Los Angeles, CA'),
  ('Central Hub',    'Chicago, IL');

INSERT INTO inventory (product_id, warehouse_id, total_stock)
SELECT p.id, w.id,
  CASE
    WHEN p.name = 'Sony WH-1000XM5 Headphones'      AND w.name = 'East Coast Hub' THEN 15
    WHEN p.name = 'Sony WH-1000XM5 Headphones'      AND w.name = 'West Coast Hub' THEN 8
    WHEN p.name = 'Sony WH-1000XM5 Headphones'      AND w.name = 'Central Hub'    THEN 1
    WHEN p.name = 'Apple AirPods Pro 2'             AND w.name = 'East Coast Hub' THEN 30
    WHEN p.name = 'Apple AirPods Pro 2'             AND w.name = 'West Coast Hub' THEN 20
    WHEN p.name = 'Apple AirPods Pro 2'             AND w.name = 'Central Hub'    THEN 5
    WHEN p.name = 'Samsung Galaxy S24 Ultra'        AND w.name = 'East Coast Hub' THEN 10
    WHEN p.name = 'Samsung Galaxy S24 Ultra'        AND w.name = 'West Coast Hub' THEN 6
    WHEN p.name = 'Samsung Galaxy S24 Ultra'        AND w.name = 'Central Hub'    THEN 2
    WHEN p.name = 'iPad Air M2'                     AND w.name = 'East Coast Hub' THEN 12
    WHEN p.name = 'iPad Air M2'                     AND w.name = 'West Coast Hub' THEN 9
    WHEN p.name = 'iPad Air M2'                     AND w.name = 'Central Hub'    THEN 3
    WHEN p.name = 'Keychron Q1 Mechanical Keyboard' AND w.name = 'East Coast Hub' THEN 25
    WHEN p.name = 'Keychron Q1 Mechanical Keyboard' AND w.name = 'West Coast Hub' THEN 18
    WHEN p.name = 'Keychron Q1 Mechanical Keyboard' AND w.name = 'Central Hub'    THEN 1
    ELSE 0
  END
FROM products p, warehouses w;
