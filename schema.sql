
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
('MacBook Air M3', 124999.00),
('Dell XPS 15', 159999.00),
('iPhone 15 Pro', 134999.00),
('Samsung Galaxy S24 Ultra', 129999.00),
('Sony Bravia 55 Inch TV', 89999.00),
('LG OLED Evo TV', 149999.00);



INSERT INTO warehouses (name, location) VALUES
('North Zone Warehouse', 'Delhi'),
('South Zone Warehouse', 'Bangalore'),
('West Zone Warehouse', 'Mumbai'),
('East Zone Warehouse', 'Kolkata'),
('Central Zone Warehouse', 'Hyderabad');



INSERT INTO inventory (product_id, warehouse_id, total_stock)
SELECT p.id, w.id,
  CASE

    WHEN p.name = 'MacBook Air M3'
      AND w.name = 'North Zone Warehouse'
      THEN 12

    WHEN p.name = 'MacBook Air M3'
      AND w.name = 'South Zone Warehouse'
      THEN 8

    WHEN p.name = 'MacBook Air M3'
      AND w.name = 'West Zone Warehouse'
      THEN 5

    WHEN p.name = 'MacBook Air M3'
      AND w.name = 'East Zone Warehouse'
      THEN 3

    WHEN p.name = 'MacBook Air M3'
      AND w.name = 'Central Zone Warehouse'
      THEN 6



    WHEN p.name = 'Dell XPS 15'
      AND w.name = 'North Zone Warehouse'
      THEN 10

    WHEN p.name = 'Dell XPS 15'
      AND w.name = 'South Zone Warehouse'
      THEN 7

    WHEN p.name = 'Dell XPS 15'
      AND w.name = 'West Zone Warehouse'
      THEN 4

    WHEN p.name = 'Dell XPS 15'
      AND w.name = 'East Zone Warehouse'
      THEN 2

    WHEN p.name = 'Dell XPS 15'
      AND w.name = 'Central Zone Warehouse'
      THEN 5



    WHEN p.name = 'iPhone 15 Pro'
      AND w.name = 'North Zone Warehouse'
      THEN 20

    WHEN p.name = 'iPhone 15 Pro'
      AND w.name = 'South Zone Warehouse'
      THEN 15

    WHEN p.name = 'iPhone 15 Pro'
      AND w.name = 'West Zone Warehouse'
      THEN 11

    WHEN p.name = 'iPhone 15 Pro'
      AND w.name = 'East Zone Warehouse'
      THEN 7

    WHEN p.name = 'iPhone 15 Pro'
      AND w.name = 'Central Zone Warehouse'
      THEN 9



    WHEN p.name = 'Samsung Galaxy S24 Ultra'
      AND w.name = 'North Zone Warehouse'
      THEN 14

    WHEN p.name = 'Samsung Galaxy S24 Ultra'
      AND w.name = 'South Zone Warehouse'
      THEN 9

    WHEN p.name = 'Samsung Galaxy S24 Ultra'
      AND w.name = 'West Zone Warehouse'
      THEN 6

    WHEN p.name = 'Samsung Galaxy S24 Ultra'
      AND w.name = 'East Zone Warehouse'
      THEN 4

    WHEN p.name = 'Samsung Galaxy S24 Ultra'
      AND w.name = 'Central Zone Warehouse'
      THEN 5



    WHEN p.name = 'Sony Bravia 55 Inch TV'
      AND w.name = 'North Zone Warehouse'
      THEN 8

    WHEN p.name = 'Sony Bravia 55 Inch TV'
      AND w.name = 'South Zone Warehouse'
      THEN 5

    WHEN p.name = 'Sony Bravia 55 Inch TV'
      AND w.name = 'West Zone Warehouse'
      THEN 4

    WHEN p.name = 'Sony Bravia 55 Inch TV'
      AND w.name = 'East Zone Warehouse'
      THEN 2

    WHEN p.name = 'Sony Bravia 55 Inch TV'
      AND w.name = 'Central Zone Warehouse'
      THEN 3



    WHEN p.name = 'LG OLED Evo TV'
      AND w.name = 'North Zone Warehouse'
      THEN 6

    WHEN p.name = 'LG OLED Evo TV'
      AND w.name = 'South Zone Warehouse'
      THEN 4

    WHEN p.name = 'LG OLED Evo TV'
      AND w.name = 'West Zone Warehouse'
      THEN 3

    WHEN p.name = 'LG OLED Evo TV'
      AND w.name = 'East Zone Warehouse'
      THEN 1

    WHEN p.name = 'LG OLED Evo TV'
      AND w.name = 'Central Zone Warehouse'
      THEN 2

    ELSE 0
  END
FROM products p, warehouses w;
