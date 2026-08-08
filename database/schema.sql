-- MiniMart - MySQL 8 schema
-- Four supported languages:
--   vi      Vietnamese (default)
--   en      English
--   zh-Hans Simplified Chinese
--   zh-Hant Traditional Chinese
--
-- All customer-facing text uses utf8mb4. Base tables contain shared data;
-- translation tables contain text that changes with the selected language.

-- Create/select the database before running this file. Production uses:
-- tiemtienloimytran_db with utf8mb4_unicode_ci.

CREATE TABLE IF NOT EXISTS `languages` (
  `code` VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `native_name` VARCHAR(50) NOT NULL,
  `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `sort_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`code`)
) ENGINE = InnoDB;

INSERT INTO `languages`
  (`code`, `name`, `native_name`, `is_default`, `is_active`, `sort_order`)
VALUES
  ('vi', 'Vietnamese', 'Tiếng Việt', TRUE, TRUE, 1),
  ('en', 'English', 'English', FALSE, TRUE, 2),
  ('zh-Hans', 'Simplified Chinese', '简体中文', FALSE, TRUE, 3),
  ('zh-Hant', 'Traditional Chinese', '繁體中文', FALSE, TRUE, 4)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `native_name` = VALUES(`native_name`),
  `is_default` = VALUES(`is_default`),
  `is_active` = VALUES(`is_active`),
  `sort_order` = VALUES(`sort_order`);

-- One row represents one storefront. Keeping this table allows another branch
-- or store to be added later without changing the translation structure.
CREATE TABLE IF NOT EXISTS `sites` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `phone` VARCHAR(30) NOT NULL,
  `currency_code` CHAR(3) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'VND',
  `timezone` VARCHAR(50) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  `logo_url` VARCHAR(1000) NULL,
  `logo_key` VARCHAR(1000) CHARACTER SET ascii COLLATE ascii_bin NULL,
  `cover_image_url` VARCHAR(1000) NULL,
  `cover_image_key` VARCHAR(1000) CHARACTER SET ascii COLLATE ascii_bin NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `site_translations` (
  `site_id` BIGINT UNSIGNED NOT NULL,
  `language_code` VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `tagline` VARCHAR(500) NULL,
  `opening_hours` VARCHAR(255) NULL,
  `address` TEXT NULL,
  `seo_title` VARCHAR(255) NULL,
  `seo_description` VARCHAR(500) NULL,
  PRIMARY KEY (`site_id`, `language_code`),
  CONSTRAINT `fk_site_translations_site`
    FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_site_translations_language`
    FOREIGN KEY (`language_code`) REFERENCES `languages` (`code`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `site_id` BIGINT UNSIGNED NOT NULL,
  `slug` VARCHAR(160) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `sort_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_site_slug` (`site_id`, `slug`),
  KEY `idx_categories_listing` (`site_id`, `is_active`, `sort_order`),
  CONSTRAINT `fk_categories_site`
    FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `category_translations` (
  `category_id` BIGINT UNSIGNED NOT NULL,
  `language_code` VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`category_id`, `language_code`),
  CONSTRAINT `fk_category_translations_category`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_category_translations_language`
    FOREIGN KEY (`language_code`) REFERENCES `languages` (`code`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `slug` VARCHAR(160) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `sku` VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NULL,
  `price` DECIMAL(15, 2) UNSIGNED NOT NULL,
  `image_url` VARCHAR(1000) NULL,
  `image_key` VARCHAR(1000) CHARACTER SET ascii COLLATE ascii_bin NULL,
  `is_sold_out` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `sort_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_slug` (`slug`),
  UNIQUE KEY `uq_products_sku` (`sku`),
  KEY `idx_products_listing` (`category_id`, `is_active`, `sort_order`),
  CONSTRAINT `fk_products_category`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `chk_products_price` CHECK (`price` >= 0)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `password_hash` VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `last_login_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_users_username` (`username`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `product_translations` (
  `product_id` BIGINT UNSIGNED NOT NULL,
  `language_code` VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  PRIMARY KEY (`product_id`, `language_code`),
  FULLTEXT KEY `ft_product_translations_search` (`name`, `description`),
  CONSTRAINT `fk_product_translations_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_product_translations_language`
    FOREIGN KEY (`language_code`) REFERENCES `languages` (`code`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

-- Minimal order model matching the current delivery/pickup checkout dialogs.
-- Prices and product names are copied into order_items so old orders remain
-- correct even if the catalog is edited later.
CREATE TABLE IF NOT EXISTS `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_code` VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `site_id` BIGINT UNSIGNED NOT NULL,
  `language_code` VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `fulfillment_mode` ENUM('delivery', 'pickup') NOT NULL,
  `status` ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(30) NOT NULL,
  `delivery_address` TEXT NULL,
  `customer_note` VARCHAR(500) NULL,
  `currency_code` CHAR(3) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'VND',
  `subtotal` DECIMAL(15, 2) UNSIGNED NOT NULL,
  `total` DECIMAL(15, 2) UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_orders_order_code` (`order_code`),
  KEY `idx_orders_site_created` (`site_id`, `created_at`),
  KEY `idx_orders_status_created` (`status`, `created_at`),
  CONSTRAINT `fk_orders_site`
    FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_orders_language`
    FOREIGN KEY (`language_code`) REFERENCES `languages` (`code`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `chk_orders_subtotal` CHECK (`subtotal` >= 0),
  CONSTRAINT `chk_orders_total` CHECK (`total` >= 0),
  CONSTRAINT `chk_orders_delivery_address` CHECK (
    `fulfillment_mode` = 'pickup'
    OR (`delivery_address` IS NOT NULL AND CHAR_LENGTH(TRIM(`delivery_address`)) > 0)
  )
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `product_image_url` VARCHAR(1000) NULL,
  `unit_price` DECIMAL(15, 2) UNSIGNED NOT NULL,
  `quantity` INT UNSIGNED NOT NULL,
  `line_total` DECIMAL(15, 2) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `chk_order_items_unit_price` CHECK (`unit_price` >= 0),
  CONSTRAINT `chk_order_items_quantity` CHECK (`quantity` > 0),
  CONSTRAINT `chk_order_items_line_total` CHECK (`line_total` = `unit_price` * `quantity`)
) ENGINE = InnoDB;
