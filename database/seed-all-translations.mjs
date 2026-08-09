import "dotenv/config";

import mysql from "mysql2/promise";

import {
  catalogTranslations,
  initialCategories,
  initialSite,
} from "../server/seed-data.mjs";

const requiredEnvironment = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"];
for (const name of requiredEnvironment) {
  if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`);
}

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: "utf8mb4",
});

const missingCategories = [];
const missingProducts = [];

try {
  await connection.beginTransaction();
  const [siteRows] = await connection.query("SELECT id FROM sites ORDER BY id LIMIT 1");
  if (siteRows.length === 0) throw new Error("No site found. Start the application once to initialize the database.");
  const siteId = siteRows[0].id;

  for (const [languageCode, translation] of Object.entries(initialSite.translations)) {
    await connection.execute(
      `INSERT INTO site_translations
        (site_id, language_code, name, tagline, opening_hours, address, seo_title, seo_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         tagline = IF(tagline IS NULL OR tagline = '', VALUES(tagline), tagline),
         opening_hours = IF(opening_hours IS NULL OR opening_hours = '', VALUES(opening_hours), opening_hours),
         address = IF(address IS NULL OR address = '', VALUES(address), address),
         seo_title = VALUES(seo_title),
         seo_description = VALUES(seo_description)`,
      [siteId, languageCode, translation.name, translation.tagline,
        translation.openingHours, translation.address, translation.seoTitle,
        translation.seoDescription],
    );
  }

  for (const category of initialCategories) {
    const [categoryRows] = await connection.execute(
      "SELECT id FROM categories WHERE site_id = ? AND slug = ? LIMIT 1",
      [siteId, category.slug],
    );
    if (categoryRows.length === 0) {
      missingCategories.push(category.slug);
      continue;
    }
    const categoryId = categoryRows[0].id;
    const translations = { vi: category.name, ...catalogTranslations.categories[category.slug] };
    for (const [languageCode, name] of Object.entries(translations)) {
      await connection.execute(
        "INSERT IGNORE INTO category_translations (category_id, language_code, name) VALUES (?, ?, ?)",
        [categoryId, languageCode, name],
      );
    }

    for (const product of category.products) {
      const [slug, viName, viDescription] = product;
      const [productRows] = await connection.execute(
        "SELECT id FROM products WHERE category_id = ? AND slug = ? LIMIT 1",
        [categoryId, slug],
      );
      if (productRows.length === 0) {
        missingProducts.push(slug);
        continue;
      }
      const productId = productRows[0].id;
      const translationsByLanguage = {
        vi: { name: viName, description: viDescription },
        ...catalogTranslations.products[slug],
      };
      for (const [languageCode, translation] of Object.entries(translationsByLanguage)) {
        await connection.execute(
          `INSERT IGNORE INTO product_translations
            (product_id, language_code, name, description)
           VALUES (?, ?, ?, ?)`,
          [productId, languageCode, translation.name, translation.description],
        );
      }
    }
  }

  await connection.commit();

  const [coverage] = await connection.execute(
    `SELECT l.code AS language_code,
            (SELECT COUNT(*) FROM site_translations st WHERE st.site_id = ? AND st.language_code = l.code) AS sites,
            (SELECT COUNT(*) FROM category_translations ct
              INNER JOIN categories c ON c.id = ct.category_id
              WHERE c.site_id = ? AND ct.language_code = l.code) AS categories,
            (SELECT COUNT(*) FROM product_translations pt
              INNER JOIN products p ON p.id = pt.product_id
              INNER JOIN categories c ON c.id = p.category_id
              WHERE c.site_id = ? AND pt.language_code = l.code) AS products
       FROM languages l
      WHERE l.is_active = TRUE
      ORDER BY l.sort_order`,
    [siteId, siteId, siteId],
  );

  console.log(JSON.stringify({ coverage, missingCategories, missingProducts }, null, 2));
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
