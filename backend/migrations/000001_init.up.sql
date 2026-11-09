CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE products (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        text NOT NULL UNIQUE,
    name        text NOT NULL,
    brand       text NOT NULL DEFAULT '',
    category    text NOT NULL,
    gender      text NOT NULL DEFAULT 'unisex',
    frame_shape text NOT NULL DEFAULT '',
    material    text NOT NULL DEFAULT '',
    color       text NOT NULL DEFAULT '',
    price       integer CHECK (price IS NULL OR price >= 0),
    description text NOT NULL DEFAULT '',
    in_stock    boolean NOT NULL DEFAULT true,
    featured    boolean NOT NULL DEFAULT false,
    sort_order  integer NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_category_idx ON products (category);
CREATE INDEX products_featured_idx ON products (featured) WHERE featured;
CREATE INDEX products_sort_idx ON products (sort_order, created_at DESC);

CREATE TABLE product_images (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    path       text NOT NULL,
    alt        text NOT NULL DEFAULT '',
    position   integer NOT NULL DEFAULT 0
);

CREATE INDEX product_images_product_idx ON product_images (product_id, position);

CREATE TABLE admin_sessions (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash bytea NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL
);

CREATE INDEX admin_sessions_expires_idx ON admin_sessions (expires_at);

