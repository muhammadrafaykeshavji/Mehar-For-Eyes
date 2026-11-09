ALTER TABLE site_settings
    ADD COLUMN IF NOT EXISTS theme_preset TEXT NOT NULL DEFAULT 'modern_glass',
    ADD COLUMN IF NOT EXISTS hero_layout TEXT NOT NULL DEFAULT 'bento',
    ADD COLUMN IF NOT EXISTS card_style TEXT NOT NULL DEFAULT 'rounded',
    ADD COLUMN IF NOT EXISTS admin_theme TEXT NOT NULL DEFAULT 'dark_slate',
    ADD COLUMN IF NOT EXISTS bg_color TEXT NOT NULL DEFAULT '#F8FAFC',
    ADD COLUMN IF NOT EXISTS surface_color TEXT NOT NULL DEFAULT '#EEF2F6',
    ADD COLUMN IF NOT EXISTS text_color TEXT NOT NULL DEFAULT '#0F172A',
    ADD COLUMN IF NOT EXISTS accent_color TEXT NOT NULL DEFAULT '#2563EB',
    ADD COLUMN IF NOT EXISTS hero_image_url TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS hero_badge TEXT NOT NULL DEFAULT 'IN-HOUSE OPTICAL LAB · LAHORE',
    ADD COLUMN IF NOT EXISTS announcement_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS announcement_text TEXT NOT NULL DEFAULT 'Free Anti-Glare & UV400 Coating on all Prescription Orders · Send your Rx on WhatsApp for Same-Day Fitting',
    ADD COLUMN IF NOT EXISTS show_face_shape_guide BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS face_shape_heading TEXT NOT NULL DEFAULT 'Find Frames for Your Face Shape',
    ADD COLUMN IF NOT EXISTS face_shape_subtitle TEXT NOT NULL DEFAULT 'Select your face shape below to see which frame geometries balance your features best.',
    ADD COLUMN IF NOT EXISTS show_lens_guide BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS lens_guide_heading TEXT NOT NULL DEFAULT 'Custom Prescription Lenses & Coatings',
    ADD COLUMN IF NOT EXISTS lens_guide_subtitle TEXT NOT NULL DEFAULT 'Every frame can be fitted with zero-power blue-cut or your exact prescription in our optical lab.',
    ADD COLUMN IF NOT EXISTS lens_options_json TEXT NOT NULL DEFAULT '[{"title":"Single-Vision & Digital Blue-Cut","badge":"Most Popular","description":"Crystal-clear distance or reading lenses with blue-light filtering and anti-glare coating for 8+ hour screen comfort.","price_hint":"From Rs. 2,500"},{"title":"Photochromic (Transitions® Style)","badge":"Indoor + Outdoor","description":"Intelligently darkens in outdoor UV sunlight within seconds and returns to 100% clear indoors.","price_hint":"From Rs. 4,500"},{"title":"Progressive No-Line Multifocal","badge":"All-in-One","description":"Seamless distance, intermediate dashboard, and near reading vision in one lens with zero visible dividing lines.","price_hint":"From Rs. 8,500"},{"title":"Hi-Index Ultra-Thin (1.67 / 1.74)","badge":"High Power","description":"Up to 45% thinner and lighter lenses for stronger prescriptions so your eyes never look magnified.","price_hint":"From Rs. 6,000"}]';

-- Seed initial optical & sunglass frames into PostgreSQL if the catalog is empty.
-- These are normal database rows: fully editable, re-priceable, and deletable from the Admin Portal.
DO $$
DECLARE
    p_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
        -- 1. Aether Aviator 24K Gold
        INSERT INTO products (slug, name, brand, category, gender, frame_shape, material, color, price, description, in_stock, featured, sort_order)
        VALUES ('aether-aviator-24k-gold', 'Aether Aviator 24K Gold', 'Mehar Atelier', 'sunglasses', 'unisex', 'aviator', 'Japanese Beta-Titanium', 'Brushed Champagne Gold / G15 Lens', 6800, 'Featherweight beta-titanium double-bridge aviator with polarized UV400 green mineral glass lenses and adjustable silicone nose pads.', TRUE, TRUE, 1)
        RETURNING id INTO p_id;
        INSERT INTO product_images (product_id, path, alt, position)
        VALUES (p_id, '/images/products/aviator-gold.jpg', 'Aether Aviator 24K Gold', 0);

        -- 2. Kyoto Round Havana Tortoise
        INSERT INTO products (slug, name, brand, category, gender, frame_shape, material, color, price, description, in_stock, featured, sort_order)
        VALUES ('kyoto-round-havana-tortoise', 'Kyoto Round Havana Tortoise', 'Mehar Studio', 'eyeglasses', 'unisex', 'round', 'Mazzucchelli Acetate', 'Warm Amber Tortoiseshell', 5200, 'Hand-polished Italian tortoise acetate with a keyhole bridge and 5-barrel German hinges. Ideal for single-vision, blue-cut, or progressive lenses.', TRUE, TRUE, 2)
        RETURNING id INTO p_id;
        INSERT INTO product_images (product_id, path, alt, position)
        VALUES (p_id, '/images/products/round-tortoise.jpg', 'Kyoto Round Havana Tortoise', 0);

        -- 3. Architect Rectangle Obsidian
        INSERT INTO products (slug, name, brand, category, gender, frame_shape, material, color, price, description, in_stock, featured, sort_order)
        VALUES ('architect-rectangle-obsidian', 'Architect Rectangle Obsidian', 'Mehar Optical', 'eyeglasses', 'men', 'rectangle', 'High-Density Acetate & Steel Core', 'Obsidian Matte Black', 4900, 'Crisp architectural rectangular silhouette engineered for all-day prescription wear. Balances round and oval face shapes with clean horizontal lines.', TRUE, TRUE, 3)
        RETURNING id INTO p_id;
        INSERT INTO product_images (product_id, path, alt, position)
        VALUES (p_id, '/images/products/rectangle-black.jpg', 'Architect Rectangle Obsidian', 0);

        -- 4. Velours Cat-Eye Bordeaux
        INSERT INTO products (slug, name, brand, category, gender, frame_shape, material, color, price, description, in_stock, featured, sort_order)
        VALUES ('velours-cat-eye-bordeaux', 'Velours Cat-Eye Bordeaux', 'Mehar Atelier', 'eyeglasses', 'women', 'cat-eye', 'Sculpted Italian Acetate', 'Deep Burgundy & Rose Gold Pins', 5600, 'Subtle upswept cat-eye frame in rich burgundy acetate that lifts the cheekbones while accommodating high-index and progressive prescriptions.', TRUE, TRUE, 4)
        RETURNING id INTO p_id;
        INSERT INTO product_images (product_id, path, alt, position)
        VALUES (p_id, '/images/products/cat-eye-burgundy.jpg', 'Velours Cat-Eye Bordeaux', 0);

        -- 5. Nomad Wayfarer Stealth Matte
        INSERT INTO products (slug, name, brand, category, gender, frame_shape, material, color, price, description, in_stock, featured, sort_order)
        VALUES ('nomad-wayfarer-stealth-matte', 'Nomad Wayfarer Stealth Matte', 'Mehar Sun', 'sunglasses', 'unisex', 'wayfarer', 'Cellulose Acetate', 'Matte Charcoal / Smoke Polarized', 5900, 'Iconic wayfarer proportions with anti-glare polarized smoke lenses. Can also be fitted with custom prescription sun or Transitions photochromic lenses.', TRUE, TRUE, 5)
        RETURNING id INTO p_id;
        INSERT INTO product_images (product_id, path, alt, position)
        VALUES (p_id, '/images/products/wayfarer-matte.jpg', 'Nomad Wayfarer Stealth Matte', 0);

        -- 6. Lumiere Oval Sterling Silver
        INSERT INTO products (slug, name, brand, category, gender, frame_shape, material, color, price, description, in_stock, featured, sort_order)
        VALUES ('lumiere-oval-sterling-silver', 'Lumiere Oval Sterling Silver', 'Mehar Studio', 'eyeglasses', 'unisex', 'oval', 'Surgical Stainless Steel', 'Polished Sterling Silver', 4600, 'Minimalist ultra-thin oval wire frame weighing under 14 grams. Softens angular jawlines and pairs effortlessly with blue-light filtering lenses.', TRUE, TRUE, 6)
        RETURNING id INTO p_id;
        INSERT INTO product_images (product_id, path, alt, position)
        VALUES (p_id, '/images/products/oval-silver.jpg', 'Lumiere Oval Sterling Silver', 0);

        -- 7. Solaris Navigator Optical
        INSERT INTO products (slug, name, brand, category, gender, frame_shape, material, color, price, description, in_stock, featured, sort_order)
        VALUES ('solaris-aviator-optical-gold', 'Solaris Navigator Optical', 'Mehar Optical', 'eyeglasses', 'men', 'aviator', 'Titanium Alloy', 'Satin Gold', 6200, 'Contemporary double-bar navigator designed specifically for clear prescription and photochromic lenses.', TRUE, FALSE, 7)
        RETURNING id INTO p_id;
        INSERT INTO product_images (product_id, path, alt, position)
        VALUES (p_id, '/images/products/aviator-gold.jpg', 'Solaris Navigator Optical', 0);

        -- 8. Mini Explorer Flex Junior
        INSERT INTO products (slug, name, brand, category, gender, frame_shape, material, color, price, description, in_stock, featured, sort_order)
        VALUES ('mini-explorer-flex-junior', 'Mini Explorer Flex Junior', 'Mehar Kids', 'eyeglasses', 'kids', 'round', 'TR90 Flexible Polymer', 'Tortoise & Warm Caramel', 3500, 'Impact-resistant, bendable TR90 frame built for active kids, paired with scratch-guarded polycarbonate prescription lenses.', TRUE, FALSE, 8)
        RETURNING id INTO p_id;
        INSERT INTO product_images (product_id, path, alt, position)
        VALUES (p_id, '/images/products/round-tortoise.jpg', 'Mini Explorer Flex Junior', 0);
    END IF;
END $$;
