-- name: ListProducts :many
SELECT * FROM products
WHERE (sqlc.narg('category')::text IS NULL OR category = sqlc.narg('category'))
  AND (sqlc.narg('gender')::text IS NULL OR gender = sqlc.narg('gender'))
  AND (sqlc.narg('frame_shape')::text IS NULL OR frame_shape = sqlc.narg('frame_shape'))
  AND (sqlc.narg('featured')::boolean IS NULL OR featured = sqlc.narg('featured'))
  AND (sqlc.narg('in_stock')::boolean IS NULL OR in_stock = sqlc.narg('in_stock'))
  AND (sqlc.narg('q')::text IS NULL OR (
      name ILIKE '%' || sqlc.narg('q') || '%' OR
      brand ILIKE '%' || sqlc.narg('q') || '%' OR
      description ILIKE '%' || sqlc.narg('q') || '%'
  ))
ORDER BY sort_order, created_at DESC
LIMIT sqlc.arg('lim') OFFSET sqlc.arg('off');

-- name: GetProductBySlug :one
SELECT * FROM products WHERE slug = $1;

-- name: GetProduct :one
SELECT * FROM products WHERE id = $1;

-- name: SlugExists :one
SELECT EXISTS(SELECT 1 FROM products WHERE slug = $1 AND (sqlc.narg('exclude_id')::uuid IS NULL OR id != sqlc.narg('exclude_id')));

-- name: ListRelatedProducts :many
SELECT * FROM products
WHERE slug != sqlc.arg('slug')
  AND (category = sqlc.arg('category') OR (brand != '' AND brand = sqlc.arg('brand')) OR (frame_shape != '' AND frame_shape = sqlc.arg('frame_shape')))
ORDER BY
  CASE WHEN category = sqlc.arg('category') THEN 0 ELSE 1 END,
  sort_order, created_at DESC
LIMIT 4;

-- name: CreateProduct :one
INSERT INTO products (
    slug, name, brand, category, gender, frame_shape, material, color,
    price, description, in_stock, featured, sort_order
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
RETURNING *;

-- name: UpdateProduct :one
UPDATE products SET
    slug = $2, name = $3, brand = $4, category = $5, gender = $6,
    frame_shape = $7, material = $8, color = $9, price = $10,
    description = $11, in_stock = $12, featured = $13, sort_order = $14,
    updated_at = now()
WHERE id = $1
RETURNING *;

-- name: UpdateProductStock :one
UPDATE products SET in_stock = $2, updated_at = now() WHERE id = $1 RETURNING *;

-- name: UpdateProductFeatured :one
UPDATE products SET featured = $2, updated_at = now() WHERE id = $1 RETURNING *;

-- name: DeleteProduct :execrows
DELETE FROM products WHERE id = $1;

-- name: ListProductImages :many
SELECT * FROM product_images WHERE product_id = $1 ORDER BY position;

-- name: ListImagesByProductIDs :many
SELECT * FROM product_images WHERE product_id = ANY(sqlc.arg('product_ids')::uuid[]) ORDER BY product_id, position;

-- name: AddProductImage :one
INSERT INTO product_images (product_id, path, alt, position)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: DeleteProductImage :one
DELETE FROM product_images WHERE id = $1 AND product_id = $2
RETURNING *;

-- name: UpdateProductImagePosition :execrows
UPDATE product_images SET position = $3 WHERE id = $1 AND product_id = $2;

-- name: CountProductImages :one
SELECT COUNT(*)::int FROM product_images WHERE product_id = $1;

